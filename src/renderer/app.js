"use strict";

const LOCALE = "en";
const I18N = window.__APP_I18N__?.[LOCALE] ?? {};
const STORAGE_KEY = "teleprompter-mvp-state-v1";
const SPEED_STEP = 0.1;

const DEFAULT_STATE = {
  speed: 3,
  fontSize: 40,
  opacity: 85,
  textColor: "#ffffff",
  bgColor: "#000000",
  text: "",
  alwaysOnTop: false,
};

const state = {
  ...DEFAULT_STATE,
  ...loadState(),
};

const elements = {
  app: document.getElementById("app"),
  editPanel: document.getElementById("editPanel"),
  readPanel: document.getElementById("readPanel"),
  fontSize: document.getElementById("fontSize"),
  fontSizeRead: document.getElementById("fontSizeRead"),
  fontValue: document.getElementById("fontValue"),
  fontReadValue: document.getElementById("fontReadValue"),
  opacity: document.getElementById("opacity"),
  opacityRead: document.getElementById("opacityRead"),
  opacityValue: document.getElementById("opacityValue"),
  opacityReadValue: document.getElementById("opacityReadValue"),
  speed: document.getElementById("speed"),
  speedDown: document.getElementById("speedDown"),
  speedUp: document.getElementById("speedUp"),
  speedValue: document.getElementById("speedValue"),
  textColor: document.getElementById("textColor"),
  textColorRead: document.getElementById("textColorRead"),
  bgColor: document.getElementById("bgColor"),
  bgColorRead: document.getElementById("bgColorRead"),
  textInput: document.getElementById("textInput"),
  alwaysOnTop: document.getElementById("alwaysOnTop"),
  startBtn: document.getElementById("startBtn"),
  readWrap: document.getElementById("readWrap"),
  readText: document.getElementById("readText"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  speedRead: document.getElementById("speedRead"),
  speedReadDown: document.getElementById("speedReadDown"),
  speedReadUp: document.getElementById("speedReadUp"),
  speedReadValue: document.getElementById("speedReadValue"),
  alwaysOnTopRead: document.getElementById("alwaysOnTopRead"),
  editBtn: document.getElementById("editBtn"),
};

let mode = "edit";
let playing = false;
let scrollPos = 0;
let containerHeight = 0;
let animFrame = null;
let lastTs = null;

init().catch(() => {
  applyI18n();
  applyStateToUi();
  applyVisualState();
});

async function init() {
  applyI18n();
  bindEvents();
  applyStateToUi();
  applyVisualState();

  if (window.windowControls?.setAlwaysOnTop) {
    try {
      const applied = await window.windowControls.setAlwaysOnTop(
        state.alwaysOnTop,
      );
      state.alwaysOnTop = Boolean(applied);
      syncAlwaysOnTopInputs();
      saveState();
    } catch {}
  }
}

function applyI18n() {
  document.title = t("meta.title");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    const raw = node.getAttribute("data-i18n-attr");
    if (!raw) return;

    raw
      .split(";")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .forEach((segment) => {
        const [attr, key] = segment.split(":").map((part) => part.trim());
        if (!attr || !key) return;
        node.setAttribute(attr, t(key));
      });
  });
}

function bindEvents() {
  elements.fontSize.addEventListener("input", (event) => {
    setFontSize(Number(event.target.value));
  });

  elements.fontSizeRead.addEventListener("input", (event) => {
    setFontSize(Number(event.target.value));
  });

  elements.opacity.addEventListener("input", (event) => {
    setOpacity(Number(event.target.value));
  });

  elements.opacityRead.addEventListener("input", (event) => {
    setOpacity(Number(event.target.value));
  });

  elements.speed.addEventListener("input", (event) => {
    updateSpeed(Number(event.target.value));
  });

  elements.speedRead.addEventListener("input", (event) => {
    updateSpeed(Number(event.target.value));
  });

  elements.speedDown.addEventListener("click", () => {
    stepSpeed(-SPEED_STEP);
  });

  elements.speedUp.addEventListener("click", () => {
    stepSpeed(SPEED_STEP);
  });

  elements.speedReadDown.addEventListener("click", () => {
    stepSpeed(-SPEED_STEP);
  });

  elements.speedReadUp.addEventListener("click", () => {
    stepSpeed(SPEED_STEP);
  });

  elements.textColor.addEventListener("input", (event) => {
    setTextColor(event.target.value);
  });

  elements.textColorRead.addEventListener("input", (event) => {
    setTextColor(event.target.value);
  });

  elements.bgColor.addEventListener("input", (event) => {
    setBackgroundColor(event.target.value);
  });

  elements.bgColorRead.addEventListener("input", (event) => {
    setBackgroundColor(event.target.value);
  });

  elements.textInput.addEventListener("input", (event) => {
    state.text = event.target.value;
    saveState();
  });

  elements.readText.addEventListener("input", () => {
    const nextText = getReadTextValue();
    state.text = nextText;
    elements.textInput.value = nextText;
    saveState();
  });

  elements.readText.addEventListener("focus", () => {
    if (mode !== "read" || !playing) return;
    playing = false;
    stopAnimation();
    updatePlayPauseLabel();
  });

  elements.alwaysOnTop.addEventListener("change", (event) => {
    void updateAlwaysOnTop(event.target.checked);
  });

  elements.alwaysOnTopRead.addEventListener("change", (event) => {
    void updateAlwaysOnTop(event.target.checked);
  });

  elements.startBtn.addEventListener("click", startReadMode);
  elements.playPauseBtn.addEventListener("click", togglePlayPause);
  elements.resetBtn.addEventListener("click", resetRead);
  elements.editBtn.addEventListener("click", goToEditMode);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("beforeunload", stopAnimation);
}

function applyStateToUi() {
  elements.fontSize.value = String(state.fontSize);
  elements.fontSizeRead.value = String(state.fontSize);
  elements.opacity.value = String(state.opacity);
  elements.opacityRead.value = String(state.opacity);
  elements.speed.value = String(state.speed);
  elements.speedRead.value = String(state.speed);
  elements.textColor.value = state.textColor;
  elements.textColorRead.value = state.textColor;
  elements.bgColor.value = state.bgColor;
  elements.bgColorRead.value = state.bgColor;
  elements.textInput.value = state.text;

  elements.fontValue.textContent = `${state.fontSize}${t("units.px")}`;
  elements.fontReadValue.textContent = `${state.fontSize}${t("units.px")}`;
  elements.opacityValue.textContent = `${state.opacity}${t("units.percent")}`;
  elements.opacityReadValue.textContent = `${state.opacity}${t("units.percent")}`;
  elements.speedValue.textContent = `${state.speed}${t("units.speed")}`;
  elements.speedReadValue.textContent = `${state.speed}${t("units.speed")}`;

  updatePlayPauseLabel();
  syncAlwaysOnTopInputs();
}

function setFontSize(nextFontSize) {
  state.fontSize = normalizeFontSize(nextFontSize);
  const displayValue = `${state.fontSize}${t("units.px")}`;

  elements.fontSize.value = String(state.fontSize);
  elements.fontSizeRead.value = String(state.fontSize);
  elements.fontValue.textContent = displayValue;
  elements.fontReadValue.textContent = displayValue;

  applyVisualState();

  if (mode === "read") {
    containerHeight = elements.readWrap.clientHeight;
  }

  saveState();
}

function setOpacity(nextOpacity) {
  state.opacity = normalizeOpacity(nextOpacity);
  const displayValue = `${state.opacity}${t("units.percent")}`;

  elements.opacity.value = String(state.opacity);
  elements.opacityRead.value = String(state.opacity);
  elements.opacityValue.textContent = displayValue;
  elements.opacityReadValue.textContent = displayValue;

  applyVisualState();
  saveState();
}

function setTextColor(nextTextColor) {
  if (!isHexColor(nextTextColor)) return;

  state.textColor = nextTextColor;
  elements.textColor.value = state.textColor;
  elements.textColorRead.value = state.textColor;

  applyVisualState();
  saveState();
}

function setBackgroundColor(nextBackgroundColor) {
  if (!isHexColor(nextBackgroundColor)) return;

  state.bgColor = nextBackgroundColor;
  elements.bgColor.value = state.bgColor;
  elements.bgColorRead.value = state.bgColor;

  applyVisualState();
  saveState();
}

function applyVisualState() {
  const rgb = hexToRgb(state.bgColor);

  elements.app.style.setProperty("--tp-font-size", `${state.fontSize}px`);
  elements.app.style.setProperty("--tp-text-color", state.textColor);
  elements.app.style.setProperty("--tp-bg-r", String(rgb.r));
  elements.app.style.setProperty("--tp-bg-g", String(rgb.g));
  elements.app.style.setProperty("--tp-bg-b", String(rgb.b));
  elements.app.style.setProperty("--tp-opacity", String(state.opacity / 100));
}

function startReadMode() {
  state.text = elements.textInput.value;
  saveState();

  mode = "read";
  scrollPos = 0;

  elements.editPanel.classList.add("hidden");
  elements.readPanel.classList.remove("hidden");

  elements.readText.textContent = state.text;

  requestAnimationFrame(() => {
    containerHeight = elements.readWrap.clientHeight;
    setReadOffset(containerHeight);
    playing = true;
    updatePlayPauseLabel();
    startAnimation();
  });
}

function goToEditMode() {
  if (mode === "read") {
    state.text = getReadTextValue();
    saveState();
  }

  stopAnimation();
  mode = "edit";
  elements.readPanel.classList.add("hidden");
  elements.editPanel.classList.remove("hidden");
  elements.textInput.value = state.text;
}

function togglePlayPause() {
  playing = !playing;
  updatePlayPauseLabel();

  if (playing) {
    startAnimation();
  } else {
    stopAnimation();
  }
}

function resetRead() {
  stopAnimation();
  scrollPos = 0;
  setReadOffset(containerHeight);
  playing = false;
  updatePlayPauseLabel();
}

function startAnimation() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
  }

  lastTs = null;

  const tick = (timestamp) => {
    if (!playing) {
      return;
    }

    if (!lastTs) {
      lastTs = timestamp;
    }

    const delta = Math.min(timestamp - lastTs, 100);
    lastTs = timestamp;

    scrollPos += ((state.speed * 30) / 1000) * delta;
    const offset = containerHeight - scrollPos;
    setReadOffset(offset);

    if (offset < -(elements.readText.offsetHeight + 40)) {
      playing = false;
      updatePlayPauseLabel();
      return;
    }

    animFrame = requestAnimationFrame(tick);
  };

  animFrame = requestAnimationFrame(tick);
}

function stopAnimation() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}

function setReadOffset(offset) {
  elements.readText.style.transform = `translateY(${offset}px)`;
}

function updatePlayPauseLabel() {
  elements.playPauseBtn.textContent = playing
    ? t("controls.pause")
    : t("controls.play");
}

function updateSpeed(nextSpeed) {
  state.speed = normalizeSpeed(nextSpeed);
  elements.speed.value = String(state.speed);
  elements.speedRead.value = String(state.speed);
  elements.speedValue.textContent = `${state.speed}${t("units.speed")}`;
  elements.speedReadValue.textContent = `${state.speed}${t("units.speed")}`;
  saveState();
}

function stepSpeed(delta) {
  updateSpeed(state.speed + delta);
}

function normalizeSpeed(value) {
  const clamped = Math.min(20, Math.max(0.1, value));
  return Math.round(clamped * 10) / 10;
}

function normalizeFontSize(value) {
  const clamped = Math.min(120, Math.max(16, value));
  return Math.round(clamped);
}

function normalizeOpacity(value) {
  const clamped = Math.min(100, Math.max(0, value));
  return Math.round(clamped);
}

function onKeyDown(event) {
  if (mode !== "read") {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    togglePlayPause();
    return;
  }

  if (event.code === "ArrowUp") {
    event.preventDefault();
    stepSpeed(SPEED_STEP);
    return;
  }

  if (event.code === "ArrowDown") {
    event.preventDefault();
    stepSpeed(-SPEED_STEP);
    return;
  }

  if (event.code === "Escape") {
    event.preventDefault();
    goToEditMode();
  }
}

async function updateAlwaysOnTop(nextValue) {
  state.alwaysOnTop = Boolean(nextValue);

  if (window.windowControls?.setAlwaysOnTop) {
    try {
      const applied = await window.windowControls.setAlwaysOnTop(
        state.alwaysOnTop,
      );
      state.alwaysOnTop = Boolean(applied);
    } catch {}
  }

  syncAlwaysOnTopInputs();
  saveState();
}

function syncAlwaysOnTopInputs() {
  elements.alwaysOnTop.checked = state.alwaysOnTop;
  elements.alwaysOnTopRead.checked = state.alwaysOnTop;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return {
      speed: normalizeSpeed(Number(parsed.speed ?? DEFAULT_STATE.speed)),
      fontSize: Math.min(
        120,
        Math.max(16, Number(parsed.fontSize ?? DEFAULT_STATE.fontSize)),
      ),
      opacity: Math.min(
        100,
        Math.max(0, Number(parsed.opacity ?? DEFAULT_STATE.opacity)),
      ),
      textColor: isHexColor(parsed.textColor)
        ? parsed.textColor
        : DEFAULT_STATE.textColor,
      bgColor: isHexColor(parsed.bgColor)
        ? parsed.bgColor
        : DEFAULT_STATE.bgColor,
      text: typeof parsed.text === "string" ? parsed.text : DEFAULT_STATE.text,
      alwaysOnTop: Boolean(parsed.alwaysOnTop),
    };
  } catch {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function t(key) {
  return I18N[key] ?? key;
}

function getReadTextValue() {
  return (elements.readText.innerText || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\n$/, "");
}

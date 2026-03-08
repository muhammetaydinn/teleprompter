"use strict";

const LOCALE = "en";
const I18N = window.__APP_I18N__?.[LOCALE] ?? {};
const STORAGE_KEY = "teleprompter-mvp-state-v1";
const SPEED_STEP = 0.1;
const FONT_STEP = 1;
const OPACITY_STEP = 1;

const DEFAULT_STATE = {
  speed: 3,
  fontSize: 40,
  opacity: 85,
  textColor: "#ffffff",
  bgColor: "#000000",
  text: "",
  alwaysOnTop: false,
  controlsVisible: true,
};

const state = {
  ...DEFAULT_STATE,
  ...loadState(),
};

const elements = {
  app: document.getElementById("app"),
  fontDown: document.getElementById("fontDown"),
  fontUp: document.getElementById("fontUp"),
  fontValue: document.getElementById("fontValue"),
  opacityDown: document.getElementById("opacityDown"),
  opacityUp: document.getElementById("opacityUp"),
  opacityValue: document.getElementById("opacityValue"),
  speedDown: document.getElementById("speedDown"),
  speedUp: document.getElementById("speedUp"),
  speedValue: document.getElementById("speedValue"),
  textColor: document.getElementById("textColor"),
  bgColor: document.getElementById("bgColor"),
  alwaysOnTop: document.getElementById("alwaysOnTop"),
  readWrap: document.getElementById("readWrap"),
  readText: document.getElementById("readText"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  toggleEditorBtn: document.getElementById("toggleEditorBtn"),
  toggleableControls: Array.from(
    document.querySelectorAll(".toggleable-control"),
  ),
};

let playing = false;
let scrollPos = 0;
let containerHeight = 0;
let animFrame = null;
let lastTs = null;

init().catch(() => {
  applyI18n();
  applyStateToUi();
  applyVisualState();
  syncEditorVisibility();
  syncReadEditability();
  updatePlayPauseLabel();
});

async function init() {
  applyI18n();
  bindEvents();
  applyStateToUi();
  applyVisualState();
  syncReadText();
  syncEditorVisibility();
  syncReadEditability();

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

  requestAnimationFrame(() => {
    refreshReadViewport();
  });
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
  elements.fontDown.addEventListener("click", () => {
    stepFontSize(-FONT_STEP);
  });

  elements.fontUp.addEventListener("click", () => {
    stepFontSize(FONT_STEP);
  });

  elements.opacityDown.addEventListener("click", () => {
    stepOpacity(-OPACITY_STEP);
  });

  elements.opacityUp.addEventListener("click", () => {
    stepOpacity(OPACITY_STEP);
  });

  elements.speedDown.addEventListener("click", () => {
    stepSpeed(-SPEED_STEP);
  });

  elements.speedUp.addEventListener("click", () => {
    stepSpeed(SPEED_STEP);
  });

  elements.textColor.addEventListener("input", (event) => {
    setTextColor(event.target.value);
  });

  elements.bgColor.addEventListener("input", (event) => {
    setBackgroundColor(event.target.value);
  });

  elements.readText.addEventListener("input", () => {
    state.text = getReadTextValue();
    saveState();

    requestAnimationFrame(() => {
      refreshReadViewport();
    });
  });

  elements.readWrap.addEventListener("wheel", onReadWrapWheel, {
    passive: false,
  });

  elements.alwaysOnTop.addEventListener("change", (event) => {
    void updateAlwaysOnTop(event.target.checked);
  });

  elements.playPauseBtn.addEventListener("click", togglePlayPause);
  elements.resetBtn.addEventListener("click", resetRead);
  elements.toggleEditorBtn.addEventListener("click", () => {
    toggleEditor();
  });

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("beforeunload", stopAnimation);
}

function applyStateToUi() {
  elements.textColor.value = state.textColor;
  elements.bgColor.value = state.bgColor;

  elements.fontValue.textContent = `${state.fontSize}${t("units.px")}`;
  elements.opacityValue.textContent = `${state.opacity}${t("units.percent")}`;
  elements.speedValue.textContent = `${state.speed}${t("units.speed")}`;

  syncAlwaysOnTopInputs();
  updatePlayPauseLabel();
  updateToggleEditorLabel();
}

function setFontSize(nextFontSize) {
  state.fontSize = normalizeFontSize(nextFontSize);
  elements.fontValue.textContent = `${state.fontSize}${t("units.px")}`;
  applyVisualState();
  saveState();
}

function stepFontSize(delta) {
  setFontSize(state.fontSize + delta);
}

function setOpacity(nextOpacity) {
  state.opacity = normalizeOpacity(nextOpacity);
  elements.opacityValue.textContent = `${state.opacity}${t("units.percent")}`;
  applyVisualState();
  saveState();
}

function stepOpacity(delta) {
  setOpacity(state.opacity + delta);
}

function setTextColor(nextTextColor) {
  if (!isHexColor(nextTextColor)) return;

  state.textColor = nextTextColor;
  elements.textColor.value = state.textColor;
  applyVisualState();
  saveState();
}

function setBackgroundColor(nextBackgroundColor) {
  if (!isHexColor(nextBackgroundColor)) return;

  state.bgColor = nextBackgroundColor;
  elements.bgColor.value = state.bgColor;
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

function syncReadText() {
  elements.readText.textContent = state.text || " ";
}

function togglePlayPause() {
  playing = !playing;
  syncReadEditability();
  updatePlayPauseLabel();

  if (playing) {
    startAnimation();
  } else {
    stopAnimation();
  }
}

function resetRead() {
  stopAnimation();
  playing = false;
  syncReadEditability();
  scrollPos = 0;
  refreshReadViewport();
  updatePlayPauseLabel();
}

function startAnimation() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
  }

  refreshReadViewport();
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

function refreshReadViewport() {
  containerHeight = elements.readWrap.clientHeight;
  setReadOffset(containerHeight - scrollPos);
}

function onReadWrapWheel(event) {
  if (playing) {
    return;
  }

  if (containerHeight <= 0) {
    refreshReadViewport();
  }

  event.preventDefault();
  scrollPos = clampScrollPos(scrollPos + event.deltaY);
  setReadOffset(containerHeight - scrollPos);
}

function clampScrollPos(nextValue) {
  const maxScrollPos = Math.max(
    0,
    containerHeight + elements.readText.offsetHeight + 40,
  );
  return Math.min(maxScrollPos, Math.max(0, nextValue));
}

function updatePlayPauseLabel() {
  elements.playPauseBtn.textContent = playing
    ? t("controls.pause")
    : t("controls.play");
}

function syncReadEditability() {
  const editable = !playing;
  elements.readText.setAttribute(
    "contenteditable",
    editable ? "true" : "false",
  );
  elements.readText.setAttribute("spellcheck", "false");
  elements.readText.setAttribute("autocorrect", "off");
  elements.readText.setAttribute("autocapitalize", "off");

  if (!editable && document.activeElement === elements.readText) {
    elements.readText.blur();
  }
}

function updateSpeed(nextSpeed) {
  state.speed = normalizeSpeed(nextSpeed);
  elements.speedValue.textContent = `${state.speed}${t("units.speed")}`;
  saveState();
}

function stepSpeed(delta) {
  updateSpeed(state.speed + delta);
}

function toggleEditor(forceVisible) {
  const targetReadHeight = elements.readWrap.clientHeight;
  const nextVisible =
    typeof forceVisible === "boolean" ? forceVisible : !state.controlsVisible;

  state.controlsVisible = nextVisible;
  syncEditorVisibility(targetReadHeight);
  saveState();
}

function syncEditorVisibility(targetReadHeight) {
  elements.toggleableControls.forEach((node) => {
    node.classList.toggle("hidden", !state.controlsVisible);
  });

  updateToggleEditorLabel();

  requestAnimationFrame(() => {
    if (typeof targetReadHeight === "number") {
      const readHeightDelta = elements.readWrap.clientHeight - targetReadHeight;
      if (Math.abs(readHeightDelta) >= 1) {
        void adjustWindowHeightByReadDelta(readHeightDelta);
      }
    }

    refreshReadViewport();
  });
}

async function adjustWindowHeightByReadDelta(readHeightDelta) {
  if (!window.windowControls?.adjustHeight) {
    return;
  }

  const windowHeightDelta = -Math.round(readHeightDelta);
  if (windowHeightDelta === 0) {
    return;
  }

  try {
    await window.windowControls.adjustHeight(windowHeightDelta);
  } catch {}
}

function updateToggleEditorLabel() {
  elements.toggleEditorBtn.textContent = state.controlsVisible
    ? t("actions.hideEditor")
    : t("actions.showEditor");
}

function normalizeSpeed(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STATE.speed;
  }

  const clamped = Math.min(20, Math.max(0.1, value));
  return Math.round(clamped * 10) / 10;
}

function normalizeFontSize(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STATE.fontSize;
  }

  const clamped = Math.min(120, Math.max(16, value));
  return Math.round(clamped);
}

function normalizeOpacity(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STATE.opacity;
  }

  const clamped = Math.min(100, Math.max(0, value));
  return Math.round(clamped);
}

function onKeyDown(event) {
  const target = event.target;
  const isFormControl =
    target instanceof HTMLElement &&
    (target.tagName === "TEXTAREA" ||
      target.tagName === "INPUT" ||
      target.isContentEditable);

  if (isFormControl) {
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
    toggleEditor();
  }
}

function onResize() {
  refreshReadViewport();
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
      fontSize: normalizeFontSize(
        Number(parsed.fontSize ?? DEFAULT_STATE.fontSize),
      ),
      opacity: normalizeOpacity(
        Number(parsed.opacity ?? DEFAULT_STATE.opacity),
      ),
      textColor: isHexColor(parsed.textColor)
        ? parsed.textColor
        : DEFAULT_STATE.textColor,
      bgColor: isHexColor(parsed.bgColor)
        ? parsed.bgColor
        : DEFAULT_STATE.bgColor,
      text: typeof parsed.text === "string" ? parsed.text : DEFAULT_STATE.text,
      alwaysOnTop: Boolean(parsed.alwaysOnTop),
      controlsVisible:
        typeof parsed.controlsVisible === "boolean"
          ? parsed.controlsVisible
          : DEFAULT_STATE.controlsVisible,
    };
  } catch {
    return {};
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
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

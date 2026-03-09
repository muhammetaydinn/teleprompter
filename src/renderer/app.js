import {
  DEFAULT_STATE,
  FONT_STEP,
  LOCALE,
  OPACITY_STEP,
  SPEED_STEP,
  STORAGE_KEY,
} from "./modules/config.js";
import { bindStepButtonHold, bindStepInput } from "./modules/controls.js";
import {
  getReadTextValue,
  hexToRgb,
  isHexColor,
  normalizeFontSize,
  normalizeOpacity,
  normalizeSpeed,
} from "./modules/helpers.js";
import { applyI18nToDocument, createTranslator } from "./modules/i18n.js";
import { createScrollEngine } from "./modules/scrolling.js";
import {
  adjustWindowHeight,
  setAlwaysOnTop,
} from "./modules/window-controls.js";

const t = createTranslator(LOCALE);

const state = {
  ...DEFAULT_STATE,
  ...loadState(),
};

const elements = {
  app: document.getElementById("app"),
  fontDown: document.getElementById("fontDown"),
  fontUp: document.getElementById("fontUp"),
  fontValueInput: document.getElementById("fontValueInput"),
  opacityDown: document.getElementById("opacityDown"),
  opacityUp: document.getElementById("opacityUp"),
  opacityValueInput: document.getElementById("opacityValueInput"),
  speedDown: document.getElementById("speedDown"),
  speedUp: document.getElementById("speedUp"),
  speedValueInput: document.getElementById("speedValueInput"),
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

const scrollEngine = createScrollEngine({
  readWrapElement: elements.readWrap,
  readTextElement: elements.readText,
  getSpeed: () => state.speed,
});

init().catch(() => {
  applyI18nToDocument(t);
  applyStateToUi();
  applyVisualState();
  syncEditorVisibility();
  syncReadEditability();
  updatePlayPauseLabel();
});

async function init() {
  applyI18nToDocument(t);
  bindEvents();
  applyStateToUi();
  applyVisualState();
  syncReadText();
  syncEditorVisibility();
  syncReadEditability();

  state.alwaysOnTop = await setAlwaysOnTop(state.alwaysOnTop);
  syncAlwaysOnTopInputs();
  saveState();

  requestAnimationFrame(() => {
    refreshReadViewport();
  });
}

function bindEvents() {
  bindStepButtonHold(elements.fontDown, () => {
    stepFontSize(-FONT_STEP);
  });

  bindStepButtonHold(elements.fontUp, () => {
    stepFontSize(FONT_STEP);
  });

  bindStepButtonHold(elements.opacityDown, () => {
    stepOpacity(-OPACITY_STEP);
  });

  bindStepButtonHold(elements.opacityUp, () => {
    stepOpacity(OPACITY_STEP);
  });

  bindStepInput(
    elements.fontValueInput,
    (nextValue) => setFontSize(nextValue),
    () => state.fontSize,
  );

  bindStepInput(
    elements.opacityValueInput,
    (nextValue) => setOpacity(nextValue),
    () => state.opacity,
  );

  bindStepInput(
    elements.speedValueInput,
    (nextValue) => updateSpeed(nextValue),
    () => state.speed,
  );

  bindStepButtonHold(elements.speedDown, () => {
    stepSpeed(-SPEED_STEP);
  });

  bindStepButtonHold(elements.speedUp, () => {
    stepSpeed(SPEED_STEP);
  });

  elements.textColor.addEventListener("input", (event) => {
    setTextColor(event.target.value);
  });

  elements.bgColor.addEventListener("input", (event) => {
    setBackgroundColor(event.target.value);
  });

  elements.readText.addEventListener("input", () => {
    state.text = getReadTextValue(elements.readText);
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
  window.addEventListener("beforeunload", cleanupScrollEngine);
}

function applyStateToUi() {
  elements.textColor.value = state.textColor;
  elements.bgColor.value = state.bgColor;

  elements.fontValueInput.value = String(state.fontSize);
  elements.opacityValueInput.value = String(state.opacity);
  elements.speedValueInput.value = String(state.speed);

  syncAlwaysOnTopInputs();
  updatePlayPauseLabel();
  updateToggleEditorLabel();
}

function setFontSize(nextFontSize) {
  state.fontSize = normalizeFontSize(nextFontSize);
  elements.fontValueInput.value = String(state.fontSize);
  applyVisualState();
  saveState();
}

function stepFontSize(delta) {
  setFontSize(state.fontSize + delta);
}

function setOpacity(nextOpacity) {
  state.opacity = normalizeOpacity(nextOpacity);
  elements.opacityValueInput.value = String(state.opacity);
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
  scrollEngine.toggle(() => {
    syncReadEditability();
    updatePlayPauseLabel();
  });
  syncReadEditability();
  updatePlayPauseLabel();
}

function resetRead() {
  scrollEngine.reset();
  syncReadEditability();
  refreshReadViewport();
  updatePlayPauseLabel();
}

function refreshReadViewport() {
  scrollEngine.refreshViewport();
}

function onReadWrapWheel(event) {
  if (scrollEngine.isPlaying()) {
    return;
  }

  event.preventDefault();
  scrollEngine.handleWheel(event.deltaY);
}

function cleanupScrollEngine() {
  scrollEngine.cleanup();
}

function updatePlayPauseLabel() {
  elements.playPauseBtn.textContent = scrollEngine.isPlaying()
    ? t("controls.pause")
    : t("controls.play");
}

function syncReadEditability() {
  const editable = !scrollEngine.isPlaying();
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
  elements.speedValueInput.value = String(state.speed);
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
  const windowHeightDelta = -Math.round(readHeightDelta);
  if (windowHeightDelta === 0) {
    return;
  }

  await adjustWindowHeight(windowHeightDelta);
}

function updateToggleEditorLabel() {
  elements.toggleEditorBtn.textContent = state.controlsVisible
    ? t("actions.hideEditor")
    : t("actions.showEditor");
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
  state.alwaysOnTop = await setAlwaysOnTop(nextValue);

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

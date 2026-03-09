import { HOLD_START_DELAY_MS, HOLD_REPEAT_INTERVAL_MS } from "./config.js";

export function bindStepInput(inputElement, applyValue, getCurrentValue) {
  const commit = () => {
    const parsed = Number(inputElement.value);
    if (Number.isFinite(parsed)) {
      applyValue(parsed);
    } else {
      inputElement.value = String(getCurrentValue());
    }
  };

  inputElement.addEventListener("change", commit);
  inputElement.addEventListener("blur", commit);
  inputElement.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    commit();
    inputElement.blur();
  });
}

export function bindStepButtonHold(buttonElement, applyStep) {
  let holdTimeoutId = null;
  let holdIntervalId = null;
  let didRepeat = false;

  const clearHold = () => {
    if (holdTimeoutId !== null) {
      window.clearTimeout(holdTimeoutId);
      holdTimeoutId = null;
    }

    if (holdIntervalId !== null) {
      window.clearInterval(holdIntervalId);
      holdIntervalId = null;
    }
  };

  const startHold = () => {
    clearHold();
    didRepeat = false;

    holdTimeoutId = window.setTimeout(() => {
      didRepeat = true;
      applyStep();

      holdIntervalId = window.setInterval(() => {
        applyStep();
      }, HOLD_REPEAT_INTERVAL_MS);
    }, HOLD_START_DELAY_MS);
  };

  buttonElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    startHold();
  });

  buttonElement.addEventListener("pointerup", clearHold);
  buttonElement.addEventListener("pointercancel", clearHold);
  buttonElement.addEventListener("pointerleave", clearHold);

  buttonElement.addEventListener("click", (event) => {
    if (didRepeat) {
      event.preventDefault();
      didRepeat = false;
      return;
    }

    applyStep();
  });

  window.addEventListener("blur", () => {
    clearHold();
    didRepeat = false;
  });
}

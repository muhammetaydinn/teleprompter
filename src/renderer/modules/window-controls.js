export async function setAlwaysOnTop(enabled) {
  const nextValue = Boolean(enabled);

  if (!window.windowControls?.setAlwaysOnTop) {
    return nextValue;
  }

  try {
    const applied = await window.windowControls.setAlwaysOnTop(nextValue);
    return Boolean(applied);
  } catch {
    return nextValue;
  }
}

export async function adjustWindowHeight(deltaHeight) {
  if (!window.windowControls?.adjustHeight) {
    return null;
  }

  try {
    return await window.windowControls.adjustHeight(deltaHeight);
  } catch {
    return null;
  }
}

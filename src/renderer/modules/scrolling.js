export function createScrollEngine({
  readWrapElement,
  readTextElement,
  getSpeed,
}) {
  let scrollPos = 0;
  let containerHeight = 0;
  let animFrame = null;
  let lastTimestamp = null;
  let playing = false;

  function setReadOffset(offset) {
    readTextElement.style.transform = `translateY(${offset}px)`;
  }

  function refreshViewport() {
    containerHeight = readWrapElement.clientHeight;
    setReadOffset(containerHeight - scrollPos);
  }

  function clampScrollPos(nextValue) {
    const maxScrollPos = Math.max(
      0,
      containerHeight + readTextElement.offsetHeight + 40,
    );

    return Math.min(maxScrollPos, Math.max(0, nextValue));
  }

  function stop() {
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  }

  function start(onAutoStop) {
    stop();
    refreshViewport();
    lastTimestamp = null;

    const tick = (timestamp) => {
      if (!playing) {
        return;
      }

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = Math.min(timestamp - lastTimestamp, 100);
      lastTimestamp = timestamp;

      const speed = Number(getSpeed());
      const safeSpeed = Number.isFinite(speed) ? speed : 0;

      scrollPos += ((safeSpeed * 30) / 1000) * delta;
      const offset = containerHeight - scrollPos;
      setReadOffset(offset);

      if (offset < -(readTextElement.offsetHeight + 40)) {
        playing = false;
        if (typeof onAutoStop === "function") {
          onAutoStop();
        }
        return;
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
  }

  function setPlaying(nextPlaying, onAutoStop) {
    const shouldPlay = Boolean(nextPlaying);

    if (shouldPlay === playing) {
      return playing;
    }

    playing = shouldPlay;
    if (playing) {
      start(onAutoStop);
    } else {
      stop();
    }

    return playing;
  }

  function toggle(onAutoStop) {
    return setPlaying(!playing, onAutoStop);
  }

  function reset() {
    stop();
    playing = false;
    scrollPos = 0;
    refreshViewport();
    return playing;
  }

  function handleWheel(deltaY) {
    if (playing) {
      return false;
    }

    if (containerHeight <= 0) {
      refreshViewport();
    }

    scrollPos = clampScrollPos(scrollPos + deltaY);
    setReadOffset(containerHeight - scrollPos);
    return true;
  }

  function isPlaying() {
    return playing;
  }

  function cleanup() {
    stop();
  }

  return {
    cleanup,
    handleWheel,
    isPlaying,
    refreshViewport,
    reset,
    setPlaying,
    toggle,
  };
}

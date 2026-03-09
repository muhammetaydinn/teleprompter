import { DEFAULT_STATE } from "./config.js";

export function normalizeSpeed(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STATE.speed;
  }

  const clamped = Math.min(20, Math.max(0.1, value));
  return Math.round(clamped * 10) / 10;
}

export function normalizeFontSize(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STATE.fontSize;
  }

  const clamped = Math.min(120, Math.max(16, value));
  return Math.round(clamped);
}

export function normalizeOpacity(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STATE.opacity;
  }

  const clamped = Math.min(100, Math.max(0, value));
  return Math.round(clamped);
}

export function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function getReadTextValue(node) {
  return (node?.innerText || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\n$/, "");
}

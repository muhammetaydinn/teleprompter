# Teleprompter Project Review

**Date:** 2026-03-09  
**Scope:** Current desktop MVP implementation status and architecture snapshot

---

## 1) What This Project Is

This repository now contains a desktop-first teleprompter MVP built with Electron.
It focuses on script writing, read-mode scrolling, speed control, visual customization, always-on-top behavior, and local persistence.

---

## 2) Current Architecture

- `src/main.js`
  - Electron main process
  - BrowserWindow lifecycle
  - IPC handlers for always-on-top control

- `src/preload.js`
  - Secure bridge (`windowControls`) between renderer and main process
  - Exposes always-on-top methods

- `src/renderer/index.html`
  - Edit mode and read mode layout
  - UI nodes use i18n keys (`data-i18n`, `data-i18n-attr`)

- `src/renderer/app.js`
  - Teleprompter behavior (mode switch, playback, animation loop)
  - Speed slider + `+/-` step controls
  - Keyboard shortcuts and persistence
  - Runtime i18n key resolution and UI text binding

- `src/renderer/i18n/en.js`
  - Centralized English dictionary for user-facing strings

---

## 3) Implemented MVP Features

- Script input and editing
- Start/read mode with bottom-to-top scroll
- Play/Pause/Reset controls
- Speed controls via slider, keyboard, and `+/-` step buttons
- Font size, opacity, text color, background color
- Always-on-top toggle
- Read-mode script editing after Start
- Persistent local state across restarts
- i18n-ready UI text system with centralized English resource

---

## 4) Notes

- Source-level Turkish UI strings were removed from runtime files.
- All user-facing app strings are now centralized in `src/renderer/i18n/en.js`.
- The project is prepared for adding additional locale files without restructuring the core UI logic.

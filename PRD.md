# Teleprompter Desktop App — MVP PRD

**Date:** 2026-03-09  
**Version:** 0.2 (MVP, i18n-ready)  
**Status:** Draft approved for implementation

---

## 1. Product Summary

This project is a browser-independent desktop teleprompter application.
Users write or paste a script, switch to read mode, and scroll text from bottom to top.

MVP goal: **a stable, simple, cross-platform teleprompter for Windows, macOS, and Linux**.

---

## 2. Problem Statement

Browser-based overlays can break due to CSP limitations, site-level CSS/JS conflicts, and restricted pages.
A desktop-first architecture removes these external constraints and delivers predictable behavior.

---

## 3. MVP Goals

1. Consistent behavior across all core operating systems.
2. Fast start-to-use flow (open app → paste script → start).
3. Persistent local storage for script and settings.
4. Smooth scrolling performance for long reading sessions.

---

## 4. MVP Scope

### 4.1 Required Features

- Multi-line script input inside the app.
- Two modes:
  - **Edit mode** (script + settings)
  - **Read mode** (scrolling text + controls)
- Playback controls: Play/Pause, Reset.
- Speed control: slider + incremental `+/-` adjustment.
- Visual settings: font size, text color, background color, opacity.
- Window behavior: resizable, draggable, optionally always on top.
- Keyboard shortcuts:
  - `Space` → Play/Pause
  - `ArrowUp` → Increase speed
  - `ArrowDown` → Decrease speed
  - `Esc` → Exit read mode
- Persistent state after app restart.
- Read-mode script editing (script can be edited after pressing Start).
- i18n-ready text architecture using a centralized English language resource.

### 4.2 Out of Scope (Post-MVP)

- Cloud sync
- Multi-script library management
- Remote control from mobile
- Mirror mode
- Speech-sync automation
- Collaboration and sharing workflows

---

## 5. Target Users

- Content creators
- Online presenters
- Educators and video producers

---

## 6. Platform Support

MVP target platforms:

- **Windows:** 10+
- **macOS:** 13+
- **Linux:** Ubuntu 22.04+ (reference distro)

---

## 7. UX Flow (MVP)

1. Open app.
2. Type or paste script.
3. Configure font, opacity, colors, and speed.
4. Press Start to switch to read mode.
5. Text scrolls bottom-to-top.
6. Control with Play/Pause, Reset, speed slider, and `+/-` step buttons.
7. Optionally edit script directly in read mode.
8. Restart app and continue from stored state.

---

## 8. Technical Approach

- Cross-platform desktop architecture (Electron-based MVP).
- Single-window renderer UI.
- Scroll loop via `requestAnimationFrame`.
- Persistent local state storage.
- i18n architecture with centralized dictionary files (currently `en`).

---

## 9. Performance & Quality Targets

- Startup target: < 2 seconds
- Smooth scrolling near 60 FPS
- No visible stutter during normal operation
- Stable operation for at least 30-minute read sessions

---

## 10. MVP Acceptance Criteria

1. App runs on Windows, macOS, Linux with core workflow.
2. Play/Pause/Reset works correctly.
3. Speed, font size, and opacity update instantly.
4. Script and settings are restored after restart.
5. Keyboard shortcuts function in read mode.
6. Scroll direction is bottom-to-top.
7. Read-mode editing works and stays persistent.
8. UI text is sourced from i18n resources (English file).

---

## 11. Risks

- Linux packaging may require distro-specific validation.
- Window behavior differences (always-on-top, focus) may vary by platform.

---

## 12. Next Steps

- Add additional locales (`tr`, `de`, etc.) using the i18n structure.
- Add build/release pipeline for packaged binaries.

"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("windowControls", {
  setAlwaysOnTop: (enabled) =>
    ipcRenderer.invoke("window:set-always-on-top", enabled),
  getAlwaysOnTop: () => ipcRenderer.invoke("window:get-always-on-top"),
  adjustHeight: (deltaHeight) =>
    ipcRenderer.invoke("window:adjust-height", deltaHeight),
});

"use strict";

const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    autoHideMenuBar: true,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

ipcMain.handle("window:set-always-on-top", (_event, enabled) => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  mainWindow.setAlwaysOnTop(Boolean(enabled));
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle("window:get-always-on-top", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle("window:adjust-height", (_event, deltaHeight) => {
  if (!mainWindow || mainWindow.isDestroyed()) return null;

  const numericDelta = Number(deltaHeight);
  if (!Number.isFinite(numericDelta)) {
    return mainWindow.getSize()[1];
  }

  const [currentWidth, currentHeight] = mainWindow.getSize();
  const nextHeight = Math.max(200, currentHeight + Math.round(numericDelta));
  mainWindow.setSize(currentWidth, nextHeight);
  return nextHeight;
});

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

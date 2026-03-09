"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const buildIconsDir = path.join(projectRoot, "build", "icons");
const runtimeAssetsDir = path.join(projectRoot, "src", "assets");

fs.mkdirSync(buildIconsDir, { recursive: true });
fs.mkdirSync(runtimeAssetsDir, { recursive: true });

const iconGenBin = process.platform === "win32" ? "icon-gen.cmd" : "icon-gen";
const args = [
  "-i",
  path.join("build", "icon.svg"),
  "-o",
  path.join("build", "icons"),
  "--ico",
  "--icns",
  "--favicon",
  "--favicon-name",
  "icon",
  "--favicon-png-sizes",
  "64,128,256,512",
  "--favicon-ico-sizes",
  "16,24,32,48",
  "--ico-name",
  "icon",
  "--icns-name",
  "icon",
  "--report",
];

const result = spawnSync(iconGenBin, args, {
  cwd: projectRoot,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const generatedRuntimeIcon = path.join(buildIconsDir, "icon512.png");
const bundledRuntimeIcon = path.join(runtimeAssetsDir, "icon.png");

if (!fs.existsSync(generatedRuntimeIcon)) {
  throw new Error(`Missing generated icon: ${generatedRuntimeIcon}`);
}

fs.copyFileSync(generatedRuntimeIcon, bundledRuntimeIcon);

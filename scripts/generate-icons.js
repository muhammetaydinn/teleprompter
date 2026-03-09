"use strict";

const fs = require("node:fs");
const path = require("node:path");
const iconGen = require("icon-gen");

const projectRoot = path.resolve(__dirname, "..");
const buildIconsDir = path.join(projectRoot, "build", "icons");
const runtimeAssetsDir = path.join(projectRoot, "src", "assets");

fs.mkdirSync(buildIconsDir, { recursive: true });
fs.mkdirSync(runtimeAssetsDir, { recursive: true });

async function main() {
  await iconGen(path.join(projectRoot, "build", "icon.svg"), buildIconsDir, {
    report: true,
    ico: {
      name: "icon",
    },
    icns: {
      name: "icon",
    },
    favicon: {
      name: "icon",
      pngSizes: [64, 128, 256, 512],
      icoSizes: [16, 24, 32, 48],
    },
  });

  const generatedRuntimeIcon = path.join(buildIconsDir, "icon512.png");
  const bundledRuntimeIcon = path.join(runtimeAssetsDir, "icon.png");

  if (!fs.existsSync(generatedRuntimeIcon)) {
    throw new Error(`Missing generated icon: ${generatedRuntimeIcon}`);
  }

  fs.copyFileSync(generatedRuntimeIcon, bundledRuntimeIcon);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

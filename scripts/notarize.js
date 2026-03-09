const { existsSync } = require("node:fs");
const path = require("node:path");

module.exports = async function notarizeBuild(context) {
  if (context.electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log(
      "Skipping notarization because APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID is missing.",
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);

  if (!existsSync(appPath)) {
    console.log(
      `Skipping notarization because app bundle was not found: ${appPath}`,
    );
    return;
  }

  const { notarize } = await import("@electron/notarize");

  await notarize({
    tool: "notarytool",
    appBundleId: context.packager.appInfo.id,
    appPath,
    appleId,
    appleIdPassword,
    teamId,
  });
};

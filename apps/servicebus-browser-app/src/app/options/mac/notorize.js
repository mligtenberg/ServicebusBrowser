const { notarize } = require('@electron/notarize');

exports.default = async function notarizeApp(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;


  console.log(appOutDir, appName);

  await notarize({
    tool: 'notarytool',
    appBundleId: 'digital.ligtenberg.servicebusbrowser',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.APPLE_TEAM_ID,
  });
};

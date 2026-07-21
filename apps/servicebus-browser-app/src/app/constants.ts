export const rendererAppPort = 4200;
export const rendererAppName = 'servicebus-browser-frontend/browser'; // options.name.split('-')[0] + '-web'
// User-facing name shown in menus/dialogs. Safe to change for rebranding.
export const electronAppName = 'Service Bus Browser';
// Electron's app.name doubles as the default userData folder name and the
// macOS Keychain service name for safeStorage. Renaming electronAppName above
// (as happened going from "Servicebus Browser" to "Service Bus Browser")
// otherwise silently orphans every user's stored connections and workspaces,
// so this must stay fixed to the original name forever, independent of
// electronAppName.
export const electronAppInternalName = 'Servicebus Browser';
export const updateServerUrl = 'https://update.electronjs.org';
export const currentVersion = '0.0.0';

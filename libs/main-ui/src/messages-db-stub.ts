// Jest stand-in for @service-bus-browser/messages-db (see jest.config.ts).
// The real package boots a sqlite web worker at import time, which jest
// cannot compile. main-ui specs never exercise the repository, so a
// never-resolving promise keeps module-level `.then(...)` wiring inert.
export const getMessagesRepository = () => new Promise(() => undefined);
export const getActiveWorkspaceId = () => undefined;
export const initializeWorkspace = () => undefined;
export const switchMessagesDbWorkspace = () => undefined;
export const migrateOpfsFiles = () => Promise.resolve();

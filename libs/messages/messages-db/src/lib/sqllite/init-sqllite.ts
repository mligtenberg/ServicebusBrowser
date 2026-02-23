import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm';

async function initializeWorker() {
  try {
    const promiser = await sqlite3Worker1Promiser();

    const configResponse = await promiser('config-get', {});
    if (configResponse.type === 'error') {
      throw new Error(configResponse.result.message);
    }
    console.log('SQLite3 worker initialized', configResponse.result);

    return promiser;
  } catch (err: Error | unknown) {
    const errorObject =
      err instanceof Error ? err : new Error((err as any)?.result?.message);

    console.error(errorObject.name, errorObject.message);
    throw errorObject;
  }
}

const promiserTask = initializeWorker();

export function getPromiser() {
  return promiserTask;
}

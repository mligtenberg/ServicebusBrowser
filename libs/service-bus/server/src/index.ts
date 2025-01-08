export async function managementExecute(actionName: string, requestBody: unknown) {
  const module = require(`./lib/service-bus-server`);
  const func = module.management[actionName];

  if (func && typeof func === 'function') {
    const result = func(requestBody);

    // if is a promise, wait for it to resolve
    if (result instanceof Promise) {
      return await result;
    }

    return result;
  }

  throw new Error(`Action ${actionName} not found`);
}

export async function messagesExecute(actionName: string, requestBody: unknown) {
  const module = require(`./lib/service-bus-server`);
  const func = module.messages[actionName];

  if (func && typeof func === 'function') {
    const result = func(requestBody);

    // if is a promise, wait for it to resolve
    if (result instanceof Promise) {
      return await result;
    }

    return result;
  }

  throw new Error(`Action ${actionName} not found`);
}

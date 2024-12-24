export async function execute(actionName: string, requestBody: unknown) {
  const module = require(`./lib/service-bus-server`);
  const func = module.default[actionName];

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

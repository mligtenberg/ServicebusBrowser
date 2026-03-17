export type ConnectionValidator = {
  validateConnection: () => Promise<boolean>,
}

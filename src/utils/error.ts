export function error(msg: string): never {
  throw new Error(`vuex-pro: ${msg}`);
}

export function warn(msg: string) {
  console.warn(`vuex-pro: ${msg}`);
}

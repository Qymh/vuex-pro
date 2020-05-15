export function error(msg: string): never {
  throw new Error(`vuex-saga: ${msg}`);
}

export function warn(msg: string) {
  console.warn(`vuex-saga: ${msg}`);
}

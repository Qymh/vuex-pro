import { Dictionary } from './types';

export function toPlainObject(val: any) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

export function isObject(val: any): val is Dictionary {
  return toPlainObject(val) === 'Object';
}

export function isArray<T = string>(val: any): val is Array<T> {
  return Array.isArray(val);
}

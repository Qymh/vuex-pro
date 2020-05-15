import { Dictionary, error, warn, isObject, isArray } from 'src/utils';
import { computed, inject, reactive, UnwrapRef, ComputedRef } from 'vue';
import { StoreKey, Store } from './createStore';

type ObjectStates = {
  [x: string]: string | ((state: Dictionary) => any);
};

function getStore() {
  const store = inject<Store>(StoreKey);
  if (!store) {
    return error(
      `you should createStore and install it before use useState, or you need use useState in setup or functional component`
    );
  }
  return store;
}

function genValue(
  value: unknown,
  type: 'getters' | 'mutations' | 'actions',
  store: Store,
  namespaced: unknown
) {
  function mid(
    type: 'getters' | 'mutations' | 'actions',
    obj: Dictionary,
    store: Store,
    namespaced: unknown,
    key: string,
    value: string
  ) {
    if (typeof value !== 'string') {
      return error(
        `${type} ${value} can only be string ${
          namespaced ? `in namespaced ${namespaced}` : ''
        }`
      );
    } else {
      const naming = namespaced ? `${namespaced}/${value}` : value;
      if (!store[type][naming]) {
        warn(
          `${type} ${value} is not found ${
            namespaced ? `in namespaced ${namespaced}` : ''
          }`
        );
      } else {
        Object.defineProperty(obj, key, {
          get: () => store[type][naming],
          enumerable: true
        });
      }
    }
  }
  const obj: Dictionary = {};
  if (isArray(value)) {
    for (const item of value) {
      mid(type, obj, store, namespaced, item, item);
    }
  } else if (isObject(value)) {
    for (const key in value) {
      const item = value[key];
      mid(type, obj, store, namespaced, key, item);
    }
  }
  return obj;
}

function useState<States = string[]>(states: States): any;
function useState<States = Dictionary>(
  states: ObjectStates
): UnwrapRef<States> | never;
function useState<States = Dictionary>(
  namespaced?: string,
  states?: string[]
): UnwrapRef<States> | never;
function useState<States = Dictionary>(
  namespaced?: string,
  states?: ObjectStates
): UnwrapRef<States> | never;
function useState<States = Dictionary>(
  namespaced?: unknown,
  states?: unknown
): UnwrapRef<States> | never {
  function genState(
    obj: Dictionary,
    store: Store,
    namespaced: unknown,
    stateKey: string,
    stateValue: string | Function
  ) {
    const namespacedArr: string[] = [];
    if (namespaced && typeof namespaced === 'string') {
      namespacedArr.push(...namespaced.split('/'));
    }
    let res: ComputedRef;
    if (typeof stateValue === 'string') {
      res = computed(() => {
        const cur = store.getNamespacedValue(store.state, namespacedArr);
        if (!cur) {
          return undefined;
        }
        return cur[stateValue];
      });
    } else if (typeof stateValue === 'function') {
      const cur = store.getNamespacedValue(store.state, namespacedArr);
      res = computed(stateValue.bind(null, cur));
    } else {
      return error(
        `state ${stateKey} can only be string of function ${
          namespacedArr.length ? `in namespaced ${namespacedArr.join('/')}` : ''
        }`
      );
    }
    if (res.value) {
      Object.defineProperty(obj, stateKey, {
        get: () => res.value,
        enumerable: true
      });
    } else {
      warn(`state ${stateKey} is not found`);
    }
    return obj;
  }

  const store = getStore();
  const obj: States = Object.create(null);
  // not has namespaced
  if (!states) {
    states = namespaced;
    namespaced = undefined;
  }
  if (isArray(states)) {
    for (const state of states) {
      genState(obj, store, namespaced, state, state);
    }
  } else if (isObject(states)) {
    for (const key in states) {
      const state = states[key];
      genState(obj, store, namespaced, key, state);
    }
  }
  return reactive(obj as any);
}

function useGetters<Getters = Dictionary>(
  getters: string[]
): UnwrapRef<Getters>;
function useGetters<Getters = Dictionary>(
  namespaced: string,
  getters: string[]
): UnwrapRef<Getters>;
function useGetters<Getters = Dictionary>(
  getters: Dictionary
): UnwrapRef<Getters>;
function useGetters<Getters = Dictionary>(
  namespaced: string,
  getters: Dictionary
): UnwrapRef<Getters>;
function useGetters<Getters = Dictionary>(
  namespaced?: unknown,
  getters?: unknown
): UnwrapRef<Getters> {
  const store = getStore();
  if (!getters) {
    getters = namespaced;
    namespaced = undefined;
  }
  const obj = genValue(getters, 'getters', store, namespaced);
  return reactive(obj as any);
}

function useMutations(mutations: string[]): Dictionary;
function useMutations(namespaced: string, mutations: string[]): Dictionary;
function useMutations(mutations: Dictionary): Dictionary;
function useMutations(namespaced: string, mutations: Dictionary): Dictionary;
function useMutations(namespaced?: unknown, mutations?: unknown): Dictionary {
  const store = getStore();
  // not has namespaced
  if (!mutations) {
    mutations = namespaced;
    namespaced = undefined;
  }
  const obj = genValue(mutations, 'mutations', store, namespaced);
  return obj;
}

function useActions(actions: string[]): Dictionary;
function useActions(namespaced: string, actions: string[]): Dictionary;
function useActions(actions: Dictionary): Dictionary;
function useActions(namespaced: string, actions: Dictionary): Dictionary;
function useActions(namespaced?: unknown, actions?: unknown): Dictionary {
  const store = getStore();
  // not has namespaced
  if (!actions) {
    actions = namespaced;
    namespaced = undefined;
  }
  const obj = genValue(actions, 'actions', store, namespaced);
  return obj;
}

export { useState, useGetters, useMutations, useActions };

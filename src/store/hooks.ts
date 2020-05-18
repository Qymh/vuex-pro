import { Dictionary, error, warn, isObject, isArray } from 'src/utils';
import { computed, inject, reactive, ComputedRef } from 'vue';
import { StoreKey, Store } from './createStore';

export function useStore() {
  const store = inject<Store>(StoreKey);
  if (!store) {
    return error(
      `you should createStore and install it before use it, or you need use hooks or store in setup or functional component`
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
  const obj = Object.create(null);
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

function useState<States = Dictionary>(states: string[]): States;
function useState<States = Dictionary>(
  namespaced: string,
  states: string[]
): States;
function useState<States = Dictionary>(
  states: {
    [x in keyof States]: string;
  }
): {
  [x in keyof States]: States[x] extends object ? States[x] : any;
};
function useState<States = Dictionary>(
  namespaced: string,
  states: {
    [x in keyof States]: string;
  }
): {
  [x in keyof States]: States[x] extends object ? States[x] : any;
};
function useState(namespaced?: unknown, states?: unknown) {
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
      let curValue: string = stateValue;
      if (stateValue.includes('/')) {
        const valueArr = stateValue.split('/');
        curValue = valueArr.pop()!;
        namespacedArr.push(...valueArr);
      }
      res = computed(() => {
        const cur = store.getNamespacedValue(store.state, namespacedArr);
        if (!cur) {
          return undefined;
        }
        return cur[curValue];
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

  const store = useStore();
  const obj = Object.create(null);
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
  return reactive(obj);
}

function useGetters<Getters = Dictionary>(getters: string[]): Getters;
function useGetters<Getters = Dictionary>(
  namespaced: string,
  getters: string[]
): Getters;
function useGetters<Getters>(
  getters: Getters
): {
  [x in keyof Getters]: any;
};
function useGetters<Getters = Dictionary>(
  namespaced: string,
  getters: Getters
): {
  [x in keyof Getters]: any;
};
function useGetters(namespaced?: unknown, getters?: unknown) {
  const store = useStore();
  if (!getters) {
    getters = namespaced;
    namespaced = undefined;
  }
  const obj = genValue(getters, 'getters', store, namespaced);
  return reactive(obj);
}

function useMutations<Mutations = Dictionary<Function>>(
  mutations: string[]
): Mutations;
function useMutations<Mutations = Dictionary<Function>>(
  namespaced: string,
  mutations: string[]
): Mutations;
function useMutations<Mutations = Dictionary>(
  mutations: {
    [x in keyof Mutations]: string;
  }
): {
  [x in keyof Mutations]: Mutations[x] extends Function
    ? Mutations[x]
    : Function;
};
function useMutations<Mutations = Dictionary>(
  namespaced: string,
  mutations: {
    [x in keyof Mutations]: string;
  }
): {
  [x in keyof Mutations]: Mutations[x] extends Function
    ? Mutations[x]
    : Function;
};
function useMutations(namespaced?: unknown, mutations?: unknown) {
  const store = useStore();
  // not has namespaced
  if (!mutations) {
    mutations = namespaced;
    namespaced = undefined;
  }
  const obj = genValue(mutations, 'mutations', store, namespaced);
  return obj;
}

function useActions<Actions = Dictionary<Function>>(actions: string[]): Actions;
function useActions<Actions = Dictionary<Function>>(
  namespaced: string,
  actions: string[]
): Actions;
function useActions<Actions = Dictionary>(
  actions: {
    [x in keyof Actions]: string;
  }
): {
  [x in keyof Actions]: Actions[x] extends Function ? Actions[x] : Function;
};
function useActions<Actions = Dictionary>(
  namespaced: string,
  actions: {
    [x in keyof Actions]: string;
  }
): {
  [x in keyof Actions]: Actions[x] extends Function ? Actions[x] : Function;
};
function useActions(namespaced?: unknown, actions?: unknown): Dictionary {
  const store = useStore();
  // not has namespaced
  if (!actions) {
    actions = namespaced;
    namespaced = undefined;
  }
  const obj = genValue(actions, 'actions', store, namespaced);
  return obj;
}

export { useState, useGetters, useMutations, useActions };

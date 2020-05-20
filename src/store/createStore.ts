import { Dictionary, error, warn } from '../utils';
import { reactive, computed, App } from 'vue';

export interface Payload extends Dictionary {
  type: string;
}

export const StoreKey = Symbol ? Symbol('store') : 'store';

type subscribeHandler<State = Dictionary> = (
  methods: { type: string; payload: any },
  state: State
) => void;

export type GettersCb<
  IState = Dictionary,
  IGetters = Dictionary,
  Return = any,
  IRootState = Dictionary,
  IRootGetters = Dictionary
> = (
  state: IState,
  getters: {
    [x in keyof IGetters]: IGetters[x] extends GettersCb<any, any, infer U>
      ? U
      : any;
  },
  rootState: IRootState,
  rootGetters: IRootGetters
) => Return;

export type Getters<IState = Dictionary, IGetters = Dictionary> = Record<
  string,
  GettersCb<IState, IGetters>
>;

export type MutationsCb<IState = Dictionary, IPayload = any> = (
  state: IState,
  payload: IPayload
) => any;

export type Mutations<State = Dictionary> = Record<string, MutationsCb<State>>;

export type ActionsCb<
  IState = Dictionary,
  IGetters = Dictionary,
  IPayload = any,
  IRootState = Dictionary,
  IRootGetters = Dictionary
> = (
  args: {
    state: IState;
    getters: {
      [x in keyof IGetters]: IGetters[x] extends GettersCb<{}, {}, infer U>
        ? U
        : any;
    };
    rootState: IRootState;
    rootGetters: IRootGetters;
    commit: (type: string, payload?: any) => void;
    dispatch: (type: string, payload?: any) => void;
  },
  payload: IPayload
) => any;

export type Actions<
  IState = Dictionary,
  IGetters = Dictionary,
  IRootState = Dictionary,
  IRootGetters = Dictionary
> = Record<string, ActionsCb<IState, IGetters, {}, IRootState, IRootGetters>>;

export type Module<
  IState = Dictionary,
  IGetters = Getters<IState>,
  IMutations = Mutations<IState>,
  IActions = Actions<IState>
> = {
  namespaced?: boolean;
  state?: IState;
  getters?: IGetters;
  mutations?: IMutations;
  actions?: IActions;
  modules?: Record<string, Module<Dictionary, Getters, Mutations, Actions>>;
};

export class Store {
  // state
  public state: Dictionary;
  // rootState
  public rootState: Dictionary;
  // proxyGetters
  private _proxyGetters: Dictionary;
  // getters
  public getters: Dictionary;
  // rootGetters
  public rootGetters: Dictionary;
  // mutations
  private mutations: Mutations;
  // actions
  private actions: Actions;
  // subscribes
  private subscribes: subscribeHandler[];
  // subscribesAction
  private subscribesAction: subscribeHandler[];

  constructor(module: Module) {
    this.state = {};
    this.rootState = {};
    this.getters = {};
    this._proxyGetters = {};
    this.rootGetters = {};
    this.mutations = {};
    this.actions = {};
    this.subscribes = [];
    this.subscribesAction = [];
    this.travers(module);
  }

  public getNamespacedValue(value: Dictionary, name: string[]): Dictionary {
    let cur = value;
    const nameLen = name.length;
    if (!nameLen) {
      return value;
    } else {
      for (let i = 0; i < nameLen; i++) {
        const v = name[i];
        if (i === nameLen - 1) {
          return cur[v];
        } else {
          cur = cur[v] || {};
        }
      }
      return {};
    }
  }

  private travers(module: Module, name: string[] = []) {
    let key: keyof Module;
    for (key in module) {
      switch (key) {
        case 'state':
          this.genState(module['state'] || {}, name);
          break;
        case 'getters':
          this.genGetters(module['getters'] || {}, name);
          break;
        case 'mutations':
          this.genMutations(module['mutations'], name);
          break;
        case 'actions':
          this.genActions(module['actions'], name);
          break;
        case 'modules':
          this.genModules(module['modules'], name);
          break;
      }
    }
  }

  private genState(state: Dictionary, name: string[] = []) {
    const nameLen = name.length;
    // root
    if (!nameLen) {
      this.state = {
        ...(this.state || {}),
        ...state
      };
      this.rootState = {
        ...(this.state || {}),
        ...state
      };
      this.state = reactive(this.state);
    } else {
      let cur = this.state;
      for (let i = 0; i < nameLen; i++) {
        const v = name[i];
        if (i === nameLen - 1) {
          state = reactive(state);
          cur[v] = {
            ...(cur[v] || {}),
            ...state
          };
        } else {
          cur = cur[v] || {};
        }
      }
    }
  }

  private genGetters(getters: Getters, name: string[] = []) {
    function callGetter(
      this: Store,
      key: string,
      getter: GettersCb,
      name: string[]
    ) {
      let res = computed(
        getter.bind(
          null,
          this.getNamespacedValue(this.state, name),
          this.getters,
          this.rootState,
          this.rootGetters
        )
      );
      this._proxyGetters[key] = () => res.value;
    }

    const nameLen = name.length;

    for (const key in getters) {
      const getter = getters[key];
      if (typeof getter !== 'function') {
        error(`getters ${key} should be a function`);
      }
      if (!nameLen) {
        callGetter.call(this, key, getter, name);
        if (this.getters[key]) {
          warn(`has mutiple ${key} getters`);
          delete this.getters[key];
        }
        Object.defineProperty(this.getters, key, {
          get: () => {
            return this._proxyGetters[key]();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(this.rootGetters, key, {
          get: () => {
            return this._proxyGetters[key]();
          },
          enumerable: true,
          configurable: true
        });
      } else {
        const naming = name.join('/') + `/${key}`;
        callGetter.call(this, naming, getter, name);
        Object.defineProperty(this.getters, naming, {
          get: () => {
            return this._proxyGetters[naming]();
          },
          enumerable: true
        });
      }
    }
  }

  private genMutations(mutations: Module['mutations'], name: string[] = []) {
    const nameLen = name.length;
    for (const key in mutations) {
      const mutation = mutations[key];
      if (!nameLen) {
        if (this.mutations[key]) {
          warn(`has multiple ${key} mutations`);
          delete this.mutations[key];
        }
        this.mutations[key] = mutation.bind(
          null,
          this.getNamespacedValue(this.state, name)
        );
      } else {
        const naming = name.join('/') + `/${key}`;
        this.mutations[naming] = mutation.bind(
          null,
          this.getNamespacedValue(this.state, name)
        );
      }
    }
  }

  private genActions(actions: Module['actions'], name: string[] = []) {
    const nameLen = name.length;
    function commit(this: Store, name: string[]) {
      return (type: string, payload: any) => {
        this.commit(name.join('/') + `/${type}`, payload);
      };
    }
    function dispatch(this: Store, name: string[]) {
      return (type: string, payload: any) => {
        return this.dispatch(name.join('/') + `/${type}`, payload);
      };
    }
    for (const key in actions) {
      let action = actions[key];
      if (!nameLen) {
        this.actions[key] = action.bind(null, {
          state: this.state,
          getters: this.getters,
          rootState: this.rootState,
          rootGetters: this.rootGetters,
          commit: this.commit.bind(this),
          dispatch: this.dispatch.bind(this)
        });
      } else {
        const naming = name.join('/') + `/${key}`;
        this.actions[naming] = action.bind(null, {
          state: this.state,
          getters: this.getters,
          rootState: this.rootState,
          rootGetters: this.rootGetters,
          commit: commit.call(this, name),
          dispatch: dispatch.call(this, name)
        });
      }
    }
  }

  private genModules(modules: Module['modules'], name: string[] = []) {
    for (const key in modules) {
      const module = modules[key];
      // avoid cite value
      const newName = [...name];
      if (module.namespaced) {
        newName.push(key);
      }
      this.travers(module, newName);
    }
  }

  public commit(type: string, payload?: any) {
    if (this.mutations[type]) {
      if (typeof this.mutations[type] !== 'function') {
        error(
          `mutation ${type} should be a function, but now get ${typeof type}`
        );
      }
      (this.mutations[type] as any)(payload);
      this.subscribes.forEach((v) => {
        v.call(null, { type, payload }, this.state);
      });
    } else {
      if (__DEV__) {
        warn(`mutation ${type} is not found`);
      }
    }
  }

  public dispatch(type: string, payload?: any) {
    if (this.actions[type]) {
      if (typeof this.actions[type] !== 'function') {
        error(
          `action ${type} should be a function, but now get ${typeof type}`
        );
      }
      const res = (this.actions[type] as any)(payload);
      this.subscribesAction.forEach((v) => {
        v.call(null, { type, payload }, this.state);
      });
      return new Promise((resolve) => {
        resolve(res);
      });
    } else {
      if (__DEV__) {
        warn(`action ${type} is not found`);
      }
    }
  }

  public subscribe(handler: subscribeHandler) {
    this.subscribes.push(handler);
  }

  public subscribeAction(handler: subscribeHandler) {
    this.subscribesAction.push(handler);
  }

  public getState() {
    return this.state;
  }

  public install(app: App) {
    app.provide(StoreKey, this);
  }
}

export function createStore(module: Module) {
  return new Store(module);
}

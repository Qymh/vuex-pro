import {
  createStore,
  GettersCb,
  MutationsCb,
  ActionsCb,
  Module,
  useState,
  useGetters,
  useMutations,
  useActions
} from '../src';
import { createApp, h, computed } from 'vue';

type IModule = {
  namespaced?: boolean;
  state: {
    a: number;
  };
  getters: {
    b: GettersCb<IModule['state'], IModule['getters'], number>;
  };
  mutations: {
    _changeA: MutationsCb<IModule['state'], number>;
  };
  actions: {
    changeA: ActionsCb<IModule['state'], IModule['getters'], number>;
  };
  modules?: {
    [x: string]: IModule;
  };
};

const test: Module = {
  state: {
    a: 1
  },
  getters: {
    b(state, getters) {
      return state.a + 1;
    }
  },
  mutations: {
    _changeA(state, num) {
      state.a = num;
    }
  },
  actions: {
    async changeA({ commit }, num) {
      commit('_changeA', num);
    }
  },
  modules: {
    inner: {
      namespaced: true,
      state: {
        innera: 1
      },
      getters: {
        innerb(state) {
          return state.innera + 1;
        }
      },
      mutations: {
        _changeA(state, num) {
          state.innera = num;
        }
      },
      actions: {
        async changeA({ commit }, num) {
          commit('_changeA', num);
        }
      },
      modules: {
        inner2: {
          namespaced: true,
          state: {
            inner2a: 1
          },
          getters: {
            inner2b(state) {
              return state.inner2a + 1;
            }
          },
          mutations: {
            _changeA(state, num) {
              state.inner2a = num;
            }
          },
          actions: {
            async changeA({ commit }, num) {
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                }, 1000);
              });
              commit('_changeA', num);
            }
          }
        }
      }
    }
  }
};

const store = createStore(test);

const app = createApp({
  setup() {
    const state = useState(['a']);
    const getters = useGetters({
      b: 'b'
    });
    const { changeA } = useActions({
      changeA: 'changeA'
    });
    setTimeout(() => {
      changeA(2);
    }, 1000);
    return () => h('div', [h('div', state.a), h('div', getters.b)]);
  }
});

app.use(store);

app.mount('#app');

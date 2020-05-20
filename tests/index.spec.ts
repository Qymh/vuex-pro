/**
 * @jest-environment jsdom
 */

import {
  createStore,
  useState,
  useGetters,
  useMutations,
  useActions
} from '../src';
import { createApp, h } from 'vue';

describe('basic', () => {
  it('createStore', () => {
    const store = createStore({});
    expect(store).toBeDefined();
  });

  it('state', () => {
    const store = createStore({
      state: {
        test: 1
      }
    });
    expect(store.getState().test).toBe(1);
  });

  it('getters', () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      }
    });
    expect(store.getters.foo).toBe(2);
  });

  it('mutations', () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        change(state, num) {
          state.test = num;
        }
      }
    });

    store.commit('change', 2);
    expect(store.getState().test).toBe(2);
    expect(store.getters.foo).toBe(3);
  });

  it('actions', async () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        change(state, num) {
          state.test = num;
        }
      },
      actions: {
        async delayChange({ commit }, num) {
          await new Promise((resolve) => {
            const timer = setTimeout(() => {
              clearTimeout(timer);
              resolve();
            }, 1000);
          });
          commit('change', num);
        }
      }
    });

    await store.dispatch('delayChange', 2);
    expect(store.getState().test).toBe(2);
    expect(store.getters.foo).toBe(3);
  });
});

describe('modules', () => {
  it('state', () => {
    const store = createStore({
      state: {
        test: 1
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          }
        }
      }
    });
    expect(store.getState().test).toBe(1);
    expect(store.getState().inner.test).toBe(1);
  });

  it('getters', () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          }
        }
      }
    });
    expect(store.getters.foo).toBe(2);
    expect(store.getters['inner/foo']).toBe(2);
  });

  it('mutations', () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        change(state, num) {
          state.test = num;
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.test = num;
            }
          }
        }
      }
    });
    store.commit('change', 2);
    store.commit('inner/change', 2);
    expect(store.getState().test).toBe(2);
    expect(store.getters.foo).toBe(3);
    expect(store.getState().inner.test).toBe(2);
    expect(store.getters['inner/foo']).toBe(3);
  });

  it('actions', async () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        change(state, num) {
          state.test = num;
        }
      },
      actions: {
        async delayChange({ commit }, num) {
          await new Promise((resolve) => {
            const timer = setTimeout(() => {
              clearTimeout(timer);
              resolve();
            }, 1000);
          });
          commit('change', num);
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.test = num;
            }
          },
          actions: {
            async delayChange({ commit }, num) {
              await new Promise((resolve) => {
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  resolve();
                }, 1000);
              });
              commit('change', num);
            }
          }
        }
      }
    });
    await store.dispatch('delayChange', 2);
    await store.dispatch('inner/delayChange', 2);
    expect(store.getState().test).toBe(2);
    expect(store.getters.foo).toBe(3);
    expect(store.getState().inner.test).toBe(2);
    expect(store.getters['inner/foo']).toBe(3);
  });
});

describe('hooks', () => {
  it('useState', () => {
    const store = createStore({
      state: {
        test: 1
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          }
        },
        box: {
          namespaced: true,
          state: {
            test: 1
          }
        }
      }
    });
    const app = createApp({
      setup() {
        const state1 = useState(['test']);
        const state2 = useState({
          test2: 'test'
        });
        const state3 = useState('inner', ['test']);
        const state4 = useState('box', {
          test4: 'test'
        });
        expect(state1.test).toBe(1);
        expect(state2.test2).toBe(1);
        expect(state3.test).toBe(1);
        expect(state4.test4).toBe(1);

        return () => h('div');
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });

  it('useGetters', () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          }
        },
        box: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          }
        }
      }
    });
    const app = createApp({
      setup() {
        const getters1 = useGetters(['foo']);
        const getters2 = useGetters({
          foo2: 'foo'
        });
        const getters3 = useGetters('inner', ['foo']);
        const getters4 = useGetters('box', {
          foo4: 'foo'
        });
        expect(getters1.foo).toBe(2);
        expect(getters2.foo2).toBe(2);
        expect(getters3.foo).toBe(2);
        expect(getters4.foo4).toBe(2);

        return () => h('div');
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });

  it('useMutations', () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        change(state, num) {
          state.test = num;
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.test = num;
            }
          }
        },
        box: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.test = num;
            }
          }
        }
      }
    });
    const app = createApp({
      setup() {
        const { change } = useMutations(['change']);
        const { change2 } = useMutations({
          change2: 'change'
        });
        const { change: change3 } = useMutations('inner', ['change']);
        const { change4 } = useMutations('box', {
          change4: 'change'
        });
        change(2);
        change2(2);
        change3(2);
        change4(2);
        expect(store.getState().test).toBe(2);
        expect(store.getters.foo).toBe(3);
        expect(store.getState().inner.test).toBe(2);
        expect(store.getters['inner/foo']).toBe(3);
        expect(store.getState().box.test).toBe(2);
        expect(store.getters['box/foo']).toBe(3);

        return () => h('div');
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });

  it('useActions', async () => {
    const store = createStore({
      state: {
        test: 1
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        change(state, num) {
          state.test = num;
        }
      },
      actions: {
        async delayChange({ commit }, num) {
          await new Promise((resolve) => {
            const timer = setTimeout(() => {
              clearTimeout(timer);
              resolve();
            }, 1000);
          });
          commit('change', num);
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.test = num;
            }
          },
          actions: {
            async delayChange({ commit }, num) {
              await new Promise((resolve) => {
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  resolve();
                }, 1000);
              });
              commit('change', num);
            }
          }
        },
        box: {
          namespaced: true,
          state: {
            test: 1
          },
          getters: {
            foo(state) {
              return state.test + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.test = num;
            }
          },
          actions: {
            async delayChange({ commit }, num) {
              await new Promise((resolve) => {
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  resolve();
                }, 1000);
              });
              commit('change', num);
            }
          }
        }
      }
    });
    const app = createApp({
      async setup() {
        const { delayChange } = useActions(['delayChange']);
        const { delayChange2 } = useActions({
          delayChange2: 'delayChange'
        });
        const { delayChange: delayChange3 } = useActions('inner', [
          'delayChange'
        ]);
        const { delayChange4 } = useActions('box', {
          delayChange4: 'delayChange'
        });

        await delayChange(2);
        await delayChange2(2);
        await delayChange3(2);
        await delayChange4(2);
        expect(store.getState().test).toBe(2);
        expect(store.getters.foo).toBe(3);
        expect(store.getState().inner.test).toBe(2);
        expect(store.getters['inner/foo']).toBe(3);
        expect(store.getState().box.test).toBe(2);
        expect(store.getters['box/foo']).toBe(3);

        return () => h('div');
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });
});

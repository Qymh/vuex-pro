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

function mockWarn() {
  return jest.spyOn(console, 'warn').mockImplementation(() => {
    jest.restoreAllMocks();
  });
}

window.__DEV__ = true;

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
    expect(store.rootGetters.foo).toBe(2);
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
            }, 100);
          });
          commit('change', num);
        }
      }
    });

    await store.dispatch('delayChange', 2);
    expect(store.getState().test).toBe(2);
    expect(store.getters.foo).toBe(3);
  });

  it('inner action', () => {
    const store = createStore({
      modules: {
        inner: {
          namespaced: true,
          state: {
            a: 1
          },
          mutations: {
            change(state, num) {
              state.a = num;
            }
          },
          actions: {
            change1({ dispatch }, num) {
              dispatch('change2', num + 1);
            },
            change2({ commit }, num) {
              commit('change', num);
            }
          }
        }
      }
    });
    store.dispatch('inner/change1', 2);
    expect(store.state.inner.a).toBe(3);
  });

  it('subscribe', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        change(state, num) {
          state.a = num;
        }
      }
    });
    store.subscribe(({ type, payload }) => {
      expect(type).toBe('change');
      expect(payload).toBe(2);
    });
    store.commit('change', 2);
  });

  it('subscribeAction', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        change(state, num) {
          state.a = num;
        }
      },
      actions: {
        actionChange({ commit }, num) {
          commit('change', num);
        }
      }
    });
    store.subscribeAction(({ type, payload }) => {
      expect(type).toBe('actionChange');
      expect(payload).toBe(2);
    });
    store.dispatch('actionChange', 2);
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
            }, 100);
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
                }, 100);
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

  it('multiple', async () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        change(state, num) {
          state.a = num;
        }
      },
      actions: {
        async delayChange({ commit }, num) {
          await new Promise((resolve) => {
            const timer = setTimeout(() => {
              clearTimeout(timer);
              resolve();
            }, 100);
          });
          commit('change', num);
        }
      },
      modules: {
        inner: {
          namespaced: true,
          state: {
            a: 1
          },
          mutations: {
            change(state, num) {
              state.a = num;
            }
          },
          actions: {
            async delayChange({ commit }, num) {
              await new Promise((resolve) => {
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  resolve();
                }, 100);
              });
              commit('change', num);
            }
          },
          modules: {
            box: {
              namespaced: true,
              state: {
                a: 1
              },
              mutations: {
                change(state, num) {
                  state.a = num;
                }
              },
              actions: {
                async delayChange({ commit }, num) {
                  await new Promise((resolve) => {
                    const timer = setTimeout(() => {
                      clearTimeout(timer);
                      resolve();
                    }, 100);
                  });
                  commit('change', num);
                }
              }
            }
          }
        }
      }
    });
    await store.dispatch('delayChange', 2);
    await store.dispatch('inner/delayChange', 2);
    await store.dispatch('inner/box/delayChange', 2);
    expect(store.getState().a).toBe(2);
    expect(store.getState().inner.a).toBe(2);
    expect(store.getState().inner.box.a).toBe(2);
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
        const state5 = useState({
          test5: 'inner/test'
        });
        const state6 = useState({
          test5: (state) => {
            return state.test;
          }
        });
        expect(state1.test).toBe(1);
        expect(state2.test2).toBe(1);
        expect(state3.test).toBe(1);
        expect(state4.test4).toBe(1);
        expect(state5.test5).toBe(1);
        expect(state6.test5).toBe(1);

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
            }, 100);
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
                }, 100);
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
                }, 100);
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

describe('warnings', () => {
  let warn: any;
  beforeEach(() => {
    warn = mockWarn();
  });

  it('multiple getters', () => {
    const warn = mockWarn();
    const store = createStore({
      state: {
        a: 1
      },
      getters: {
        b(state) {
          return state.a;
        }
      },
      modules: {
        inner: {
          getters: {
            b(state) {
              return state.a + 1;
            }
          }
        }
      }
    });
    expect(warn).toBeCalled();
    expect(store.getters.b).toBe(2);
  });

  it('multiple mutations', () => {
    const store = createStore({
      state: {
        a: 1
      },
      getters: {
        b(state) {
          return state.a;
        }
      },
      mutations: {
        change(state, num) {
          state.a = num;
        }
      },
      modules: {
        inner: {
          getters: {
            b(state) {
              return state.a + 1;
            }
          },
          mutations: {
            change(state, num) {
              state.a = num;
            }
          }
        }
      }
    });
    expect(warn).toBeCalled();
    store.commit('change', 2);
    expect(store.getters.b).toBe(3);
  });

  it('no mutation type', () => {
    const store = createStore({});
    store.commit('notype');
    expect(warn).toBeCalled();
  });

  it('no action type', () => {
    const store = createStore({});
    store.dispatch('notype');
    expect(warn).toBeCalled();
  });

  it('not found state', () => {
    const store = createStore({});
    const app = createApp({
      setup() {
        // @ts-ignore
        const state = useState(['null']);
        expect(warn).toBeCalled();
        return () => h('div');
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });

  it('not found mutations', () => {
    const store = createStore({});
    const app = createApp({
      setup() {
        // @ts-ignore
        const { none } = useMutations(['none']);
        expect(warn).toBeCalled();
        return () => h('div');
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });
});

describe('errors', () => {
  it('getter is not a function', () => {
    try {
      createStore({
        state: {
          a: 1
        },
        getters: {
          // @ts-ignore
          b: 1
        }
      });
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it('mutation is not a function', () => {
    try {
      createStore({
        state: {
          a: 1
        },
        mutations: {
          // @ts-ignore
          b: 1
        }
      });
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it('action is not a function', () => {
    try {
      createStore({
        state: {
          a: 1
        },
        actions: {
          // @ts-ignore
          b: 1
        }
      });
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it('useHooks not in setup', () => {
    try {
      useState(['a']);
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it('wrong state', () => {
    const store = createStore({
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
          }
        }
      }
    });
    const app = createApp({
      setup() {
        try {
          // @ts-ignore
          const state = useState('inner', {
            test: Symbol()
          });
          return () => h('div');
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });

  it('wrong mutations', () => {
    const store = createStore({
      modules: {
        inner: {
          namespaced: true,
          state: {
            test: 1
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
        try {
          // @ts-ignore
          const { change } = useMutations('inner', {
            change: Symbol()
          });
          return () => h('div');
        } catch (error) {
          expect(error.message).toBeDefined();
        }
      }
    });
    app.use(store);
    app.mount(document.createElement('div'));
  });
});

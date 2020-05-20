import { createStore } from '../src';

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

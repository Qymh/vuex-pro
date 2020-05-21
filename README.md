![](https://img.shields.io/circleci/build/github/Qymh/vuex-pro)
![](https://img.shields.io/npm/v/vuex-pro/beta)
![](https://img.shields.io/codecov/c/github/qymh/vuex-pro)

# vuex-pro

vue state management `typescript` supported for `vue-next`

**Only supported `vue3` or `vue-next`**

## Usage

### Install

```bash
yarn add vuex-pro@beta
```

ofcourse you need install `vue3` or `vue-next` before

### createStore

create a state management

```javascript
import { createApp, h } from 'vue';
import { createStore } from 'vuex-pro';

const store = createStore();
const app = createApp({
  setup() {
    return () => h('div', 'vuex-pro');
  }
});

// install store
app.use(store);

app.mount('#app');
```

## state

- define

```javascript
const store = createStore({
  state: {
    test: 1
  }
});
```

- js

```js
store.state.test; // 1

store.getState().test; // 1
```

- setup

```javascript
import { createApp, h } from 'vue';
import { createStore, useState } from 'vuex-pro';

const store = createStore({
  state: {
    test: 1
  }
});
const app = createApp({
  setup() {
    const state = useState(['test']);
    return () => h('div', state.test);
  }
});

app.use(store);
app.mount('#app');
```

❌ **WRONG**

The above example you can only get `test` by state.test so that it can trigger reactive refresh

the following is wrong

```js
const { test } = useState(['test']);
return () => h('div', test);
```

dom will not refresh when test changes

### getters

- define

```javascript
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
```

- js

```js
store.getters.foo; // 2
```

- setup

```javascript
import { createApp, h } from 'vue';
import { createStore, useGetters } from 'vuex-pro';

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
const app = createApp({
  setup() {
    const getters = useGetters(['foo']);
    return () => h('div', getters.foo);
  }
});

app.use(store);
app.mount('#app');
```

❌ **WRONG**

The above example you can only get `foo` by getters.foo so that it can trigger reactive refresh

the following is wrong

```js
const { foo } = useGetters(['foo']);
return () => h('div', foo);
```

dom will not refresh when getter foo changes

### Mutations

- define

```javascript
const store = createStore({
  state: {
    test: 1
  },
  mutations: {
    changeTest(state, num) {
      state.test = num;
    }
  }
});
```

- js

```js
store.commit('changeTest', 2);
```

- setup

```js
import { createApp, h } from 'vue';
import { createStore, useState, useMutations } from 'vuex-pro';

const store = createStore({
  state: {
    test: 1
  },
  mutations: {
    changeTest(state, num) {
      state.test = num;
    }
  }
});
const app = createApp({
  setup() {
    const state = useState(['test']);
    const { changeTest } = useMutations(['changeTest']);
    return () =>
      h(
        'div',
        {
          onClick: () => changeTest(2)
        },
        state.test
      );
  }
});

app.use(store);
app.mount('#app');
```

### actions

- define

```javascript
const store = createStore({
  state: {
    test: 1
  },
  mutations: {
    changeTest(state, num) {
      state.test = num;
    }
  },
  actions: {
    async delayChangeTest({ commit }, num) {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
          clearTimeout(timer);
        }, 1000);
      });
      commit('changeTest', num);
    }
  }
});
```

- js

```js
store.dispatch('delayChangeTest', 2);
```

- setup

```js
import { createApp, h } from 'vue';
import { createStore, useState, useActions } from 'vuex-pro';

const store = createStore({
  state: {
    test: 1
  },
  mutations: {
    changeTest(state, num) {
      state.test = num;
    }
  },
  actions: {
    async delayChangeTest({ commit }, num) {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
          clearTimeout(timer);
        }, 1000);
      });
      commit('changeTest', num);
    }
  }
});
const app = createApp({
  setup() {
    const state = useState(['test']);
    const { change } = useActions({
      change: 'delayChangeTest'
    });
    return () =>
      h(
        'div',
        {
          onClick: () => change(2)
        },
        state.test
      );
  }
});

app.use(store);
app.mount('#app');
```

### namespaced

same as `vuex` we provide namespaced for diffrent modules

- define

```javascript
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
    changeTest(state, num) {
      state.test = num;
    }
  },
  actions: {
    async delayChangeTest({ commit }, num) {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
          clearTimeout(timer);
        }, 1000);
      });
      commit('changeTest', num);
    }
  },
  modules: {
    inner: {
      state: {
        test: 2
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        changeTest(state, num) {
          state.test = num;
        }
      },
      actions: {
        async delayChangeTest({ commit }, num) {
          await new Promise((resolve) => {
            const timer = setTimeout(() => {
              resolve();
              clearTimeout(timer);
            }, 1000);
          });
          commit('changeTest', num);
        }
      }
    }
  }
});
```

#### js

- state

```js
store.state.test; // 1
store.state.inner.test; // 2
```

- getters

```js
store.state.foo; // 2
store.state['inner/foo']; // 3
```

- mutations

```js
store.commit('changeTest', 2);
store.commit('inner/changeTest', 2);
```

- actions

```js
store.dispatch('delayChangeTest', 2);
store.dispatch('inner/delayChangeTest', 2);
```

#### setup

```js
import { createApp, h } from 'vue';
import {
  createStore,
  useState,
  useGetters,
  useMutations,
  useActions
} from 'vuex-pro';

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
    changeTest(state, num) {
      state.test = num;
    }
  },
  actions: {
    async delayChangeTest({ commit }, num) {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
          clearTimeout(timer);
        }, 1000);
      });
      commit('changeTest', num);
    }
  },
  modules: {
    inner: {
      state: {
        test: 2
      },
      getters: {
        foo(state) {
          return state.test + 1;
        }
      },
      mutations: {
        changeTest(state, num) {
          state.test = num;
        }
      },
      actions: {
        async delayChangeTest({ commit }, num) {
          await new Promise((resolve) => {
            const timer = setTimeout(() => {
              resolve();
              clearTimeout(timer);
            }, 1000);
          });
          commit('changeTest', num);
        }
      }
    }
  }
});

const app = createApp({
  setup() {
    const state = useState({
      test: 'test',
      itest: 'inner/test'
    });
    const getters = useGetters({
      foo: 'foo',
      ifoo: 'inner/foo'
    });
    const { mut, iMut } = useMutations({
      mut: 'changeTest',
      iMut: 'inner/changeTest'
    });
    const { change, iChange } = useActions({
      change: 'delayChangeTest',
      iChange: 'inner/delayChangeTest'
    });
    return () => h('div');
  }
});

app.use(store);
app.mount('#app');
```

## Api

### createStore(modules)

- modules
  - namespaced
  - state
  - getters
  - mutations
  - actions

#### namespaced

#### state

#### getters(state,getters,rootState?,rootGetters?)

if module is at top it only has`state` and `getters`

#### mutations(state,payload)

#### actions({state,getters,commit,dispatch,rootState,rootGetters},payload)

### useState(namespaced?,states)

**it can only use in `setup`**

if it doesn't have namespaced states can be the first argument

```js
import { useState } from 'vuex-pro';
const state1 = useState(['a', 'inner/b']);

const state2 = useState({
  a2: 'a',
  b2: 'inner/b'
});

const state3 = useState('inner', {
  b3: 'b'
});

const state4 = useState({
  b3(state) {
    return state.a + 1;
  }
});
```

### useGetters(namespaced?,getters)

**it can only use in `setup`**

if it doesn't have namespaced getters can be the first argument

```js
import { useGetters } from 'vuex-pro';
const getters1 = useGetters(['a', 'inner/b']);

const getters2 = useGetters({
  a2: 'a',
  b2: 'inner/b'
});

const getters3 = useGetters('inner', {
  b3: 'b'
});
```

### useMutations(namespaced?,mutations)

**it can only use in `setup`**

if it doesn't have namespaced mutations can be the first argument

```js
import { useMutations } from 'vuex-pro';
const mutations1 = useMutations(['a', 'inner/b']);

const mutations2 = useMutations({
  a2: 'a',
  b2: 'inner/b'
});

const mutations3 = useMutations('inner', {
  b3: 'b'
});
```

### useActions(namespaced?,actions)

**it can only use in `setup`**

if it doesn't have namespaced actions can be the first argument

```js
import { useActions } from 'vuex-pro';
const actions1 = useActions(['a', 'inner/b']);

const actions2 = useActions({
  a2: 'a',
  b2: 'inner/b'
});

const actions3 = useActions('inner', {
  b3: 'b'
});
```

### store 实例方法

#### store.commit(type,payload) trigger mutations

#### store.dispatch(type,payload) trigger actions

#### store.getState() get rootstate

#### store.subscribe(handler) functions before trigger mutations

handler is a function ({type,payload},state)

type
payload
state

#### store.subscribeAction(handler) functions before trigger actions

handler is a function ({type,payload},state)

type
payload
state

#### registerModule

Todo

#### unregisterModule

Todo

### hasModule

Todo

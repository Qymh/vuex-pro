import { createApp, h } from 'vue';
import { createStore } from 'vuex-pro';
import modules from './store';
import shop from './components/shop';
import button from './components/button';

const store = createStore(modules);

const app = createApp({
  setup() {
    return () => h('div', [h(shop), h(button)]);
  }
});

store.subscribe((methods, state) => {
  console.log(methods, state);
});

store.subscribeAction((methods, state) => {
  console.log(methods, state);
});

app.use(store);

app.mount('#app');

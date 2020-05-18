import { createApp, h } from 'vue';
import { createStore } from '../src';
import modules from './store';
import shop from './components/shop';
import button from './components/button';

const store = createStore(modules);

const app = createApp({
  setup() {
    return () => h('div', [h(shop), h(button)]);
  }
});

app.use(store);

app.mount('#app');

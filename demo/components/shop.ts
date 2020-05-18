import { h, defineComponent } from 'vue';
import { useState, useGetters } from '../../src';
import { ShopState } from '../store/modules/shop';

export default defineComponent({
  setup() {
    const state = useState<ShopState>('shop', {
      products: 'products'
    });
    const getters = useGetters('shop', {
      count: 'count'
    });
    return () =>
      h('div', [
        h(
          'div',
          state.products.map((v) =>
            h(
              'div',
              {
                style: {
                  marginBottom: '15px'
                }
              },
              [
                h('div', '名字：' + v.name),
                h('div', 'id：' + v.id),
                h('div', '价格：' + v.money)
              ]
            )
          )
        ),
        h('div', '总量：' + getters.count)
      ]);
  }
});

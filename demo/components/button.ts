import { h, defineComponent } from 'vue';
import { useMutations, useActions } from 'vuex-pro';

export default defineComponent({
  setup() {
    const { add } = useMutations('shop', {
      add: '_addProducts'
    });
    const { asyncAdd } = useActions('shop', {
      asyncAdd: 'delayAddProducts'
    });
    return () =>
      h(
        'div',
        {
          style: {
            marginTop: '20px'
          }
        },
        [
          h(
            'div',
            {
              onClick: () => add('mutation'),
              style: {
                color: '#f11'
              }
            },
            '添加商品'
          ),
          h(
            'div',
            {
              onClick: () => asyncAdd('action'),
              style: {
                color: '#f11'
              }
            },
            '异步添加商品'
          )
        ]
      );
  }
});

import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import rs from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

const target = process.env.TARGET || 'pkg';

const config = {
  pkg: {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-saga-dev.js',
      format: 'umd',
      name: 'VuexSaga'
    }
  },
  demo: {
    input: 'demo/index.ts',
    output: {
      file: './demoDist/bundle.js',
      format: 'umd',
      name: 'demo'
    }
  }
};

export default {
  ...config[target],
  plugins: [
    cjs(),
    rs({
      extensions: ['.js', '.ts']
    }),
    ts({
      check: false
    }),
    replace({
      'process.env.NODE_ENV': '"development"',
      __DEV__: process.env.NODE_ENV !== 'production'
    })
  ]
};

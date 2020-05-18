import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import rs from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import htmlTemplate from 'rollup-plugin-generate-html-template';

const target = process.env.TARGET || 'pkg';

const config = {
  pkg: {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-pro-dev.js',
      format: 'umd',
      name: 'Vuex'
    }
  },
  demo: {
    input: 'demo/index.ts',
    output: {
      file: './demoDist/bundle.js',
      format: 'umd',
      name: 'demo'
    },
    plugins: [
      serve({
        contentBase: ['demoDist'],
        port: 10003
      }),
      livereload(),
      htmlTemplate({
        template: 'demo/index.html',
        target: 'index.html'
      })
    ]
  }
};

function createConfig(target) {
  const { input, output, plugins } = config[target];
  return {
    input,
    output,
    plugins: [
      ...(plugins || []),
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
}

export default createConfig(target);

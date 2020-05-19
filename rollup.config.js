import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import rs from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import { terser } from 'rollup-plugin-terser';

const target = process.env.TARGET || 'pkg';
const env =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
  pkg: {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-pro-dev.js',
      format: 'umd',
      name: 'Vuex'
    },
    plugins: [
      ts({
        check: false,
        tsconfigOverride: { compilerOptions: { declaration: true } }
      })
    ]
  },
  pkgProd: [
    {
      input: 'src/index.ts',
      output: {
        file: './dist/vuex-pro-esm.js',
        format: 'esm'
      },
      external: ['vue'],
      plugins: [
        ts({
          check: false,
          tsconfigOverride: { compilerOptions: { declaration: true } }
        })
      ]
    },
    {
      input: 'src/index.ts',
      output: {
        file: './dist/vuex-pro-esm.min.js',
        format: 'esm'
      },
      external: ['vue'],
      plugins: [ts({ check: false }), terser()]
    },
    {
      input: 'src/index.ts',
      output: {
        file: './dist/vuex-pro.js',
        format: 'umd',
        name: 'Vuex'
      },
      plugins: [ts({ check: false })]
    },
    {
      input: 'src/index.ts',
      output: {
        file: './dist/vuex-pro.min.js',
        format: 'umd',
        name: 'Vuex'
      },
      plugins: [ts({ check: false }), terser()]
    }
  ],
  demo: {
    input: 'demo/index.ts',
    output: {
      file: './demoDist/bundle.js',
      format: 'umd',
      name: 'demo'
    },
    plugins: [
      ts({ check: false }),
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
  const defaultPlugins = [
    cjs(),
    rs({
      extensions: ['.js', '.ts']
    }),
    replace({
      'process.env.NODE_ENV': `"${env}"`,
      __DEV__: env === 'development'
    })
  ];
  if (env === 'production' && target === 'pkg') {
    target = 'pkgProd';
  }
  const curConfig = config[target];
  if (Array.isArray(curConfig)) {
    return curConfig.map((v) => {
      v.plugins = [...defaultPlugins, ...(v.plugins || [])];
      return v;
    });
  } else {
    const { input, output, plugins } = curConfig;
    return {
      input,
      output,
      plugins: [...defaultPlugins, ...(plugins || [])]
    };
  }
}

export default createConfig(target);

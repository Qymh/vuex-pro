import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import rs from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import htmlTemplate from 'rollup-plugin-generate-html-template';

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
        tsconfigOverride: {
          compilerOptions: { declaration: true },
          include: ['src/**/*.ts']
        }
      })
    ]
  },
  demo: {
    input: 'demo/index.ts',
    output: {
      file: './demoDist/bundle.js',
      format: 'umd',
      name: 'demo'
    },
    plugins: [
      ts({
        check: false,
        tsconfigOverride: {
          compilerOptions: { declaration: false },
          include: ['demo/**/*.ts']
        }
      }),
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
  const { input, output, plugins = [] } = config[target];
  return {
    input,
    output,
    plugins: [...defaultPlugins, ...plugins]
  };
}

export default createConfig(target);

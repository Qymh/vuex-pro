const ts = require('rollup-plugin-typescript2');
const cjs = require('@rollup/plugin-commonjs');
const rs = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const fs = require('fs-extra');
const terser = require('terser');
const { rollup } = require('rollup');
const path = require('path');

const config = [
  {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-pro-esm.js',
      format: 'esm'
    },
    external: ['vue'],
    types: true,
    env: 'development'
  },
  {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-pro-esm.min.js',
      format: 'esm'
    },
    external: ['vue'],
    min: true,
    env: 'production'
  },
  {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-pro.js',
      format: 'umd',
      name: 'Vuex'
    },
    env: 'development'
  },
  {
    input: 'src/index.ts',
    output: {
      file: './dist/vuex-pro.min.js',
      format: 'umd',
      name: 'Vuex'
    },
    min: true,
    env: 'production'
  }
];

const defaultPlugins = [
  cjs(),
  rs({
    extensions: ['.js', '.ts']
  })
];

async function build() {
  for (const value of config) {
    const { input, output, external = [], types, min, env } = value;
    const rollupConfig = {
      input,
      external,
      plugins: defaultPlugins
    };
    rollupConfig.plugins.push(
      ts({
        check: false,
        tsconfigOverride: {
          compilerOptions: { declaration: !!types },
          include: ['src/**/*.ts']
        }
      }),
      replace({
        'process.env.NODE_ENV': `"${env}"`,
        __DEV__: env === 'development'
      })
    );
    await rollup(rollupConfig)
      .then((bunlde) => {
        return bunlde.generate(output);
      })
      .then((res) => {
        let js = res.output[0].code;
        for (let i = 1; i < res.output.length; i++) {
          const item = res.output[i];
          fs.outputFileSync(
            path.resolve(process.cwd(), 'dist', item.fileName),
            item.source
          );
        }
        if (min) {
          js = terser.minify(js, {
            toplevel: true,
            output: {
              ascii_only: true
            },
            compress: {
              pure_funcs: ['makeMap']
            }
          }).code;
        }
        fs.outputFileSync(output.file, js);
      });
  }
}

build();

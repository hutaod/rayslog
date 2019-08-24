const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')

const config = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    name: 'RayslogCore',
    sourcemap: true,
    globals: {
      react: 'React',
      'react-redux': 'ReactRedux',
      redux: 'Redux',
      'redux-saga': 'ReduxSaga',
      'redux-thunk': 'ReduxThunk',
      'detect-node': 'DetectNode'
    }
  },
  external: [
    'react',
    'react-redux',
    'redux',
    'redux-saga',
    'redux-thunk',
    'detect-node'
  ],
  plugins: [
    resolve({
      modulesOnly: true,
      customResolveOptions: {
        moduleDirectory: ['../../node_modules', '../']
      }
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false
          }
        ]
      ],
      plugins: [
        '@babel/plugin-external-helpers',
        '@babel/plugin-transform-react-jsx',
        '@babel/plugin-transform-async-to-generator'
      ]
    }),
    commonjs({
      include: /node_modules/
    })
  ]
}

module.exports = config

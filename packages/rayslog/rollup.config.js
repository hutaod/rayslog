const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')

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
    nodeResolve(),
    babel(),
    commonjs({
      include: /node_modules/
    })
  ]
}

module.exports = config

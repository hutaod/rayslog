const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')

const config = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    name: 'rayslog',
    sourcemap: true,
    globals: {
      react: 'React'
    }
  },
  external: ['react'],
  plugins: [
    resolve({
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
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-transform-react-jsx'
      ]
    }),
    commonjs({
      include: /node_modules/
    })
  ]
}

module.exports = config
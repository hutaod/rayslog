module.exports = {
  root: true,

  parser: 'babel-eslint',

  plugins: ['import', 'react', 'jsx-a11y'],

  settings: {
    react: {
      version: 'detect'
    }
  },

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true
  },

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
      experimentalObjectRestSpread: true
    }
  },

  rules: {
    semi: ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'no-multi-spaces': ['error'],
    'space-infix-ops': ['error'],
    'space-in-parens': ['error', 'never'],
    'spaced-comment': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'space-before-blocks': ['error'],
    'no-unused-vars': ['warn'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],

    'import/newline-after-import': ['error'],
    'import/order': [
      'error',
      { groups: [['builtin', 'external', 'internal']] }
    ],

    'jsx-a11y/anchor-is-valid': [
      'warn',
      {
        aspects: ['invalidHref']
      }
    ],

    'react/default-props-match-prop-types': ['error'],
    'react/no-string-refs': ['error'],
    'react/jsx-handler-names': ['warn'],
    'react/jsx-curly-brace-presence': ['error'],
    'react/no-did-mount-set-state': ['warn'],
    'react/no-unused-prop-types': ['warn'],
    'react/no-unused-state': ['warn'],
    'react/prop-types': ['warn'],
    'react/sort-comp': [
      'warn',
      {
        order: [
          'static-methods',
          'instance-variables',
          'lifecycle',
          '/^handle.+$/',
          '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
          'instance-methods',
          'everything-else',
          'rendering'
        ],
        groups: {
          lifecycle: [
            'displayName',
            'propTypes',
            'contextTypes',
            'childContextTypes',
            'mixins',
            'statics',
            'defaultProps',
            'constructor',
            'getDefaultProps',
            'getInitialState',
            'state',
            'getChildContext',
            'componentWillMount',
            'componentDidMount',
            'componentWillReceiveProps',
            'shouldComponentUpdate',
            'componentWillUpdate',
            'getSnapshotBeforeUpdate',
            'componentDidUpdate',
            'componentWillUnmount'
          ],
          rendering: ['/^render.+$/', 'render']
        }
      }
    ]
  }
};

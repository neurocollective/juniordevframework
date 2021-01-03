module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'indent': 'off', // maybe turn this back on?
    'comma-dangle': 'off',
    'object-shorthand': 'off',
    'space-before-function-paren': 'off',
    'arrow-body-style': 'off'
  },
};

module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    indent: 'off', // maybe turn this back on?
    'comma-dangle': 'off',
    'object-shorthand': 'off',
    'space-before-function-paren': 'off',
    'arrow-body-style': 'off'
  },
};

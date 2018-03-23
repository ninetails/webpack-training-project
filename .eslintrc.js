module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "rules": {
    "arrow-parens": ["error", "as-needed"],
    "max-len": 0,
    "object-curly-spacing": ["error", "always"]
  }
};

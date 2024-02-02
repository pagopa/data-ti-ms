module.exports = {
  env: {
    es6: true,
    node: true,
    jasmine: true,
    jest: true
  },
  ignorePatterns: [
    "node_modules",
    "generated",
    "**/__tests__/*",
    "**/__mocks__/*",
    "*.d.ts",
    "*.js",
    "Dangerfile.ts",
    "**/__integrations__/utils",
    "**/__integrations__/env.ts",
    "index.ts"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module"
  },
  extends: ["@pagopa/eslint-config/strong"],
  rules: {}
};

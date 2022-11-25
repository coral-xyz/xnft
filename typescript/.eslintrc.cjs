module.exports = {
  root: true,
  ignorePatterns: ["**/*.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};

module.exports = [
  // ignore common build folders
  {
    ignores: ["node_modules/**", "build/**"]
  },
  // TypeScript + React rules for .ts/.tsx
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks")
    },
    rules: {
      // React in scope is not required with modern toolchains
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // TypeScript useful defaults
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    },
    settings: {
      react: { version: "detect" }
    }
  }
];

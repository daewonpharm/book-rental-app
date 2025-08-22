// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  plugins: ["react"],
  extends: [
    "eslint:recommended",
    // React 17+는 자동 JSX 변환이라 plugin만 있어도 OK
  ],
  settings: { react: { version: "detect" } },
  rules: {
    // 🔒 핵심: HTML 주입 금지
    "react/no-danger": "error",
    // 보안/안전 추천 규칙 몇 가지
    "react/jsx-no-target-blank": ["warn", { enforceDynamicLinks: "always" }],
    "no-eval": "error",
    "no-implied-eval": "error"
  }
};

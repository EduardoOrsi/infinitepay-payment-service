import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  typescript: true,
  markdown: false,
  ignores: ["shopify-theme/**"],

  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
}, {
  rules: {
    "perfectionist/sort-imports": "error",
  },
}, {
  files: ["pnpm-workspace.yaml"],
  rules: {
    "pnpm/yaml-enforce-settings": "off",
  },
});

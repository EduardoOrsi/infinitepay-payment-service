import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  typescript: true,

  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
}, {
  rules: {
    "perfectionist/sort-imports": "error",
  },
});

import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  routeRules: {
    "/api/**": {
      cors: true,
      headers: {
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "Content-Type",
      },
    },
  },
});

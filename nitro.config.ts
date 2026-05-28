import { defineConfig } from "nitro";

export default defineConfig({
  preset: "vercel",
  serverDir: "./server",
  routeRules: {
    "/api/checkout/**": {
      cors: true,
    },
    "/api/webhooks/**": {
      headers: {
        "access-control-allow-methods": "POST",
      },
    },
  },
});

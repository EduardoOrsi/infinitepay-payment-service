import process from "node:process";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "turso",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});

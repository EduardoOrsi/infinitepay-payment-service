import process from "node:process";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "sqlite",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:dev.db",
  },
});

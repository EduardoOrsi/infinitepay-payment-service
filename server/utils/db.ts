import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema.ts";
import { env } from "./env.ts";

export const db = drizzle({
  connection: {
    url: env.databaseUrl,
    ...(env.tursoAuthToken ? { authToken: env.tursoAuthToken } : {}),
  },
  casing: "snake_case",
  schema,
});

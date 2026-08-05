import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import * as schema from "../models/schema.ts";
config();

const pgUrl = process.env.DATABASE_URL;
if (!pgUrl) {
  throw new Error("DB_URL is not set in environment variables");
}

const sql = neon(pgUrl);
export const db = drizzle(sql, { schema });
console.log("Connected to PostgreSQL via Drizzle");

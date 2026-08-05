import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config();
const pgUrl = process.env.DATABASE_URL;
if (!pgUrl) {
  throw new Error("DB_URL is not set in environment variables");
}

const sql = neon(pgUrl!);
export const db = drizzle({ client: sql });

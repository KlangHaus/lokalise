import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL!;

// Configure postgres client with proper pooling
const client = postgres(connectionString, {
	max: 10, // Max connections in pool
	idle_timeout: 20, // Close idle connections after 20s
	connect_timeout: 10, // Connection timeout 10s
});

export const db = drizzle(client, { schema });
export type Database = typeof db;

export * from "./schema/index";

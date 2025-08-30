import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/mysql-schema";

// Use MySQL database from secrets
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`Connecting to MySQL database: ${DATABASE_URL.includes('mysql://') ? 'MySQL Server' : 'Database Server'}`);

export const connection = mysql.createPool(DATABASE_URL);
export const db = drizzle(connection, { schema, mode: 'default' });
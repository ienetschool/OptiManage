import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/mysql-schema";

// Use production MySQL database for both development and production
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro';

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`Connecting to MySQL database: opticpro at ${DATABASE_URL.includes('5.181.218.15') ? '5.181.218.15:3306' : 'localhost:3306'}`);

export const connection = mysql.createPool(DATABASE_URL);
export const db = drizzle(connection, { schema, mode: 'default' });
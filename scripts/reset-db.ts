import { connection, closeDatabase } from '/Users/royalsgroup/Documents/GitHub/OptiManage/OptiManage/server/db.ts';
import 'dotenv/config';

async function resetDatabase() {
  try {
    console.log('Attempting to drop and recreate database...');
    // Extract database name from DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set.');
    }
    const dbNameMatch = databaseUrl.match(/\/([^/?]+)(?:\?|$)/);
    if (!dbNameMatch || !dbNameMatch[1]) {
      throw new Error('Could not extract database name from DATABASE_URL.');
    }
    const dbName = dbNameMatch[1];

    // Drop database
    await connection.execute(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`Database ${dbName} dropped successfully.`);

    // Create database
    await connection.execute(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created successfully.`);

  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await closeDatabase();
  }
}

resetDatabase();
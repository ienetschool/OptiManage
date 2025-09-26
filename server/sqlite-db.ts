import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/mysql-schema";
import path from 'path';

// Create SQLite database file in the project root
const dbPath = path.join(process.cwd(), 'local.db');
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Initialize with sample doctors data
export async function initializeSampleData() {
  try {
    // Check if doctors table exists and has data
    const existingDoctors = await db.select().from(schema.doctors).limit(1);
    
    if (existingDoctors.length === 0) {
      // Insert sample doctors
      await db.insert(schema.doctors).values([
        {
          id: 'doc-001',
          firstName: 'Dr. John',
          lastName: 'Smith',
          email: 'dr.smith@optistorepro.com',
          phone: '+1-555-0101',
          specialization: 'Optometrist',
          licenseNumber: 'OPT-12345',
          department: 'Eye Care',
          isActive: true
        },
        {
          id: 'doc-002',
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          email: 'dr.johnson@optistorepro.com',
          phone: '+1-555-0102',
          specialization: 'Ophthalmologist',
          licenseNumber: 'OPH-67890',
          department: 'Surgery',
          isActive: true
        },
        {
          id: 'doc-003',
          firstName: 'Dr. Michael',
          lastName: 'Brown',
          email: 'dr.brown@optistorepro.com',
          phone: '+1-555-0103',
          specialization: 'Optometrist',
          licenseNumber: 'OPT-54321',
          department: 'Eye Care',
          isActive: true
        }
      ]);
      
      console.log('Sample doctors data initialized');
    }
  } catch (error) {
    console.log('Sample data initialization:', error);
  }
}

// Test connection
export async function testConnection() {
  try {
    const result = sqlite.prepare('SELECT 1 as test').get();
    console.log('SQLite connection successful:', result);
    return true;
  } catch (error) {
    console.error('SQLite connection failed:', error);
    return false;
  }
}

// Close database connection
export function closeDatabase() {
  sqlite.close();
}
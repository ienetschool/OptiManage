import { db } from "./db";
import { sql } from "drizzle-orm";

// Fix staff table schema issues
async function fixStaffSchema() {
  try {
    console.log("🔧 Fixing staff table schema...");
    
    // Remove salary column if it exists
    await db.execute(sql`ALTER TABLE staff DROP COLUMN IF EXISTS salary`);
    console.log("✅ Removed salary column");
    
    // Add role_id column if it doesn't exist
    await db.execute(sql`ALTER TABLE staff ADD COLUMN IF NOT EXISTS role_id VARCHAR(36) AFTER store_id`);
    console.log("✅ Added role_id column");
    
    // Create roles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        permissions JSON,
        is_system_role BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created roles table");
    
    // Insert default roles
    await db.execute(sql`
      INSERT IGNORE INTO roles (name, description, permissions, is_system_role) VALUES
      ('Doctor', 'Medical practitioner with full patient access', '{"viewPatients":true,"editPatients":true,"viewAppointments":true,"editAppointments":true,"viewPrescriptions":true,"editPrescriptions":true,"viewReports":true}', TRUE),
      ('Receptionist', 'Front desk staff with appointment and patient management', '{"viewPatients":true,"editPatients":true,"viewAppointments":true,"editAppointments":true,"viewInventory":true,"manageAppointments":true}', TRUE),
      ('Manager', 'Store manager with full operational access', '{"viewPatients":true,"editPatients":true,"viewAppointments":true,"editAppointments":true,"viewInventory":true,"editInventory":true,"viewReports":true,"editReports":true,"manageStaff":true,"systemSettings":true}', TRUE),
      ('Technician', 'Optical technician with inventory and fitting access', '{"viewPatients":true,"viewAppointments":true,"viewInventory":true,"editInventory":true,"viewSales":true,"manageFittings":true}', TRUE),
      ('Admin', 'System administrator with full access', '{"viewPatients":true,"editPatients":true,"viewAppointments":true,"editAppointments":true,"viewInventory":true,"editInventory":true,"viewSales":true,"editSales":true,"viewReports":true,"editReports":true,"manageStaff":true,"systemSettings":true,"manageRoles":true}', TRUE)
    `);
    console.log("✅ Inserted default roles");
    
    return { success: true, message: "Staff schema fixed successfully" };
  } catch (error) {
    console.error("❌ Error fixing staff schema:", error);
    return { success: false, error: error.message };
  }
}

// Run the fix
fixStaffSchema().then(result => {
  console.log("Database fix result:", result);
});
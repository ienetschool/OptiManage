# FINAL PRODUCTION SERVER FIX

## Current Status
✅ Website Loading: opt.vivaindia.com now displays OptiStore Pro interface
✅ Production Server: Running on port 8080 with MySQL database
❌ Form Submissions: Still showing "Failed to register patient" errors

## Root Cause
The production server needs the updated MySQL-compatible medicalRoutes.ts file that removes PostgreSQL .returning() syntax.

## URGENT FIX - Run in SSH Terminal:

```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Backup current file
cp server/medicalRoutes.ts server/medicalRoutes.ts.backup

# Create the MySQL-compatible medicalRoutes.ts
cat > server/medicalRoutes.ts << 'EOF'
import type { Express } from "express";
import { 
  doctors, 
  patients, 
  medicalAppointments, 
  prescriptions,
  insertDoctorSchema,
  insertPatientSchema,
  insertMedicalAppointmentSchema,
  insertPrescriptionSchema
} from "@shared/mysql-schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "./oauthAuth";

export function registerMedicalRoutes(app: Express) {
  // Public patient registration endpoint
  app.post("/api/patients", async (req, res) => {
    try {
      console.log("Received patient registration data:", req.body);
      
      const patientCode = req.body.patientCode || `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const validationData = { ...req.body };
      delete validationData.patientCode;
      
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      const validatedData = modifiedSchema.parse(validationData);
      
      const finalData = {
        ...validatedData,
        patientCode: patientCode
      };
      
      console.log("Final data for insertion:", finalData);
      
      // MySQL compatible insert (no .returning())
      await db.insert(patients).values(finalData);
      
      // Fetch the created patient
      const [patient] = await db.select().from(patients).where(eq(patients.patientCode, patientCode)).limit(1);
      
      console.log("Patient created successfully:", patient);
      res.json(patient);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      
      if (error.issues) {
        return res.status(400).json({ 
          message: "Validation failed", 
          error: JSON.stringify(error.issues, null, 2)
        });
      }
      
      res.status(500).json({ message: "Failed to create patient", error: error?.message || "Unknown error" });
    }
  });

  // Get patients
  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patientsList = await db.select().from(patients).orderBy(desc(patients.createdAt));
      res.json(patientsList);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });
}
EOF

# Restart production server
pkill -f 'tsx server/index.ts'
sleep 3
NODE_ENV=production PORT=8080 DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' tsx server/index.ts > production.log 2>&1 &

# Verify restart
sleep 10
ps aux | grep tsx | grep -v grep

# Test patient registration
curl -s -X POST http://localhost:8080/api/patients -H "Content-Type: application/json" -d '{"firstName":"FINAL_TEST","lastName":"Production","phone":"8888888888","email":"finaltest@prod.com"}' | head -c 400
```

## Expected Result
After running these commands, the production website will have fully functional patient registration forms matching the development environment.
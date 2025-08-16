#!/bin/bash
echo "URGENT FIXES FOR DEVELOPMENT AND PRODUCTION"
echo "=========================================="

# Fix 1: Date validation in development
echo "Fixing date validation in medicalRoutes.ts..."
cat > server/medicalRoutes_FIXED.ts << 'EOF'
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
      
      // Auto-generate patient code if not provided
      const patientCode = req.body.patientCode || `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Remove patientCode from validation data
      const validationData = { ...req.body };
      delete validationData.patientCode;
      
      // Handle date conversion for form submissions
      if (validationData.dateOfBirth && typeof validationData.dateOfBirth === 'string') {
        validationData.dateOfBirth = validationData.dateOfBirth ? new Date(validationData.dateOfBirth) : null;
      }
      
      // Create schema without patientCode validation
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      
      // Parse and validate data
      const validatedData = modifiedSchema.parse(validationData);
      
      // Add the auto-generated patientCode
      const finalData = {
        ...validatedData,
        patientCode: patientCode
      };
      
      console.log("Final data for insertion:", finalData);
      
      // MySQL compatible insert
      await db.insert(patients).values(finalData);
      
      // Fetch the created patient
      const [patient] = await db.select().from(patients).where(eq(patients.patientCode, patientCode)).limit(1);
      
      console.log("Patient created successfully:", patient);
      res.json(patient);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      
      // Handle validation errors
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

# Replace the current file
cp server/medicalRoutes_FIXED.ts server/medicalRoutes.ts

echo "✅ Development medicalRoutes.ts fixed for date validation"

# Fix 2: Production deployment commands
echo "Creating production deployment script..."
cat > deploy_production_now.sh << 'DEPLOY_EOF'
#!/bin/bash
echo "SSH into: ssh root@5.181.218.15"  
echo "Password: &8KXC4D+Ojfhuu0LSMhE"
echo "Then run:"
echo ""
echo "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "pkill -f 'tsx server/index.ts'"
echo "sudo fuser -k 8080/tcp"
echo "DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' NODE_ENV=production PORT=8080 tsx server/index.ts > production.log 2>&1 &"
echo "sleep 15 && ps aux | grep tsx | grep -v grep"
DEPLOY_EOF

chmod +x deploy_production_now.sh

echo "✅ Both fixes ready:"
echo "1. Development date validation fixed"
echo "2. Production deployment script created"
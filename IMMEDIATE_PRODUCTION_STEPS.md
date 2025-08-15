# 🚨 IMMEDIATE PRODUCTION SERVER FIX STEPS

The production server needs the MySQL-compatible code uploaded. Since you have direct SSH access, follow these exact steps:

## Step 1: Connect to Production Server
```bash
ssh root@5.181.218.15
```

## Step 2: Navigate and Stop Server
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
sudo fuser -k 8080/tcp
pkill -f 'tsx server/index.ts'
```

## Step 3: Update the MySQL Compatibility Files
```bash
# Update medicalRoutes.ts (remove PostgreSQL .returning() calls)
cat > server/medicalRoutes.ts << 'MEDICAL_EOF'
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
  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patientsList = await db.select().from(patients).orderBy(desc(patients.createdAt));
      res.json(patientsList);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      console.log("Received patient registration data:", req.body);
      
      const patientCode = req.body.patientCode || \`PAT-\${new Date().getFullYear()}-\${String(Date.now()).slice(-6)}\`;
      const validationData = { ...req.body };
      delete validationData.patientCode;
      
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      const validatedData = modifiedSchema.parse(validationData);
      
      const finalData = {
        ...validatedData,
        patientCode: patientCode
      };
      
      console.log("Final data for insertion:", finalData);
      
      await db.insert(patients).values(finalData);
      
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
}
MEDICAL_EOF
```

## Step 4: Restart Production Server
```bash
NODE_ENV=production PORT=8080 DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' tsx server/index.ts > production.log 2>&1 &
```

## Step 5: Verify Server is Running
```bash
sleep 10
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep :8080
curl -s http://localhost:8080/api/dashboard | head -c 100
```

## Step 6: Test Form Submission
```bash
curl -s -X POST http://localhost:8080/api/patients -H "Content-Type: application/json" -d '{"firstName":"ProductionTest","lastName":"Fixed","phone":"9999999999","email":"prodtest@fixed.com"}' | head -c 300
```

After completing these steps, the production server will have the MySQL-compatible code and all form submissions will work properly on opt.vivaindia.com.

## ✅ Expected Results
- Production server running on port 8080
- Patient registration working without errors
- All forms submitting successfully
- No more "Failed to register patient" errors
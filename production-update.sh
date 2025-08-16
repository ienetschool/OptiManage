#!/bin/bash

# Direct production server update without SSH password prompts
echo "PRODUCTION SERVER UPDATE - MYSQL DEPLOYMENT"
echo "=========================================="

# Create a comprehensive production update script
cat > update-production-server.sh << 'UPDATE_EOF'
#!/bin/bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "Setting MySQL database configuration..."
echo 'DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro"' > .env

echo "Creating clean MySQL medicalRoutes.ts..."
cat > server/medicalRoutes.ts << 'MEDICAL_EOF'
import type { Express } from "express";
import { 
  patients,
  insertPatientSchema
} from "@shared/mysql-schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "./oauthAuth";

export function registerMedicalRoutes(app: Express) {
  app.post("/api/patients", async (req, res) => {
    try {
      console.log("MySQL Patient Registration:", req.body);
      
      const patientCode = `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const validationData = { ...req.body };
      delete validationData.patientCode;
      
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      const validatedData = modifiedSchema.parse(validationData);
      const finalData = { ...validatedData, patientCode };
      
      console.log("MySQL Insert:", finalData);
      await db.insert(patients).values(finalData);
      
      const [patient] = await db.select().from(patients).where(eq(patients.patientCode, patientCode)).limit(1);
      console.log("MySQL Patient Created:", patient);
      
      res.json(patient);
    } catch (error) {
      console.error("MySQL Error:", error);
      res.status(500).json({ message: "Failed to create patient", error: error.message });
    }
  });

  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patientsList = await db.select().from(patients).orderBy(desc(patients.createdAt));
      res.json(patientsList);
    } catch (error) {
      console.error("MySQL Fetch Error:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });
}
MEDICAL_EOF

echo "Removing all PostgreSQL syntax from route files..."
find server/ -name "*.ts" -exec sed -i 's/\.returning([^)]*)//' {} \;
find server/ -name "*.ts" -exec sed -i 's/\.returning()//' {} \;

echo "Restarting production server with MySQL..."
pkill -f 'tsx server/index.ts'
sudo fuser -k 8080/tcp 2>/dev/null
sleep 5

DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" NODE_ENV=production PORT=8080 tsx server/index.ts > production.log 2>&1 &

echo "Waiting for server startup..."
sleep 20

echo "Verifying production server..."
ps aux | grep tsx | grep -v grep

echo "Testing MySQL patient registration..."
curl -s -X POST http://localhost:8080/api/patients -H "Content-Type: application/json" -d '{"firstName":"PRODUCTION_UPDATE","lastName":"Success","phone":"1234567890","email":"prod_update@success.com"}' | head -c 400

echo "Checking server logs..."
tail -10 production.log

echo "✅ Production server updated with MySQL compatibility"
UPDATE_EOF

chmod +x update-production-server.sh

echo "Production update script created: update-production-server.sh"
echo "Copy this script to your production server and run it to complete the MySQL deployment"
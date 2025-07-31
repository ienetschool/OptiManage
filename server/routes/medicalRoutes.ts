import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

export function registerMedicalRecordsRoutes(app: Express) {
  // Get medical records
  app.get("/api/medical-records", isAuthenticated, async (req, res) => {
    try {
      const { search, type } = req.query;
      
      // Mock medical records data
      const medicalRecords = [
        {
          id: "1",
          patientId: "1",
          patientName: "Sarah Johnson",
          recordType: "Eye Examination",
          diagnosis: "Myopia - Mild nearsightedness",
          treatment: "Prescribed corrective lenses",
          bloodPressure: "120/80",
          bloodSugar: "95",
          bloodGroup: "A+",
          temperature: "98.6",
          pulse: "72",
          weight: "140 lbs",
          height: "5'6\"",
          allergies: "None known",
          medications: "None",
          notes: "Patient reports mild headaches during reading",
          recordDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          doctorName: "Dr. Smith"
        },
        {
          id: "2",
          patientId: "2",
          patientName: "Michael Chen",
          recordType: "Contact Lens Fitting",
          diagnosis: "Astigmatism",
          treatment: "Toric contact lenses fitted",
          bloodPressure: "125/85",
          bloodSugar: "88",
          bloodGroup: "B+",
          temperature: "98.4",
          pulse: "68",
          weight: "165 lbs",
          height: "5'9\"",
          allergies: "Seasonal allergies",
          medications: "Antihistamines",
          notes: "Patient prefers daily disposable lenses",
          recordDate: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          doctorName: "Dr. Rodriguez"
        }
      ];

      let filteredRecords = medicalRecords;

      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredRecords = filteredRecords.filter(record =>
          record.patientName.toLowerCase().includes(searchTerm) ||
          record.diagnosis.toLowerCase().includes(searchTerm) ||
          record.recordType.toLowerCase().includes(searchTerm)
        );
      }

      if (type && type !== "all") {
        filteredRecords = filteredRecords.filter(record => record.recordType === type);
      }

      res.json(filteredRecords);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  // Create medical record
  app.post("/api/medical-records", isAuthenticated, async (req, res) => {
    try {
      const recordData = req.body;
      
      // Mock create - replace with actual database insert
      const newRecord = {
        id: Date.now().toString(),
        ...recordData,
        recordDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        doctorName: "Dr. Smith" // Get from authenticated user
      };

      res.json(newRecord);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ message: "Failed to create medical record" });
    }
  });

  // Delete medical record
  app.delete("/api/medical-records/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock delete - replace with actual database delete
      res.json({ message: "Medical record deleted successfully" });
    } catch (error) {
      console.error("Error deleting medical record:", error);
      res.status(500).json({ message: "Failed to delete medical record" });
    }
  });
}
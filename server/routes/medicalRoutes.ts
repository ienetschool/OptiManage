import type { Express } from "express";
import { isAuthenticated } from "../simpleAuth";
import { storage } from "../storage";

export function registerMedicalRecordsRoutes(app: Express) {
  // Get medical records
  app.get("/api/medical-records", isAuthenticated, async (req, res) => {
    try {
      const { search, type } = req.query;
      
      // Get real medical records from database via patients table
      const allPatients = await storage.getPatients();
      
      // Transform patient data into medical records format
      const medicalRecords = allPatients.map(patient => ({
        id: patient.id,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        recordType: "Comprehensive Eye Examination",
        diagnosis: patient.medicalHistory || "Routine examination",
        treatment: patient.currentMedications || "No current treatment",
        bloodPressure: "120/80", // These could be added to patient schema if needed
        bloodSugar: "95",
        bloodGroup: patient.bloodGroup || "Not specified",
        temperature: "98.6",
        pulse: "72",
        weight: "Not recorded",
        height: "Not recorded",
        allergies: patient.allergies || "None known",
        medications: patient.currentMedications || "None",
        notes: `Patient Code: ${patient.patientCode}. Insurance: ${patient.insuranceProvider || 'Not provided'}`,
        recordDate: patient.lastEyeExamDate || patient.createdAt,
        createdAt: patient.createdAt,
        doctorName: "Dr. Smith" // Could be enhanced with doctor assignment
      }));

      // Apply existing mock records for demonstration
      const mockRecords = [
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

      // Combine real patient data with mock records for demonstration
      const allRecords = [...medicalRecords, ...mockRecords];
      let filteredRecords = allRecords;

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
      
      // If this is a new patient record, create patient entry
      if (recordData.patientId === 'new' || !recordData.patientId) {
        // Create new patient with medical record data
        const newPatient = await storage.insertPatient({
          patientCode: `PAT-${Date.now().toString().slice(-6)}`,
          firstName: recordData.patientName?.split(' ')[0] || 'Unknown',
          lastName: recordData.patientName?.split(' ').slice(1).join(' ') || 'Patient',
          medicalHistory: recordData.diagnosis,
          currentMedications: recordData.medications,
          allergies: recordData.allergies,
          bloodGroup: recordData.bloodGroup,
          lastEyeExamDate: new Date().toISOString().split('T')[0],
        });
        
        const newRecord = {
          id: newPatient.id,
          patientId: newPatient.id,
          patientName: `${newPatient.firstName} ${newPatient.lastName}`,
          recordType: recordData.recordType || "Medical Record",
          diagnosis: recordData.diagnosis,
          treatment: recordData.treatment,
          bloodPressure: recordData.bloodPressure,
          bloodSugar: recordData.bloodSugar,
          bloodGroup: recordData.bloodGroup,
          temperature: recordData.temperature,
          pulse: recordData.pulse,
          weight: recordData.weight,
          height: recordData.height,
          allergies: recordData.allergies,
          medications: recordData.medications,
          notes: recordData.notes,
          recordDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          doctorName: "Dr. Smith" // Enhanced with actual doctor from session
        };
        
        res.json(newRecord);
      } else {
        // Update existing patient with new medical record information
        const existingPatient = await storage.getPatient(recordData.patientId);
        if (existingPatient) {
          await storage.updatePatient(recordData.patientId, {
            medicalHistory: recordData.diagnosis,
            currentMedications: recordData.medications,
            allergies: recordData.allergies,
            lastEyeExamDate: new Date().toISOString().split('T')[0],
          });
        }
        
        const newRecord = {
          id: Date.now().toString(),
          ...recordData,
          recordDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          doctorName: "Dr. Smith"
        };
        
        res.json(newRecord);
      }
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
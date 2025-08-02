import React from 'react';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodGroup: string;
  allergies: string;
  medicalHistory: string;
  currentMedications: string;
  previousEyeConditions: string;
  lastEyeExamDate: string;
  currentPrescription: string;
  riskFactors: string;
  familyMedicalHistory: string;
  smokingStatus: string;
  alcoholConsumption: string;
  exerciseFrequency: string;
  rightEyeSphere: string;
  rightEyeCylinder: string;
  rightEyeAxis: string;
  leftEyeSphere: string;
  leftEyeCylinder: string;
  leftEyeAxis: string;
  pupillaryDistance: string;
  doctorNotes: string;
  treatmentPlan: string;
  followUpDate: string;
  medicalAlerts: string;
  createdAt: string;
}

interface PatientProfilePDFProps {
  patient: Patient;
  appointments: any[];
  prescriptions: any[];
  invoices: any[];
}

export const generateMultiPagePatientPDF = (
  patient: Patient, 
  appointments: any[], 
  prescriptions: any[], 
  invoices: any[]
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalAppointments = appointments.length;
  const totalPrescriptions = prescriptions.length;
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Complete Patient Medical Profile - ${patient.firstName} ${patient.lastName}</title>
        <style>
          @page { 
            size: A4; 
            margin: 15mm; 
            @top-center {
              content: "OptiStore Pro Medical Center - Patient: ${patient.firstName} ${patient.lastName}";
              font-size: 10pt;
              color: #666;
            }
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 10pt;
              color: #666;
            }
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 11pt; 
            color: #333; 
            line-height: 1.4;
          }
          
          .page-break { 
            page-break-before: always; 
          }
          
          .no-break { 
            page-break-inside: avoid; 
          }
          
          .profile-header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            text-align: center;
          }
          
          .clinic-name { 
            font-size: 24pt; 
            font-weight: 900; 
            margin-bottom: 5px; 
          }
          
          .patient-name { 
            font-size: 18pt; 
            font-weight: 600; 
            margin-bottom: 10px; 
          }
          
          .patient-info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 25px; 
          }
          
          .info-section { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #667eea;
          }
          
          .section-title { 
            font-weight: 700; 
            color: #2d3748; 
            margin-bottom: 12px; 
            font-size: 12pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-row { 
            margin-bottom: 8px; 
            display: flex;
            justify-content: space-between;
          }
          
          .info-label { 
            font-weight: 600; 
            color: #4a5568; 
            min-width: 120px;
          }
          
          .info-value { 
            color: #2d3748; 
            flex: 1;
            text-align: right;
          }
          
          .medical-section { 
            background: #e8f5e8; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            border-left: 4px solid #38a169;
          }
          
          .prescription-section { 
            background: #e6fffa; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            border-left: 4px solid #319795;
          }
          
          .financial-section { 
            background: #fef5e7; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            border-left: 4px solid #d69e2e;
          }
          
          .vision-prescription { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 15px 0;
          }
          
          .eye-details { 
            background: white; 
            padding: 12px; 
            border-radius: 6px; 
            border: 1px solid #e2e8f0;
          }
          
          .eye-title { 
            font-weight: 600; 
            color: #2d3748; 
            margin-bottom: 8px; 
            text-align: center;
            font-size: 11pt;
          }
          
          .summary-cards { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin: 20px 0; 
          }
          
          .summary-card { 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            text-align: center; 
            border: 1px solid #e2e8f0;
          }
          
          .card-value { 
            font-size: 18pt; 
            font-weight: bold; 
            color: #667eea; 
            margin-bottom: 5px;
          }
          
          .card-label { 
            font-size: 9pt; 
            color: #718096; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .appointments-table, .prescriptions-table, .invoices-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            font-size: 10pt;
          }
          
          .appointments-table th, .prescriptions-table th, .invoices-table th { 
            background: #667eea; 
            color: white; 
            padding: 8px; 
            text-align: left; 
            font-weight: 600;
          }
          
          .appointments-table td, .prescriptions-table td, .invoices-table td { 
            padding: 8px; 
            border-bottom: 1px solid #e2e8f0; 
          }
          
          .appointments-table tr:nth-child(even), 
          .prescriptions-table tr:nth-child(even), 
          .invoices-table tr:nth-child(even) { 
            background: #f7fafc; 
          }
          
          .status-badge { 
            padding: 3px 8px; 
            border-radius: 12px; 
            font-size: 9pt; 
            font-weight: 600;
          }
          
          .status-completed { background: #c6f6d5; color: #22543d; }
          .status-scheduled { background: #bee3f8; color: #2a4365; }
          .status-pending { background: #feebc8; color: #744210; }
          .status-paid { background: #c6f6d5; color: #22543d; }
          
          .qr-section { 
            text-align: center; 
            padding: 15px; 
            background: #f7fafc; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          
          .medical-notes { 
            background: #fffaf0; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #ed8936; 
            margin: 15px 0;
          }
          
          .emergency-info { 
            background: #fed7d7; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #e53e3e; 
            margin: 15px 0;
          }

          @media print {
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <!-- Page 1: Patient Overview -->
        <div class="profile-header">
          <div class="clinic-name">OptiStore Pro Medical Center</div>
          <div class="patient-name">${patient.firstName} ${patient.lastName}</div>
          <div>Complete Medical Profile Report</div>
          <div style="font-size: 10pt; margin-top: 10px;">
            Generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'h:mm a')}
          </div>
        </div>

        <!-- Patient Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-value">${totalAppointments}</div>
            <div class="card-label">Total Appointments</div>
          </div>
          <div class="summary-card">
            <div class="card-value">${totalPrescriptions}</div>
            <div class="card-label">Prescriptions</div>
          </div>
          <div class="summary-card">
            <div class="card-value">${totalInvoices}</div>
            <div class="card-label">Invoices</div>
          </div>
          <div class="summary-card">
            <div class="card-value">$${totalAmount.toFixed(2)}</div>
            <div class="card-label">Total Billing</div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="patient-info-grid">
          <div class="info-section">
            <div class="section-title">Personal Information</div>
            <div class="info-row">
              <span class="info-label">Patient ID:</span>
              <span class="info-value">${patient.patientCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date of Birth:</span>
              <span class="info-value">${patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Gender:</span>
              <span class="info-value">${patient.gender || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Blood Group:</span>
              <span class="info-value">${patient.bloodGroup || 'N/A'}</span>
            </div>
          </div>

          <div class="info-section">
            <div class="section-title">Contact Information</div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${patient.phone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${patient.email || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${patient.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="emergency-info no-break">
          <div class="section-title">Emergency Contact Information</div>
          <div class="patient-info-grid">
            <div>
              <div class="info-row">
                <span class="info-label">Contact Name:</span>
                <span class="info-value">${patient.emergencyContact || 'N/A'}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">Contact Phone:</span>
                <span class="info-value">${patient.emergencyPhone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Vision Prescription -->
        ${(patient.rightEyeSphere || patient.leftEyeSphere) ? `
          <div class="prescription-section no-break">
            <div class="section-title">Current Vision Prescription</div>
            <div class="vision-prescription">
              <div class="eye-details">
                <div class="eye-title">Right Eye (OD)</div>
                <div class="info-row">
                  <span class="info-label">Sphere (SPH):</span>
                  <span class="info-value">${patient.rightEyeSphere || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Cylinder (CYL):</span>
                  <span class="info-value">${patient.rightEyeCylinder || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Axis:</span>
                  <span class="info-value">${patient.rightEyeAxis || 'N/A'}</span>
                </div>
              </div>
              
              <div class="eye-details">
                <div class="eye-title">Left Eye (OS)</div>
                <div class="info-row">
                  <span class="info-label">Sphere (SPH):</span>
                  <span class="info-value">${patient.leftEyeSphere || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Cylinder (CYL):</span>
                  <span class="info-value">${patient.leftEyeCylinder || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Axis:</span>
                  <span class="info-value">${patient.leftEyeAxis || 'N/A'}</span>
                </div>
              </div>
            </div>
            ${patient.pupillaryDistance ? `
              <div class="info-row">
                <span class="info-label">Pupillary Distance (PD):</span>
                <span class="info-value">${patient.pupillaryDistance} mm</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Page 2: Medical History -->
        <div class="page-break">
          <div class="profile-header">
            <div class="clinic-name">Medical History & Clinical Information</div>
            <div>Patient: ${patient.firstName} ${patient.lastName} (${patient.patientCode})</div>
          </div>

          <!-- Medical History -->
          <div class="medical-section no-break">
            <div class="section-title">Medical History</div>
            <div class="info-row">
              <span class="info-label">Medical History:</span>
              <span class="info-value">${patient.medicalHistory || 'No significant medical history recorded'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Medications:</span>
              <span class="info-value">${patient.currentMedications || 'None reported'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Allergies:</span>
              <span class="info-value">${patient.allergies || 'No known allergies'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Family Medical History:</span>
              <span class="info-value">${patient.familyMedicalHistory || 'No family history reported'}</span>
            </div>
          </div>

          <!-- Eye Health -->
          <div class="medical-section no-break">
            <div class="section-title">Eye Health Information</div>
            <div class="info-row">
              <span class="info-label">Previous Eye Conditions:</span>
              <span class="info-value">${patient.previousEyeConditions || 'None reported'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Eye Exam:</span>
              <span class="info-value">${patient.lastEyeExamDate ? format(new Date(patient.lastEyeExamDate), 'MMM dd, yyyy') : 'Not recorded'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Risk Factors:</span>
              <span class="info-value">${patient.riskFactors || 'None identified'}</span>
            </div>
          </div>

          <!-- Lifestyle Information -->
          <div class="medical-section no-break">
            <div class="section-title">Lifestyle Information</div>
            <div class="patient-info-grid">
              <div>
                <div class="info-row">
                  <span class="info-label">Smoking Status:</span>
                  <span class="info-value">${patient.smokingStatus || 'Not recorded'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Exercise Frequency:</span>
                  <span class="info-value">${patient.exerciseFrequency || 'Not recorded'}</span>
                </div>
              </div>
              <div>
                <div class="info-row">
                  <span class="info-label">Alcohol Consumption:</span>
                  <span class="info-value">${patient.alcoholConsumption || 'Not recorded'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Clinical Notes -->
          ${patient.doctorNotes ? `
            <div class="medical-notes no-break">
              <div class="section-title">Clinical Notes</div>
              <p style="margin: 0; line-height: 1.6;">${patient.doctorNotes}</p>
            </div>
          ` : ''}

          <!-- Treatment Plan -->
          ${patient.treatmentPlan ? `
            <div class="medical-notes no-break">
              <div class="section-title">Current Treatment Plan</div>
              <p style="margin: 0; line-height: 1.6;">${patient.treatmentPlan}</p>
            </div>
          ` : ''}

          <!-- Medical Alerts -->
          ${patient.medicalAlerts ? `
            <div class="emergency-info no-break">
              <div class="section-title">⚠️ Medical Alerts</div>
              <p style="margin: 0; line-height: 1.6; font-weight: 600;">${patient.medicalAlerts}</p>
            </div>
          ` : ''}
        </div>

        <!-- Page 3: Appointment History -->
        ${appointments.length > 0 ? `
          <div class="page-break">
            <div class="profile-header">
              <div class="clinic-name">Appointment History</div>
              <div>Patient: ${patient.firstName} ${patient.lastName} (${patient.patientCode})</div>
            </div>

            <table class="appointments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Doctor</th>
                  <th>Fee</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                ${appointments.map(apt => `
                  <tr>
                    <td>${format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}</td>
                    <td>${apt.service || 'General Consultation'}</td>
                    <td><span class="status-badge status-${apt.status || 'scheduled'}">${apt.status || 'Scheduled'}</span></td>
                    <td>${apt.assignedDoctorId ? 'Dr. Professional' : 'To be assigned'}</td>
                    <td>$${apt.appointmentFee || '0.00'}</td>
                    <td><span class="status-badge status-${apt.paymentStatus || 'pending'}">${apt.paymentStatus || 'Pending'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            ${appointments.some(apt => apt.notes) ? `
              <div class="medical-notes no-break">
                <div class="section-title">Appointment Notes</div>
                ${appointments.filter(apt => apt.notes).map(apt => `
                  <div style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px;">
                    <strong>${format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}:</strong> ${apt.notes}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Page 4: Prescription History -->
        ${prescriptions.length > 0 ? `
          <div class="page-break">
            <div class="profile-header">
              <div class="clinic-name">Prescription History</div>
              <div>Patient: ${patient.firstName} ${patient.lastName} (${patient.patientCode})</div>
            </div>

            <table class="prescriptions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Prescription #</th>
                  <th>Type</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${prescriptions.map(rx => `
                  <tr>
                    <td>${format(new Date(rx.prescriptionDate || rx.createdAt), 'MMM dd, yyyy')}</td>
                    <td>RX-${rx.prescriptionNumber || rx.id.slice(0, 8)}</td>
                    <td>${rx.prescriptionType?.replace('_', ' ') || 'Eye Examination'}</td>
                    <td>Dr. Professional</td>
                    <td><span class="status-badge status-${rx.status || 'active'}">${rx.status || 'Active'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Detailed Prescription Information -->
            ${prescriptions.map(rx => `
              <div class="prescription-section no-break">
                <div class="section-title">Prescription Details - ${format(new Date(rx.prescriptionDate || rx.createdAt), 'MMM dd, yyyy')}</div>
                
                ${(rx.sphereRight || rx.sphereLeft || rx.rightSph || rx.leftSph) ? `
                  <div class="vision-prescription">
                    <div class="eye-details">
                      <div class="eye-title">Right Eye (OD)</div>
                      <div class="info-row">
                        <span class="info-label">SPH:</span>
                        <span class="info-value">${rx.sphereRight || rx.rightSph || 'N/A'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">CYL:</span>
                        <span class="info-value">${rx.cylinderRight || rx.rightCyl || 'N/A'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">AXIS:</span>
                        <span class="info-value">${rx.axisRight || rx.rightAxis || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div class="eye-details">
                      <div class="eye-title">Left Eye (OS)</div>
                      <div class="info-row">
                        <span class="info-label">SPH:</span>
                        <span class="info-value">${rx.sphereLeft || rx.leftSph || 'N/A'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">CYL:</span>
                        <span class="info-value">${rx.cylinderLeft || rx.leftCyl || 'N/A'}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">AXIS:</span>
                        <span class="info-value">${rx.axisLeft || rx.leftAxis || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ` : ''}
                
                ${rx.diagnosis ? `
                  <div class="info-row">
                    <span class="info-label">Diagnosis:</span>
                    <span class="info-value">${rx.diagnosis}</span>
                  </div>
                ` : ''}
                
                ${rx.treatment ? `
                  <div class="info-row">
                    <span class="info-label">Treatment:</span>
                    <span class="info-value">${rx.treatment}</span>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Page 5: Billing & Financial Summary -->
        ${invoices.length > 0 ? `
          <div class="page-break">
            <div class="profile-header">
              <div class="clinic-name">Billing & Financial Summary</div>
              <div>Patient: ${patient.firstName} ${patient.lastName} (${patient.patientCode})</div>
            </div>

            <table class="invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.map(inv => `
                  <tr>
                    <td>${inv.invoiceNumber}</td>
                    <td>${format(new Date(inv.date), 'MMM dd, yyyy')}</td>
                    <td>$${parseFloat(inv.total || '0').toFixed(2)}</td>
                    <td><span class="status-badge status-${inv.status || 'pending'}">${inv.status || 'Pending'}</span></td>
                    <td>${inv.paymentMethod || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="financial-section no-break">
              <div class="section-title">Financial Summary</div>
              <div class="patient-info-grid">
                <div>
                  <div class="info-row">
                    <span class="info-label">Total Invoices:</span>
                    <span class="info-value">${totalInvoices}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Total Amount:</span>
                    <span class="info-value">$${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <div class="info-row">
                    <span class="info-label">Paid Amount:</span>
                    <span class="info-value">$${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0).toFixed(2)}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Outstanding:</span>
                    <span class="info-value">$${invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Footer with QR Code -->
        <div class="page-break">
          <div class="profile-header">
            <div class="clinic-name">Patient Access & Contact Information</div>
            <div>Quick Access QR Code & Contact Details</div>
          </div>

          <div class="qr-section no-break">
            <div class="section-title">Patient Portal QR Code</div>
            <p style="margin: 10px 0;">Scan this QR code to access your patient portal and medical records:</p>
            <div style="margin: 20px 0; font-family: monospace; font-size: 24pt; letter-spacing: 2px;">
              🔳 QR CODE PLACEHOLDER 🔳
            </div>
            <p style="font-size: 10pt; color: #666;">Patient ID: ${patient.patientCode}</p>
          </div>

          <div class="info-section no-break">
            <div class="section-title">Contact OptiStore Pro Medical Center</div>
            <div class="patient-info-grid">
              <div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">+1 (555) 123-4567</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">info@optistorepro.com</span>
                </div>
              </div>
              <div>
                <div class="info-row">
                  <span class="info-label">Address:</span>
                  <span class="info-value">123 Medical Plaza, Suite 100<br>Healthcare City, HC 12345</span>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 6px;">
            <p style="margin: 0; font-size: 10pt; color: #666;">
              This comprehensive medical profile was generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'h:mm a')}<br>
              Contains ${totalAppointments} appointments, ${totalPrescriptions} prescriptions, and ${totalInvoices} billing records<br>
              For the most up-to-date information, please visit our patient portal or contact our office.
            </p>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Auto-print after a short delay to ensure content is loaded
  setTimeout(() => {
    printWindow.print();
  }, 1000);

  return printWindow;
};
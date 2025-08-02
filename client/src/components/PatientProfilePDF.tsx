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

  // Calculate accurate statistics from real data
  const totalAppointments = appointments.length;
  const totalPrescriptions = prescriptions.length;
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || inv.totalAmount || '0'), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.paymentStatus === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.paymentStatus === 'pending');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || inv.totalAmount || '0'), 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || inv.totalAmount || '0'), 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Complete Patient Medical Profile - ${patient.firstName} ${patient.lastName}</title>
        <style>
          @page { 
            size: A4; 
            margin: 20mm 15mm; 
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
            padding: 10mm; 
            font-size: 11pt; 
            color: #333; 
            line-height: 1.5;
            background: white;
          }
          
          .page-break { 
            page-break-before: always; 
            margin-top: 0;
            padding-top: 20px;
          }
          
          .no-break { 
            page-break-inside: avoid; 
          }
          
          .section-spacing {
            margin-bottom: 25px;
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
        <div class="summary-cards section-spacing">
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
        <div class="patient-info-grid section-spacing">
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
              <div class="info-row" style="margin-top: 15px; text-align: center;">
                <span class="info-label">Pupillary Distance (PD):</span>
                <span class="info-value" style="font-weight: bold; color: #667eea;">${patient.pupillaryDistance} mm</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Medical History -->
        <div class="medical-section no-break">
          <div class="section-title">Medical History & Conditions</div>
          <div class="patient-info-grid">
            <div>
              <div class="info-row">
                <span class="info-label">Allergies:</span>
                <span class="info-value">${patient.allergies || 'None reported'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Current Medications:</span>
                <span class="info-value">${patient.currentMedications || 'None reported'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Previous Eye Conditions:</span>
                <span class="info-value">${patient.previousEyeConditions || 'None reported'}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">Family Medical History:</span>
                <span class="info-value">${patient.familyMedicalHistory || 'None reported'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Risk Factors:</span>
                <span class="info-value">${patient.riskFactors || 'None identified'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Last Eye Exam:</span>
                <span class="info-value">${patient.lastEyeExamDate ? format(new Date(patient.lastEyeExamDate), 'MMM dd, yyyy') : 'Not recorded'}</span>
              </div>
            </div>
          </div>
          
          ${patient.medicalHistory ? `
            <div class="medical-notes">
              <div class="section-title">General Medical History</div>
              <p style="line-height: 1.6; margin: 0;">${patient.medicalHistory}</p>
            </div>
          ` : ''}
        </div>

        <!-- Lifestyle Factors -->
        <div class="lifestyle-section no-break">
          <div class="section-title">Lifestyle & Health Factors</div>
          <div class="patient-info-grid">
            <div>
              <div class="info-row">
                <span class="info-label">Smoking Status:</span>
                <span class="info-value">${patient.smokingStatus || 'Not specified'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Alcohol Consumption:</span>
                <span class="info-value">${patient.alcoholConsumption || 'Not specified'}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">Exercise Frequency:</span>
                <span class="info-value">${patient.exerciseFrequency || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Doctor Notes and Treatment Plan -->
        ${(patient.doctorNotes || patient.treatmentPlan) ? `
          <div class="medical-notes no-break">
            <div class="section-title">Clinical Notes & Treatment Plan</div>
            ${patient.doctorNotes ? `
              <div style="margin-bottom: 15px;">
                <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px;">Doctor's Notes:</div>
                <p style="line-height: 1.6; margin: 0;">${patient.doctorNotes}</p>
              </div>
            ` : ''}
            ${patient.treatmentPlan ? `
              <div>
                <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px;">Treatment Plan:</div>
                <p style="line-height: 1.6; margin: 0;">${patient.treatmentPlan}</p>
              </div>
            ` : ''}
            ${patient.followUpDate ? `
              <div style="margin-top: 15px; padding: 10px; background: #e6fffa; border-radius: 6px; border-left: 4px solid #319795;">
                <div style="font-weight: 600; color: #234e52;">Next Follow-up:</div>
                <div style="color: #2c7a7b; font-weight: 500;">${format(new Date(patient.followUpDate), 'EEEE, MMMM dd, yyyy')}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Medical Alerts -->
        ${patient.medicalAlerts ? `
          <div class="emergency-info no-break">
            <div class="section-title">⚠️ Medical Alerts</div>
            <p style="font-weight: 600; color: #742a2a; margin: 0; line-height: 1.6;">${patient.medicalAlerts}</p>
          </div>
        ` : ''}

        <!-- Page 2: Appointments History -->
        <div class="page-break">
          <div class="profile-header">
            <div class="clinic-name">OptiStore Pro Medical Center</div>
            <div class="patient-name">Appointment History - ${patient.firstName} ${patient.lastName}</div>
            <div style="font-size: 10pt;">Complete appointment records and clinical visits</div>
          </div>

          <div class="appointments-section">
            <div class="section-title">Appointment History (${totalAppointments} visits)</div>
            ${appointments.length > 0 ? `
              <table class="appointments-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Service Type</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Fee</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  ${appointments.map(apt => {
                    const appointmentDate = apt.appointmentDate || apt.date || new Date();
                    const appointmentTime = apt.appointmentTime || 'Time not set';
                    const serviceType = apt.serviceType || 'General Consultation';
                    const doctorName = apt.assignedDoctorId ? `Dr. ${apt.assignedDoctorId.substring(0, 12)}...` : 'Not assigned';
                    const appointmentStatus = apt.status || 'scheduled';
                    const paymentStatus = apt.paymentStatus || 'pending';
                    const appointmentFee = parseFloat(apt.appointmentFee || '0');
                    
                    return `
                    <tr>
                      <td>
                        <div style="font-weight: 600;">${format(new Date(appointmentDate), 'MMM dd, yyyy')}</div>
                        <div style="font-size: 9pt; color: #666;">${appointmentTime}</div>
                      </td>
                      <td>
                        <div style="font-weight: 500;">${serviceType}</div>
                        ${apt.notes ? `<div style="font-size: 9pt; color: #666; margin-top: 3px;">${apt.notes.substring(0, 50)}${apt.notes.length > 50 ? '...' : ''}</div>` : ''}
                      </td>
                      <td>${doctorName}</td>
                      <td><span class="status-badge status-${appointmentStatus}">${appointmentStatus.charAt(0).toUpperCase() + appointmentStatus.slice(1)}</span></td>
                      <td style="font-weight: 600;">$${appointmentFee.toFixed(2)}</td>
                      <td><span class="status-badge status-${paymentStatus}">${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</span></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            ` : `
              <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 14pt; margin-bottom: 10px;">No appointments found</div>
                <div style="font-size: 10pt;">This patient has no recorded appointments yet.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Page 3: Prescriptions History -->
        <div class="page-break">
          <div class="profile-header">
            <div class="clinic-name">OptiStore Pro Medical Center</div>
            <div class="patient-name">Prescription History - ${patient.firstName} ${patient.lastName}</div>
            <div style="font-size: 10pt;">Complete prescription records and medications</div>
          </div>

          <div class="prescriptions-section">
            <div class="section-title">Prescription History (${totalPrescriptions} prescriptions)</div>
            ${prescriptions.length > 0 ? `
              <table class="prescriptions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Prescription Code</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${prescriptions.map(rx => `
                    <tr>
                      <td>${format(new Date(rx.createdAt || new Date()), 'MMM dd, yyyy')}</td>
                      <td style="font-weight: 600; color: #667eea;">${rx.prescriptionCode || 'N/A'}</td>
                      <td>${rx.doctorId ? `Dr. ${rx.doctorId.substring(0, 12)}...` : 'Not specified'}</td>
                      <td>
                        <div style="font-weight: 500;">${rx.diagnosis || 'General prescription'}</div>
                        ${rx.symptoms ? `<div style="font-size: 9pt; color: #666; margin-top: 3px;">Symptoms: ${rx.symptoms.substring(0, 40)}${rx.symptoms.length > 40 ? '...' : ''}</div>` : ''}
                      </td>
                      <td><span class="status-badge status-${rx.status || 'active'}">${rx.status || 'Active'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 14pt; margin-bottom: 10px;">No prescriptions found</div>
                <div style="font-size: 10pt;">This patient has no recorded prescriptions yet.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Page 4: Billing & Financial History -->
        <div class="page-break">
          <div class="profile-header">
            <div class="clinic-name">OptiStore Pro Medical Center</div>
            <div class="patient-name">Billing History - ${patient.firstName} ${patient.lastName}</div>
            <div style="font-size: 10pt;">Complete financial records and invoice history</div>
          </div>

          <div class="financial-section section-spacing">
            <div class="section-title">Financial Summary</div>
            <div class="summary-cards">
              <div class="summary-card">
                <div class="card-value">$${totalAmount.toFixed(2)}</div>
                <div class="card-label">Total Billed</div>
              </div>
              <div class="summary-card">
                <div class="card-value">${paidInvoices.length}</div>
                <div class="card-label">Paid Invoices</div>
              </div>
              <div class="summary-card">
                <div class="card-value">${pendingInvoices.length}</div>
                <div class="card-label">Pending Invoices</div>
              </div>
              <div class="summary-card">
                <div class="card-value">$${pendingAmount.toFixed(2)}</div>
                <div class="card-label">Outstanding</div>
              </div>
            </div>
          </div>

          <div class="invoices-section">
            <div class="section-title">Invoice History (${totalInvoices} invoices)</div>
            ${invoices.length > 0 ? `
              <table class="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoices.map(inv => {
                    const invoiceStatus = inv.status || inv.paymentStatus || 'pending';
                    const invoiceAmount = parseFloat(inv.total || inv.totalAmount || '0');
                    const invoiceDate = inv.date || inv.invoiceDate || inv.createdAt;
                    const paymentMethod = inv.paymentMethod || 'Not specified';
                    const displayStatus = invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1);
                    
                    return `
                    <tr>
                      <td style="font-weight: 600; color: #667eea;">${inv.invoiceNumber || inv.id}</td>
                      <td>${invoiceDate ? format(new Date(invoiceDate), 'MMM dd, yyyy') : 'N/A'}</td>
                      <td>
                        <div style="font-weight: 500;">${inv.notes || inv.description || 'Medical services'}</div>
                        ${inv.dueDate ? `<div style="font-size: 9pt; color: #666;">Due: ${format(new Date(inv.dueDate), 'MMM dd, yyyy')}</div>` : ''}
                      </td>
                      <td style="font-weight: 600;">$${invoiceAmount.toFixed(2)}</td>
                      <td><span class="status-badge status-${invoiceStatus}">${displayStatus}</span></td>
                      <td style="text-transform: capitalize;">${paymentMethod}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            ` : `
              <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 14pt; margin-bottom: 10px;">No invoices found</div>
                <div style="font-size: 10pt;">This patient has no recorded billing history yet.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Footer for all pages -->
        <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; border-top: 3px solid #667eea;">
          <div style="color: #2d3748; font-weight: 600; margin-bottom: 10px; font-size: 12pt;">OptiStore Pro Medical Center</div>
          <div style="color: #4a5568; font-size: 10pt; margin-bottom: 5px;">123 Healthcare Blvd, Medical District, New York, NY 10001</div>
          <div style="color: #4a5568; font-size: 10pt; margin-bottom: 5px;">Phone: (555) 123-4567 | Email: info@optistorepro.com</div>
          <div style="color: #9ca3af; font-size: 9pt; margin-top: 15px; font-style: italic;">
            This report contains confidential medical information. Generated on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'h:mm a')}
          </div>
        </div>

      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Add QR code generation if needed
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);

  return printWindow;
};
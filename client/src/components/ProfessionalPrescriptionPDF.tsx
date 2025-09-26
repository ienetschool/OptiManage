import { format } from "date-fns";

interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface PrescriptionDetails {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  doctorLicense: string;
  doctorSpecialization: string;
  prescriptionDate: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  status: string;
  sphereRight?: string;
  cylinderRight?: string;
  axisRight?: string;
  sphereLeft?: string;
  cylinderLeft?: string;
  axisLeft?: string;
  pdDistance?: string;
  items: PrescriptionItem[];
}

interface DigitalSignature {
  doctorId: string;
  signatureData: string;
  timestamp: string;
  verificationCode: string;
}

export function generateProfessionalPrescriptionPDF(
  prescription: PrescriptionDetails,
  signature?: DigitalSignature
): string {
  const qrCodeData = `https://verify.optistorepro.com/prescription/${prescription.id}?code=${signature?.verificationCode || 'VERIFY'}`;
  
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medical Prescription - ${prescription.prescriptionNumber}</title>
      <style>
        @page { 
          size: A4; 
          margin: 15mm;
          @top-center {
            content: "CONFIDENTIAL MEDICAL DOCUMENT";
            font-size: 8pt;
            color: #666;
          }
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 8pt;
            color: #666;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .prescription-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          position: relative;
        }
        
        .security-watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 72pt;
          color: rgba(0, 0, 0, 0.03);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
        
        .header {
          border: 2px solid #2563eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #f8faff 0%, #e0e7ff 100%);
          position: relative;
        }
        
        .clinic-logo {
          position: absolute;
          top: 15px;
          right: 20px;
          width: 80px;
          height: 80px;
          border: 2px solid #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          font-weight: bold;
          color: #2563eb;
          font-size: 14pt;
        }
        
        .clinic-info {
          margin-right: 100px;
        }
        
        .clinic-name {
          font-size: 28pt;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        
        .clinic-tagline {
          font-size: 12pt;
          color: #4338ca;
          font-style: italic;
          margin-bottom: 15px;
        }
        
        .clinic-details {
          font-size: 10pt;
          color: #374151;
          line-height: 1.6;
        }
        
        .prescription-header {
          background: #1e40af;
          color: white;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .prescription-number {
          font-size: 18pt;
          font-weight: bold;
        }
        
        .prescription-date {
          font-size: 12pt;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 25px;
        }
        
        .info-section {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 18px;
          background: #f9fafb;
        }
        
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #3b82f6;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 4px 0;
        }
        
        .info-label {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }
        
        .info-value {
          color: #111827;
          font-weight: 500;
          text-align: right;
          flex: 1;
        }
        
        .vision-prescription {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #10b981;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .vision-title {
          font-size: 16pt;
          font-weight: bold;
          color: #065f46;
          text-align: center;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .vision-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .eye-section {
          background: white;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 15px;
        }
        
        .eye-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
          color: #047857;
          text-transform: uppercase;
        }
        
        .vision-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .vision-table th,
        .vision-table td {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: center;
        }
        
        .vision-table th {
          background: #f3f4f6;
          font-weight: bold;
          color: #374151;
        }
        
        .pd-section {
          grid-column: 1 / -1;
          background: white;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
          text-align: center;
        }
        
        .medications-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .medications-title {
          font-size: 16pt;
          font-weight: bold;
          color: #92400e;
          text-align: center;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .medication-item {
          background: white;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .medication-name {
          font-size: 14pt;
          font-weight: bold;
          color: #92400e;
          margin-bottom: 8px;
        }
        
        .medication-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 10pt;
          color: #451a03;
        }
        
        .medication-instructions {
          grid-column: 1 / -1;
          margin-top: 10px;
          padding: 10px;
          background: #fef7ed;
          border-radius: 4px;
          font-style: italic;
        }
        
        .clinical-section {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .clinical-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        
        .clinical-item {
          margin-bottom: 15px;
        }
        
        .clinical-label {
          font-weight: bold;
          color: #475569;
          margin-bottom: 5px;
        }
        
        .clinical-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 12px;
          font-size: 10pt;
          line-height: 1.5;
        }
        
        .signature-section {
          margin-top: 40px;
          padding: 20px;
          border: 2px solid #374151;
          border-radius: 8px;
          background: #f9fafb;
        }
        
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 2px solid #374151;
          height: 60px;
          margin-bottom: 10px;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
        }
        
        .digital-signature {
          font-family: 'Brush Script MT', cursive;
          font-size: 18pt;
          color: #1e40af;
          transform: rotate(-2deg);
        }
        
        .signature-label {
          font-weight: bold;
          color: #374151;
          font-size: 10pt;
        }
        
        .verification-section {
          margin-top: 30px;
          padding: 15px;
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          border: 1px solid #8b5cf6;
          border-radius: 8px;
        }
        
        .verification-title {
          font-size: 12pt;
          font-weight: bold;
          color: #5b21b6;
          margin-bottom: 10px;
          text-align: center;
        }
        
        .verification-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }
        
        .verification-info {
          font-size: 9pt;
          color: #6b21a8;
          line-height: 1.4;
        }
        
        .qr-code {
          width: 80px;
          height: 80px;
          border: 2px solid #8b5cf6;
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          color: #5b21b6;
          text-align: center;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 9pt;
          color: #6b7280;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .footer-section {
          text-align: left;
        }
        
        .footer-section:last-child {
          text-align: right;
        }
        
        .validity-notice {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 4px;
          padding: 10px;
          margin-top: 15px;
          font-size: 9pt;
          color: #991b1b;
          text-align: center;
        }
        
        @media print {
          .prescription-container {
            box-shadow: none;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        <div class="security-watermark">IeOMS</div>
        
        <!-- Header -->
        <div class="header">
          <div class="clinic-logo">OSP</div>
          <div class="clinic-info">
            <div class="clinic-name">IeOMS</div>
            <div class="clinic-tagline">Advanced Eye Care & Vision Solutions</div>
            <div class="clinic-details">
              <strong>Medical Center License:</strong> MC-2024-001<br>
              <strong>Address:</strong> 123 Vision Boulevard, Eye Care District, EC 12345<br>
              <strong>Phone:</strong> +1 (555) 123-4567 | <strong>Email:</strong> medical@optistorepro.com
            </div>
          </div>
        </div>
        
        <!-- Prescription Header -->
        <div class="prescription-header">
          <div class="prescription-number">Prescription #${prescription.prescriptionNumber}</div>
          <div class="prescription-date">${format(new Date(prescription.prescriptionDate), 'MMMM dd, yyyy')}</div>
        </div>
        
        <!-- Patient & Doctor Information -->
        <div class="info-grid">
          <div class="info-section">
            <div class="section-title">Patient Information</div>
            <div class="info-row">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${prescription.patientName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Patient ID:</span>
              <span class="info-value">${prescription.patientCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date of Issue:</span>
              <span class="info-value">${format(new Date(prescription.prescriptionDate), 'dd/MM/yyyy')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value" style="color: ${prescription.status === 'active' ? '#059669' : '#dc2626'}; font-weight: bold;">
                ${prescription.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="section-title">Prescribing Physician</div>
            <div class="info-row">
              <span class="info-label">Doctor:</span>
              <span class="info-value">${prescription.doctorName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">License No:</span>
              <span class="info-value">${prescription.doctorLicense || 'MD-2024-001'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Specialization:</span>
              <span class="info-value">${prescription.doctorSpecialization || 'Ophthalmology'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Registration:</span>
              <span class="info-value">GMC-${prescription.doctorLicense?.slice(-6) || '123456'}</span>
            </div>
          </div>
        </div>
        
        ${prescription.sphereRight || prescription.sphereLeft ? `
        <!-- Vision Prescription -->
        <div class="vision-prescription">
          <div class="vision-title">Optical Prescription</div>
          <div class="vision-grid">
            <div class="eye-section">
              <div class="eye-title">Right Eye (OD)</div>
              <table class="vision-table">
                <tr>
                  <th>Sphere</th>
                  <th>Cylinder</th>
                  <th>Axis</th>
                </tr>
                <tr>
                  <td>${prescription.sphereRight || 'Plano'}</td>
                  <td>${prescription.cylinderRight || 'Plano'}</td>
                  <td>${prescription.axisRight || '---'}°</td>
                </tr>
              </table>
            </div>
            
            <div class="eye-section">
              <div class="eye-title">Left Eye (OS)</div>
              <table class="vision-table">
                <tr>
                  <th>Sphere</th>
                  <th>Cylinder</th>
                  <th>Axis</th>
                </tr>
                <tr>
                  <td>${prescription.sphereLeft || 'Plano'}</td>
                  <td>${prescription.cylinderLeft || 'Plano'}</td>
                  <td>${prescription.axisLeft || '---'}°</td>
                </tr>
              </table>
            </div>
            
            ${prescription.pdDistance ? `
            <div class="pd-section">
              <strong>Pupillary Distance (PD):</strong> ${prescription.pdDistance} mm
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        ${prescription.items && prescription.items.length > 0 ? `
        <!-- Medications -->
        <div class="medications-section">
          <div class="medications-title">Prescribed Medications</div>
          ${prescription.items.map((item, index) => `
          <div class="medication-item">
            <div class="medication-name">${index + 1}. ${item.medicationName}</div>
            <div class="medication-details">
              <div><strong>Dosage:</strong> ${item.dosage}</div>
              <div><strong>Frequency:</strong> ${item.frequency}</div>
              <div><strong>Duration:</strong> ${item.duration}</div>
              <div><strong>Quantity:</strong> ${item.quantity} units</div>
            </div>
            ${item.instructions ? `
            <div class="medication-instructions">
              <strong>Special Instructions:</strong> ${item.instructions}
            </div>
            ` : ''}
          </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Clinical Information -->
        <div class="clinical-section">
          <div class="clinical-title">Clinical Assessment</div>
          
          <div class="clinical-item">
            <div class="clinical-label">Diagnosis:</div>
            <div class="clinical-content">
              ${prescription.diagnosis || 'No specific diagnosis recorded'}
            </div>
          </div>
          
          <div class="clinical-item">
            <div class="clinical-label">Treatment Plan:</div>
            <div class="clinical-content">
              ${prescription.treatment || 'Standard care protocol as per prescription'}
            </div>
          </div>
          
          ${prescription.notes ? `
          <div class="clinical-item">
            <div class="clinical-label">Additional Notes:</div>
            <div class="clinical-content">
              ${prescription.notes}
            </div>
          </div>
          ` : ''}
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-grid">
            <div class="signature-box">
              <div class="signature-line">
                ${signature ? `
                <div class="digital-signature">${prescription.doctorName}</div>
                ` : ''}
              </div>
              <div class="signature-label">Doctor's Signature</div>
              ${signature ? `
              <div style="font-size: 8pt; color: #6b7280; margin-top: 5px;">
                Digitally signed on ${format(new Date(signature.timestamp), 'dd/MM/yyyy HH:mm')}
              </div>
              ` : ''}
            </div>
            
            <div class="signature-box">
              <div class="signature-line">
                <div style="font-size: 12pt; color: #374151;">
                  ${format(new Date(prescription.prescriptionDate), 'dd/MM/yyyy')}
                </div>
              </div>
              <div class="signature-label">Date of Issue</div>
            </div>
          </div>
        </div>
        
        <!-- Verification Section -->
        ${signature ? `
        <div class="verification-section">
          <div class="verification-title">Digital Verification</div>
          <div class="verification-grid">
            <div class="verification-info">
              <strong>Verification Code:</strong> ${signature.verificationCode}<br>
              <strong>Digital Signature ID:</strong> ${signature.doctorId}<br>
              <strong>Timestamp:</strong> ${format(new Date(signature.timestamp), 'dd/MM/yyyy HH:mm:ss')}<br>
              <strong>Verify online at:</strong> verify.optistorepro.com
            </div>
            <div class="qr-code">
              QR Code<br>
              Verification
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <strong>IeOMS Medical Center</strong><br>
              Reg. No: MC-2024-OSP-001<br>
              Accredited by Medical Council
            </div>
            <div class="footer-section">
              Emergency Contact: +1 (555) 911-EYES<br>
              24/7 Support: info.indiaespectacular@gmail.com<br>
              Website: www.optistorepro.com
            </div>
          </div>
          
          <div class="validity-notice">
            <strong>IMPORTANT:</strong> This prescription is valid for 12 months from the date of issue. 
            For any queries or verification, please contact our medical center. 
            This document contains confidential medical information.
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

export function generateDigitalSignature(
  doctorId: string,
  prescriptionId: string
): DigitalSignature {
  const timestamp = new Date().toISOString();
  const verificationCode = `VRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  // In a real implementation, this would use proper cryptographic signing
  const signatureData = btoa(`${doctorId}:${prescriptionId}:${timestamp}`);
  
  return {
    doctorId,
    signatureData,
    timestamp,
    verificationCode
  };
}
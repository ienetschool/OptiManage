import React from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeReact from "react-qr-code";

interface AppointmentInvoiceTemplateProps {
  appointment: {
    id: string;
    appointmentNumber?: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    patientAddress?: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceType: string;
    doctorName?: string;
    appointmentFee: number;
    paymentStatus: string;
    paymentMethod?: string;
    notes?: string;
    couponDiscount?: number;
    appliedCouponCode?: string;
  };
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  onClose?: () => void;
}

export default function AppointmentInvoiceTemplate({ 
  appointment, 
  storeName = "OptiStore Pro",
  storeAddress = "123 Vision Street, Eyecare City, EC 12345",
  storePhone = "(555) 123-4567",
  storeEmail = "appointments@optistorepro.com",
  onClose
}: AppointmentInvoiceTemplateProps) {
  
  const printInvoice = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element = document.getElementById('appointment-invoice-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`appointment-invoice-${appointment.appointmentNumber || appointment.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const couponDiscount = appointment.couponDiscount || 0;
  const taxRate = 0.08; // 8% tax
  const subtotal = appointment.appointmentFee;
  const discountedAmount = subtotal - couponDiscount;
  const taxAmount = discountedAmount * taxRate;
  const totalAmount = discountedAmount + taxAmount;
  
  const paymentStatusColor = appointment.paymentStatus === 'paid' ? '#10b981' : 
                           appointment.paymentStatus === 'pending' ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Appointment Invoice</h2>
          <div className="flex gap-2">
            <Button onClick={downloadPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={printInvoice} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div 
            id="appointment-invoice-content"
            className="bg-white p-8 text-black"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: '11pt',
              lineHeight: '1.4',
              minHeight: '297mm',
              width: '210mm',
              margin: '0 auto'
            }}
          >
            {/* Medical Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              margin: '-32px -32px 30px -32px',
              padding: '40px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ 
                    fontSize: '32pt', 
                    fontWeight: 'bold', 
                    margin: '0 0 8px 0',
                    letterSpacing: '1px'
                  }}>
                    🏥 {storeName}
                  </h1>
                  <p style={{ 
                    fontSize: '11pt', 
                    opacity: '0.9',
                    margin: '0 0 16px 0'
                  }}>
                    Professional Medical & Eye Care Center
                  </p>
                  <div style={{ fontSize: '10pt', opacity: '0.8', lineHeight: '1.3' }}>
                    <div>{storeAddress}</div>
                    <div>Phone: {storePhone} | Email: {storeEmail}</div>
                  </div>
                </div>
                
                {/* Appointment Invoice Number & QR */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.15)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <h2 style={{ 
                      fontSize: '20pt', 
                      fontWeight: 'bold', 
                      margin: '0 0 8px 0'
                    }}>
                      APPOINTMENT
                    </h2>
                    <h3 style={{ 
                      fontSize: '16pt', 
                      fontWeight: 'bold', 
                      margin: '0 0 8px 0'
                    }}>
                      INVOICE
                    </h3>
                    <div style={{ 
                      fontSize: '14pt', 
                      fontWeight: 'bold',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      margin: '8px 0'
                    }}>
                      {appointment.appointmentNumber || `APT-${appointment.id.slice(-8)}`}
                    </div>
                    <div style={{ 
                      background: 'white',
                      padding: '8px',
                      borderRadius: '6px',
                      marginTop: '12px'
                    }}>
                      <QRCodeReact 
                        value={`Appointment: ${appointment.appointmentNumber || appointment.id}, Patient: ${appointment.patientName}, Date: ${appointment.appointmentDate}, Service: ${appointment.serviceType}, Fee: $${totalAmount.toFixed(2)}`}
                        size={80}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient & Appointment Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              {/* Patient Information */}
              <div>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#059669', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #059669',
                  paddingBottom: '6px'
                }}>
                  PATIENT INFORMATION
                </h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{appointment.patientName}</div>
                  {appointment.patientEmail && <div>Email: {appointment.patientEmail}</div>}
                  {appointment.patientPhone && <div>Phone: {appointment.patientPhone}</div>}
                  {appointment.patientAddress && <div style={{ marginTop: '6px' }}>{appointment.patientAddress}</div>}
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#059669', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #059669',
                  paddingBottom: '6px'
                }}>
                  APPOINTMENT DETAILS
                </h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                  <div><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> {appointment.appointmentTime}</div>
                  <div><strong>Service:</strong> {appointment.serviceType}</div>
                  {appointment.doctorName && <div><strong>Doctor:</strong> {appointment.doctorName}</div>}
                  <div><strong>Duration:</strong> 60 minutes</div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#059669', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #059669',
                  paddingBottom: '6px'
                }}>
                  PAYMENT STATUS
                </h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                  <div>
                    <strong>Status:</strong> 
                    <span style={{ 
                      color: paymentStatusColor,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginLeft: '8px',
                      background: `${paymentStatusColor}20`,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {appointment.paymentStatus}
                    </span>
                  </div>
                  {appointment.paymentMethod && <div><strong>Method:</strong> {appointment.paymentMethod}</div>}
                  <div><strong>Invoice Date:</strong> {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            {(couponDiscount > 0 || appointment.appliedCouponCode) && (
              <div style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '20px',
                borderRadius: '12px',
                margin: '20px 0',
                color: 'white'
              }}>
                <h3 style={{ 
                  fontSize: '14pt', 
                  fontWeight: 'bold', 
                  margin: '0 0 12px 0'
                }}>
                  🎟️ INSURANCE COUPON APPLIED
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '11pt' }}>
                  <div>
                    {appointment.appliedCouponCode && <div><strong>Coupon Code:</strong> {appointment.appliedCouponCode}</div>}
                    <div><strong>Service Type:</strong> {appointment.serviceType}</div>
                  </div>
                  <div>
                    <div><strong>Discount Amount:</strong> ${couponDiscount.toFixed(2)}</div>
                    <div style={{ fontWeight: 'bold', marginTop: '8px' }}>✅ Successfully Applied & Saved</div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Details Table */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                fontSize: '12pt', 
                fontWeight: 'bold', 
                color: '#059669', 
                marginBottom: '16px',
                borderBottom: '2px solid #059669',
                paddingBottom: '6px'
              }}>
                SERVICE BREAKDOWN
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0fdf4' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#059669' }}>Service Description</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#059669' }}>Date & Time</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '2px solid #10b981', fontWeight: 'bold', color: '#059669' }}>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>{appointment.serviceType}</div>
                      <div style={{ fontSize: '10pt', color: '#6b7280', marginTop: '4px' }}>
                        Professional medical consultation and examination
                      </div>
                      {appointment.doctorName && (
                        <div style={{ fontSize: '10pt', color: '#059669', marginTop: '4px' }}>
                          👨‍⚕️ Dr. {appointment.doctorName}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold' }}>{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                      <div style={{ color: '#6b7280' }}>{appointment.appointmentTime}</div>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '12pt' }}>${appointment.appointmentFee.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ width: '350px' }}>
                <div style={{ 
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #e2e8f0'
                }}>
                  <h3 style={{ 
                    fontSize: '14pt', 
                    fontWeight: 'bold', 
                    color: '#059669', 
                    margin: '0 0 16px 0',
                    textAlign: 'center'
                  }}>
                    FINANCIAL SUMMARY
                  </h3>
                  <table style={{ width: '100%', fontSize: '11pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Service Fee:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>${subtotal.toFixed(2)}</td>
                      </tr>
                      {couponDiscount > 0 && (
                        <tr>
                          <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#059669' }}>Coupon Discount:</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#059669' }}>-${couponDiscount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Discounted Amount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>${discountedAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '2px solid #059669' }}>Tax (8%):</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '2px solid #059669', fontWeight: 'bold' }}>${taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '16px 16px 16px 0', textAlign: 'right', fontSize: '14pt', fontWeight: 'bold', color: '#059669' }}>TOTAL AMOUNT:</td>
                        <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '16pt', fontWeight: 'bold', color: '#059669' }}>${totalAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {couponDiscount > 0 && (
                    <div style={{ 
                      marginTop: '16px',
                      padding: '12px',
                      background: '#dcfce7',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '10pt',
                      color: '#047857'
                    }}>
                      💰 <strong>You saved ${couponDiscount.toFixed(2)} with your insurance coupon!</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {appointment.notes && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#059669', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #059669',
                  paddingBottom: '6px'
                }}>
                  APPOINTMENT NOTES
                </h3>
                <div style={{ 
                  fontSize: '10pt', 
                  padding: '12px', 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: '6px',
                  borderLeft: '4px solid #059669'
                }}>
                  {appointment.notes}
                </div>
              </div>
            )}

            {/* Medical Footer */}
            <div style={{ 
              borderTop: '2px solid #e2e8f0', 
              paddingTop: '20px', 
              textAlign: 'center',
              fontSize: '9pt',
              color: '#6b7280'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#059669' }}>Thank you for choosing {storeName} for your healthcare needs!</strong>
              </div>
              <div style={{ marginBottom: '8px' }}>
                For appointment inquiries or medical emergencies, please contact us at {storePhone}
              </div>
              <div style={{ marginBottom: '8px' }}>
                Email: {storeEmail} | Website: www.optistorepro.com
              </div>
              <div style={{ fontSize: '8pt', fontStyle: 'italic' }}>
                This invoice is generated electronically and serves as your official payment receipt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
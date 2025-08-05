import React from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCodeReact from "react-qr-code";

interface InvoiceItem {
  id: string;
  productName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface ProfessionalInvoiceTemplateProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    date?: string;
    issueDate?: string;
    dueDate?: string;
    storeId: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    discount?: number;
    taxAmount?: number;
    tax?: number;
    total: number;
    status: string;
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

export default function ProfessionalInvoiceTemplate({ 
  invoice, 
  storeName = "OptiStore Pro",
  storeAddress = "123 Vision Street, Eyecare City, EC 12345",
  storePhone = "(555) 123-4567",
  storeEmail = "billing@optistorepro.com",
  onClose
}: ProfessionalInvoiceTemplateProps) {
  
  const printInvoice = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element = document.getElementById('professional-invoice-content');
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
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const taxAmount = invoice.taxAmount || invoice.tax || 0;
  const discountAmount = invoice.discount || 0;
  const couponDiscount = invoice.couponDiscount || 0;
  const paymentStatusColor = invoice.status === 'paid' ? '#10b981' : invoice.status === 'overdue' ? '#ef4444' : '#f59e0b';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Professional Invoice</h2>
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
            id="professional-invoice-content"
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
            {/* Professional Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                    {storeName}
                  </h1>
                  <p style={{ 
                    fontSize: '11pt', 
                    opacity: '0.9',
                    margin: '0 0 16px 0'
                  }}>
                    Professional Medical & Optical Center
                  </p>
                  <div style={{ fontSize: '10pt', opacity: '0.8', lineHeight: '1.3' }}>
                    <div>{storeAddress}</div>
                    <div>Phone: {storePhone} | Email: {storeEmail}</div>
                  </div>
                </div>
                
                {/* Invoice Number & QR */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.15)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <h2 style={{ 
                      fontSize: '24pt', 
                      fontWeight: 'bold', 
                      margin: '0 0 8px 0'
                    }}>
                      INVOICE
                    </h2>
                    <div style={{ 
                      fontSize: '18pt', 
                      fontWeight: 'bold',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      margin: '8px 0'
                    }}>
                      {invoice.invoiceNumber}
                    </div>
                    <div style={{ 
                      background: 'white',
                      padding: '8px',
                      borderRadius: '6px',
                      marginTop: '12px'
                    }}>
                      <QRCodeReact 
                        value={`Invoice: ${invoice.invoiceNumber}, Total: $${invoice.total.toFixed(2)}, Customer: ${invoice.customerName}`}
                        size={80}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              {/* Bill To */}
              <div>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#2563eb', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #2563eb',
                  paddingBottom: '6px'
                }}>
                  BILL TO
                </h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{invoice.customerName || 'Walk-in Customer'}</div>
                  {invoice.customerEmail && <div>Email: {invoice.customerEmail}</div>}
                  {invoice.customerPhone && <div>Phone: {invoice.customerPhone}</div>}
                  {invoice.customerAddress && <div style={{ marginTop: '6px' }}>{invoice.customerAddress}</div>}
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#2563eb', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #2563eb',
                  paddingBottom: '6px'
                }}>
                  INVOICE DETAILS
                </h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                  <div><strong>Issue Date:</strong> {new Date(invoice.issueDate || invoice.date || new Date()).toLocaleDateString()}</div>
                  {invoice.dueDate && <div><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</div>}
                  <div><strong>Payment Method:</strong> {invoice.paymentMethod || 'Not specified'}</div>
                  <div>
                    <strong>Status:</strong> 
                    <span style={{ 
                      color: paymentStatusColor,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginLeft: '8px'
                    }}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon Information */}
              {(couponDiscount > 0 || invoice.appliedCouponCode) && (
                <div>
                  <h3 style={{ 
                    fontSize: '12pt', 
                    fontWeight: 'bold', 
                    color: '#059669', 
                    marginBottom: '12px',
                    borderBottom: '2px solid #059669',
                    paddingBottom: '6px'
                  }}>
                    COUPON APPLIED
                  </h3>
                  <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
                    {invoice.appliedCouponCode && <div><strong>Coupon Code:</strong> {invoice.appliedCouponCode}</div>}
                    <div><strong>Discount Amount:</strong> ${couponDiscount.toFixed(2)}</div>
                    <div style={{ color: '#059669', fontWeight: 'bold' }}>✓ Successfully Applied</div>
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                fontSize: '12pt', 
                fontWeight: 'bold', 
                color: '#2563eb', 
                marginBottom: '16px',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '6px'
              }}>
                ITEMS & SERVICES
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 'bold' }}>Description</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontWeight: 'bold' }}>Qty</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', fontWeight: 'bold' }}>Unit Price</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', fontWeight: 'bold' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.productName || item.description}</div>
                        {item.productName && item.description && (
                          <div style={{ fontSize: '9pt', color: '#6b7280', marginTop: '2px' }}>{item.description}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ width: '300px' }}>
                <table style={{ width: '100%', fontSize: '11pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Subtotal:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    {discountAmount > 0 && (
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#dc2626' }}>Discount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#dc2626' }}>-${discountAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {couponDiscount > 0 && (
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#059669' }}>Coupon Discount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#059669' }}>-${couponDiscount.toFixed(2)}</td>
                      </tr>
                    )}
                    {taxAmount > 0 && (
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Tax ({((taxAmount / (invoice.subtotal - discountAmount - couponDiscount)) * 100).toFixed(1)}%):</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>${taxAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '12px 16px 12px 0', textAlign: 'right', fontSize: '14pt', fontWeight: 'bold', color: '#2563eb' }}>TOTAL:</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '16pt', fontWeight: 'bold', color: '#2563eb' }}>${invoice.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '12pt', 
                  fontWeight: 'bold', 
                  color: '#2563eb', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #2563eb',
                  paddingBottom: '6px'
                }}>
                  NOTES
                </h3>
                <div style={{ 
                  fontSize: '10pt', 
                  padding: '12px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '6px',
                  borderLeft: '4px solid #2563eb'
                }}>
                  {invoice.notes}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ 
              borderTop: '2px solid #e2e8f0', 
              paddingTop: '20px', 
              textAlign: 'center',
              fontSize: '9pt',
              color: '#6b7280'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Thank you for choosing {storeName}!</strong>
              </div>
              <div>
                For questions about this invoice, please contact us at {storePhone} or {storeEmail}
              </div>
              <div style={{ marginTop: '8px', fontSize: '8pt' }}>
                This is a computer-generated invoice and does not require a signature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
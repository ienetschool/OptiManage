import React from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Printer, Share } from "lucide-react";
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
    shippingCost?: number;
  };
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  onClose?: () => void;
}

export default function ProfessionalInvoiceTemplate({ 
  invoice, 
  storeName = "IeOMS",
  storeAddress = "123 Vision Street, Eyecare City, EC 12345",
  storePhone = "(555) 123-4567",
  storeEmail = "info.indiaespectacular@gmail.com",
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
        {/* Quick Action Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Invoice {invoice.invoiceNumber}</h2>
          <div className="flex gap-2">
            <Button onClick={printInvoice} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={downloadPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              onClick={() => {
                navigator.share?.({
                  title: `Invoice ${invoice.invoiceNumber}`,
                  text: `Invoice ${invoice.invoiceNumber} - $${invoice.total.toFixed(2)}`,
                  url: window.location.href
                }) || navigator.clipboard.writeText(`Invoice ${invoice.invoiceNumber} - $${invoice.total.toFixed(2)}`);
              }} 
              variant="outline" 
              size="sm"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
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
            {/* Professional Header - Matching Purchase Invoice Style */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ 
                fontSize: '36pt', 
                fontWeight: 'bold', 
                color: '#2563eb',
                margin: '0 0 8px 0',
                letterSpacing: '1px'
              }}>
                {storeName}
              </h1>
              <p style={{ 
                fontSize: '12pt', 
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                Optical Retail Management
              </p>
              <div style={{ fontSize: '10pt', color: '#6b7280', lineHeight: '1.4' }}>
                <div>{storeAddress}</div>
                <div>Phone: {storePhone} | Email: {storeEmail}</div>
              </div>
            </div>

            {/* Invoice Header Box */}
            <div style={{ 
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '18pt', 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 8px 0'
                }}>
                  PURCHASE<br/>INVOICE
                </h2>
                <div style={{ 
                  background: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12pt',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {invoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '10pt', color: '#6b7280', marginTop: '8px' }}>
                  <div>Date: {new Date(invoice.issueDate || invoice.date || new Date()).toLocaleDateString()}</div>
                  <div>Due Date: {new Date(invoice.dueDate || Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Bill To:</h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 'bold' }}>{invoice.customerName || 'Walk-in Customer'}</div>
                  {invoice.customerEmail && <div>{invoice.customerEmail}</div>}
                  {invoice.customerPhone && <div>{invoice.customerPhone}</div>}
                  {invoice.customerAddress && <div>{invoice.customerAddress}</div>}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Ship To:</h3>
                <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 'bold' }}>{storeName} - Main Location</div>
                  <div>{storeAddress}</div>
                  <div>Phone: {storePhone}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Payment Status</h3>
                <div style={{ 
                  background: paymentStatusColor === '#10b981' ? '#10b981' : '#f59e0b',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {invoice.status}
                </div>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1f2937', marginTop: '8px' }}>
                  Total: ${invoice.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Items Table with Blue Header */}
            <div style={{ marginBottom: '30px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2563eb', color: 'white' }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 'bold', fontSize: '12pt' }}>Item Description</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 'bold', fontSize: '12pt' }}>Quantity</th>
                    <th style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '12pt' }}>Unit Cost</th>
                    <th style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '12pt' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.productName || item.description}</div>
                        {item.productName && item.description && (
                          <div style={{ fontSize: '10pt', color: '#6b7280', marginTop: '4px' }}>{item.description}</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold' }}>${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ minWidth: '300px' }}>
                <table style={{ width: '100%', fontSize: '12pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 16px 8px 0', textAlign: 'right' }}>Subtotal:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    {discountAmount > 0 && (
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', color: '#dc2626' }}>Discount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>-${discountAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {couponDiscount > 0 && (
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right', color: '#059669' }}>Coupon Discount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>-${couponDiscount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '8px 16px 8px 0', textAlign: 'right' }}>Tax ({((taxAmount / invoice.subtotal) * 100).toFixed(0)}%):</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>${taxAmount.toFixed(2)}</td>
                    </tr>
                    {invoice.shippingCost && invoice.shippingCost > 0 && (
                      <tr>
                        <td style={{ padding: '8px 16px 8px 0', textAlign: 'right' }}>Shipping:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>${invoice.shippingCost.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid #1f2937' }}>
                      <td style={{ padding: '12px 16px 12px 0', textAlign: 'right', fontSize: '16pt', fontWeight: 'bold' }}>TOTAL:</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '18pt', fontWeight: 'bold' }}>${invoice.total.toFixed(2)}</td>
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
                  color: '#1f2937', 
                  marginBottom: '12px',
                  borderBottom: '2px solid #e2e8f0',
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
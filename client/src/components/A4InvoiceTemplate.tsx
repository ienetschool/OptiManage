import React from "react";
import QRCodeReact from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface A4InvoiceTemplateProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    storeId: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    status: string;
    paymentMethod?: string;
    notes?: string;
  };
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
}

export default function A4InvoiceTemplate({ 
  invoice, 
  storeName = "OptiStore Pro",
  storeAddress = "123 Healthcare Blvd, Medical District, New York, NY 10001",
  storePhone = "(555) 123-4567",
  storeEmail = "info@optistorepro.com"
}: A4InvoiceTemplateProps) {
  const taxRate = invoice.tax > 0 ? (invoice.tax / (invoice.subtotal - invoice.discount) * 100).toFixed(1) : "0";
  
  const printInvoice = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element = document.getElementById('a4-invoice-content');
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
  
  return (
    <div id="a4-invoice-content" className="a4-invoice bg-white text-black" style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      padding: '20mm',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: '#000',
      backgroundColor: '#fff'
    }}>
      {/* Modern Orange Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        margin: '-20mm -20mm 30px -20mm',
        padding: '30px 40px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Invoice Title */}
        <div style={{ flex: '1' }}>
          <h1 style={{ 
            fontSize: '48pt', 
            fontWeight: 'bold', 
            color: 'white',
            margin: '0',
            letterSpacing: '2px'
          }}>
            {storeName}
          </h1>
          <p style={{ 
            fontSize: '10pt', 
            color: '#666',
            margin: '0 0 5px 0',
            fontWeight: '600'
          }}>
            Professional Medical & Optical Center
          </p>
          <div style={{ fontSize: '9pt', color: '#666', lineHeight: '1.3' }}>
            <div>{storeAddress}</div>
            <div>{storePhone}</div>
            <div>{storeEmail}</div>
          </div>
        </div>

        {/* Invoice Title & Number */}
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ 
            fontSize: '20pt', 
            fontWeight: 'bold',
            color: '#2563eb',
            margin: '0 0 10px 0'
          }}>
            INVOICE
          </h2>
          <div style={{ 
            fontSize: '12pt', 
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
          }}>
            {invoice.invoiceNumber}
          </div>
          {/* QR Code */}
          <div style={{ 
            border: '1px solid #ddd',
            padding: '5px',
            display: 'inline-block',
            backgroundColor: '#f9f9f9'
          }}>
            <QRCodeReact 
              value={`Invoice: ${invoice.invoiceNumber}\nAmount: $${invoice.total.toFixed(2)}\nDate: ${new Date(invoice.issueDate).toLocaleDateString()}`}
              size={60}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Bill To & Invoice Details */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '30px',
        gap: '30px'
      }}>
        {/* Bill To */}
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            fontSize: '12pt', 
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '10px',
            borderBottom: '1px solid #2563eb',
            paddingBottom: '5px'
          }}>
            BILL TO
          </h3>
          <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
              Customer: {invoice.customerName || 'Guest Customer'}
            </div>
            <div style={{ marginBottom: '3px' }}>
              Customer ID: {invoice.customerId ? invoice.customerId.substring(0, 8) + '...' : 'N/A'}
            </div>
            <div style={{ marginBottom: '3px' }}>
              Phone: {invoice.customerPhone || 'N/A'}
            </div>
            <div>
              Email: {invoice.customerEmail || 'N/A'}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            fontSize: '12pt', 
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '10px',
            borderBottom: '1px solid #2563eb',
            paddingBottom: '5px'
          }}>
            INVOICE DETAILS
          </h3>
          <div style={{ fontSize: '10pt', lineHeight: '1.4' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '3px'
            }}>
              <span>Issue Date:</span>
              <span style={{ fontWeight: 'bold' }}>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '3px'
            }}>
              <span>Due Date:</span>
              <span style={{ fontWeight: 'bold' }}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '3px'
            }}>
              <span>Store:</span>
              <span style={{ fontWeight: 'bold' }}>Store1</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between'
            }}>
              <span>Status:</span>
              <span style={{ 
                fontWeight: 'bold',
                color: invoice.status === 'paid' ? '#16a34a' : '#ea580c',
                textTransform: 'uppercase',
                padding: '2px 6px',
                border: `1px solid ${invoice.status === 'paid' ? '#16a34a' : '#ea580c'}`,
                borderRadius: '3px',
                fontSize: '8pt'
              }}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '12pt', 
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#2563eb',
          padding: '8px 12px',
          margin: '0 0 0 0'
        }}>
          SERVICES & PRODUCTS
        </h3>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
              <th style={{ 
                padding: '8px 12px', 
                textAlign: 'left',
                fontSize: '9pt',
                fontWeight: 'bold',
                color: '#2563eb',
                border: '1px solid #ddd'
              }}>
                ITEM DESCRIPTION
              </th>
              <th style={{ 
                padding: '8px 12px', 
                textAlign: 'center',
                fontSize: '9pt',
                fontWeight: 'bold',
                color: '#2563eb',
                border: '1px solid #ddd',
                width: '80px'
              }}>
                QUANTITY
              </th>
              <th style={{ 
                padding: '8px 12px', 
                textAlign: 'right',
                fontSize: '9pt',
                fontWeight: 'bold',
                color: '#2563eb',
                border: '1px solid #ddd',
                width: '100px'
              }}>
                UNIT COST
              </th>
              <th style={{ 
                padding: '8px 12px', 
                textAlign: 'right',
                fontSize: '9pt',
                fontWeight: 'bold',
                color: '#2563eb',
                border: '1px solid #ddd',
                width: '100px'
              }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid #eee',
                backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
              }}>
                <td style={{ 
                  padding: '10px 12px',
                  fontSize: '10pt',
                  border: '1px solid #ddd',
                  verticalAlign: 'top'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                    {item.productName || item.description}
                  </div>
                  <div style={{ fontSize: '9pt', color: '#666' }}>
                    {item.description && item.productName ? item.description : ''}
                  </div>
                </td>
                <td style={{ 
                  padding: '10px 12px',
                  textAlign: 'center',
                  fontSize: '10pt',
                  border: '1px solid #ddd',
                  fontWeight: 'bold'
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontSize: '10pt',
                  border: '1px solid #ddd'
                }}>
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td style={{ 
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontSize: '10pt',
                  border: '1px solid #ddd',
                  fontWeight: 'bold'
                }}>
                  ${item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment & Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Payment Information */}
        <div style={{ flex: '1' }}>
          <h3 style={{ 
            fontSize: '12pt', 
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '10px',
            borderBottom: '1px solid #2563eb',
            paddingBottom: '5px'
          }}>
            PAYMENT INFORMATION
          </h3>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '10pt'
            }}>
              <span>Payment Method:</span>
              <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {invoice.paymentMethod || 'cash'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '10pt'
            }}>
              <span>Tax Rate:</span>
              <span style={{ fontWeight: 'bold' }}>{taxRate}%</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '10pt'
            }}>
              <span>Currency:</span>
              <span style={{ fontWeight: 'bold' }}>USD ($)</span>
            </div>
            
            {/* QR Code for Payment */}
            <div style={{ 
              marginTop: '15px',
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '8pt', color: '#666', marginBottom: '5px' }}>
                Scan QR code above for quick payment processing
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div style={{ flex: '1' }}>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '10pt'
            }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '10pt',
              color: '#dc2626'
            }}>
              <span>Discount:</span>
              <span style={{ fontWeight: 'bold' }}>-${invoice.discount.toFixed(2)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '15px',
              fontSize: '10pt'
            }}>
              <span>Tax ({taxRate}%):</span>
              <span style={{ fontWeight: 'bold' }}>${invoice.tax.toFixed(2)}</span>
            </div>
            
            {/* Total Amount */}
            <div style={{ 
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '12px',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10pt', marginBottom: '3px' }}>TOTAL</div>
              <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>
                ${invoice.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {invoice.notes && (
        <div style={{ 
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '30px'
        }}>
          <h4 style={{ 
            fontSize: '10pt', 
            fontWeight: 'bold',
            color: '#92400e',
            marginBottom: '8px'
          }}>
            Additional Notes:
          </h4>
          <p style={{ 
            fontSize: '9pt', 
            color: '#92400e',
            margin: '0',
            lineHeight: '1.4'
          }}>
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid #ddd',
        paddingTop: '15px',
        fontSize: '8pt',
        color: '#666',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ marginBottom: '5px' }}>
          Thank you for choosing {storeName}. We appreciate your business!
        </div>
        <div>
          For questions about this invoice, please contact us at {storePhone} or {storeEmail}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .a4-invoice {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        .a4-invoice * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}</style>
    </div>
  );
}
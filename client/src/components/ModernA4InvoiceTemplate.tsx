import React from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceItem {
  id: string;
  productName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface ModernA4InvoiceTemplateProps {
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
    items: InvoiceItem[];
    subtotal: number;
    discount?: number;
    taxAmount?: number;
    tax?: number;
    total: number;
    status: string;
    paymentMethod?: string;
    notes?: string;
  };
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  onClose?: () => void;
}

export default function ModernA4InvoiceTemplate({ 
  invoice, 
  storeName = "IeOMS",
  storeAddress = "Sandy Babb Street, Kitty, Georgetown, Guyana",
  storePhone = "+592 750-3901",
  storeEmail = "info.indiaespectacular@gmail.com",
  onClose
}: ModernA4InvoiceTemplateProps) {
  
  const printInvoice = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element = document.getElementById('modern-invoice-content');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Preview</h2>
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
        <div className="overflow-auto max-h-[calc(95vh-120px)]">
          <div 
            id="modern-invoice-content"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              margin: '0 auto',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              lineHeight: '1.4',
              color: '#000',
              backgroundColor: '#fff'
            }}
          >
            {/* Orange Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              padding: '40px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Invoice Title */}
              <div>
                <h1 style={{ 
                  fontSize: '60px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: '0',
                  letterSpacing: '2px'
                }}>
                  INVOICE
                </h1>
              </div>
              
              {/* Store Contact Info */}
              <div style={{ 
                textAlign: 'right',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>{storePhone}</div>
                <div style={{ marginBottom: '5px' }}>{storeEmail}</div>
                <div style={{ marginBottom: '5px' }}>www.ienet.com</div>
                <div style={{ fontSize: '13px', marginTop: '10px' }}>
                  Sandy Babb Street, Kitty<br/>
                  Georgetown, Guyana<br/>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '40px' }}>
              
              {/* Invoice Information Section */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '60px',
                padding: '0'
              }}>
                {/* Billed To Section */}
                <div style={{ flex: '1', marginRight: '60px' }}>
                  <h3 style={{ 
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontWeight: 'normal',
                    margin: '0 0 15px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Billed To
                  </h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: '#000' }}>
                      {invoice.customerName || 'Client Name'}
                    </div>
                    <div style={{ marginBottom: '4px', color: '#000' }}>1 Client Address</div>
                    <div style={{ marginBottom: '4px', color: '#000' }}>City, State, Country</div>
                    <div style={{ color: '#000' }}>ZIP CODE</div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div style={{ display: 'flex', gap: '60px' }}>
                  {/* Invoice Number & Date */}
                  <div>
                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontWeight: 'normal',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Invoice Number
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                        {invoice.invoiceNumber}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontWeight: 'normal',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Date Of Issue
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                        {new Date(invoice.issueDate || invoice.date || new Date()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Total */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '12px',
                      color: '#9ca3af',
                      fontWeight: 'normal',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Invoice Total
                    </div>
                    <div style={{ 
                      fontSize: '48px', 
                      fontWeight: 'bold',
                      color: '#f97316'
                    }}>
                      ${invoice.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '40px' }}>
                {/* Table Header */}
                <div style={{ 
                  display: 'flex',
                  backgroundColor: '#f97316',
                  color: 'white',
                  padding: '15px 20px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  <div style={{ flex: '3', paddingRight: '20px' }}>Item Description</div>
                  <div style={{ flex: '1', textAlign: 'center', paddingRight: '20px' }}>Quantity</div>
                  <div style={{ flex: '1', textAlign: 'right', paddingRight: '20px' }}>Unit Cost</div>
                  <div style={{ flex: '1', textAlign: 'right' }}>Total</div>
                </div>

                {/* Table Body */}
                {invoice.items.map((item, index) => (
                  <div 
                    key={item.id || index}
                    style={{ 
                      display: 'flex',
                      padding: '20px',
                      borderBottom: index < invoice.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: index % 2 === 1 ? '#f9fafb' : 'white'
                    }}
                  >
                    <div style={{ flex: '3', paddingRight: '20px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                        {item.productName || item.description || 'Item Name'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {item.description && item.productName ? item.description : ''}
                      </div>
                    </div>
                    <div style={{ flex: '1', textAlign: 'center', paddingRight: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                      {item.quantity}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right', paddingRight: '20px', fontSize: '14px' }}>
                      ${item.unitPrice.toFixed(2)}
                    </div>
                    <div style={{ flex: '1', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginTop: '60px'
              }}>
                {/* Invoice Terms */}
                <div style={{ flex: '1', marginRight: '40px' }}>
                  <h4 style={{ 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    Invoice Terms
                  </h4>
                  <p style={{ 
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    margin: '0'
                  }}>
                    {invoice.notes || 'Ex. Please pay your invoice by....'}
                  </p>
                </div>

                {/* Totals */}
                <div style={{ minWidth: '250px' }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: '#f97316', fontWeight: 'bold' }}>Subtotal</span>
                    <span style={{ fontWeight: 'bold' }}>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {taxAmount > 0 && (
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#f97316', fontWeight: 'bold' }}>Tax</span>
                      <span style={{ fontWeight: 'bold' }}>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderTop: '2px solid #f97316',
                    paddingTop: '15px'
                  }}>
                    <span style={{ color: '#f97316' }}>Total</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>

                  <div style={{ 
                    textAlign: 'right',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '20px'
                  }}>
                    <div style={{ 
                      fontSize: '12px',
                      color: '#f97316',
                      fontWeight: 'bold',
                      marginBottom: '5px'
                    }}>
                      Amount Due (USD)
                    </div>
                    <div style={{ 
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#000'
                    }}>
                      ${invoice.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
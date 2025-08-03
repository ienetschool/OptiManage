import React from 'react';
import { format } from 'date-fns';

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
  items: InvoiceItem[];
}

export const generateProfessionalA4Invoice = (invoice: Invoice) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = invoice.discountAmount || 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (invoice.taxRate || 0)) / 100;
  const totalAmount = taxableAmount + taxAmount;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber} - OptiStore Pro</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4; 
            margin: 15mm 12mm; 
            @top-center {
              content: "";
            }
            @bottom-center {
              content: "Page " counter(page) " | Generated on ${format(new Date(), 'MMMM dd, yyyy')}";
              font-size: 8pt;
              color: #666;
            }
          }
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Segoe UI', 'Arial', sans-serif; 
            font-size: 9pt; 
            line-height: 1.3; 
            color: #1a202c; 
            background: white;
            padding: 0;
          }
          
          .invoice-container { 
            width: 100%; 
            max-width: 190mm;
            margin: 0 auto; 
            background: white; 
            min-height: 260mm;
          }
          
          /* Modern Header Section */
          .invoice-header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            color: white; 
            padding: 18px 24px; 
            border-radius: 12px; 
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
          }
          
          .company-section {
            flex: 1;
          }
          
          .company-name { 
            font-size: 24pt; 
            font-weight: 800; 
            margin-bottom: 4px; 
            letter-spacing: -0.5px;
          }
          
          .company-tagline { 
            font-size: 9pt; 
            opacity: 0.9; 
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .company-address { 
            font-size: 8pt; 
            opacity: 0.85; 
            line-height: 1.4;
            font-weight: 400;
          }
          
          .invoice-meta { 
            text-align: right; 
            background: rgba(255,255,255,0.12); 
            padding: 16px 20px; 
            border-radius: 10px; 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.15);
            min-width: 140px;
          }
          
          .invoice-title { 
            font-size: 20pt; 
            font-weight: 800; 
            margin-bottom: 8px; 
            text-transform: uppercase; 
            letter-spacing: 1px;
          }
          
          .invoice-number { 
            font-size: 12pt; 
            font-weight: 600; 
            margin-bottom: 10px; 
            background: rgba(255,255,255,0.2); 
            padding: 6px 12px; 
            border-radius: 6px; 
            display: inline-block;
          }
          
          .qr-placeholder { 
            background: white; 
            color: #1e40af;
            padding: 8px; 
            border-radius: 4px; 
            text-align: center; 
            font-size: 8pt;
            font-weight: 600;
            margin-top: 8px;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(255,255,255,0.3);
          }
          
          /* Compact Invoice Details Section */
          .invoice-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px; 
            margin-bottom: 20px;
          }
          
          .detail-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 14px 16px; 
            border-left: 3px solid #4f46e5;
          }
          
          .detail-card h3 { 
            color: #4f46e5; 
            font-size: 10pt; 
            font-weight: 700; 
            margin-bottom: 8px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
          }
          
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 4px;
            padding: 2px 0;
            align-items: center;
          }
          
          .detail-label { 
            font-weight: 600; 
            color: #4a5568; 
            font-size: 8pt;
          }
          
          .detail-value { 
            color: #1a202c; 
            text-align: right;
            font-weight: 500;
            font-size: 9pt;
          }
          
          /* Status Badge */
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-draft { background: #f1f5f9; color: #475569; }
          .status-overdue { background: #fecaca; color: #991b1b; }
          
          /* Compact Items Section */
          .items-section { 
            margin: 18px 0;
            page-break-inside: avoid;
          }
          
          .section-header { 
            background: #4f46e5; 
            color: white; 
            padding: 10px 16px; 
            border-radius: 6px 6px 0 0; 
            font-size: 10pt; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white; 
            border: 1px solid #e2e8f0;
            border-top: none;
            font-size: 8pt;
          }
          
          .items-table th { 
            background: #f1f5f9; 
            padding: 8px 10px; 
            text-align: left; 
            font-weight: 600; 
            color: #374151; 
            border-bottom: 1px solid #e5e7eb;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .items-table td { 
            padding: 8px 10px; 
            border-bottom: 1px solid #f3f4f6; 
            color: #374151;
            font-size: 8pt;
          }
          
          .items-table tr:nth-child(even) { 
            background: #f9fafb; 
          }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-medium { font-weight: 600; }
          .font-bold { font-weight: 700; }
          
          /* Compact Layout: Payment Info and Totals Side by Side */
          .payment-totals-section { 
            margin-top: 20px; 
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 20px;
            align-items: start;
          }
          
          .payment-info-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 16px; 
            border-left: 3px solid #4f46e5;
          }
          
          .payment-info-card h3 { 
            color: #4f46e5; 
            font-size: 10pt; 
            font-weight: 700; 
            margin-bottom: 10px; 
            text-transform: uppercase; 
          }
          
          .totals-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 16px; 
            border-left: 3px solid #4f46e5;
          }
          
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 6px; 
            padding: 3px 0;
            font-size: 9pt;
          }
          
          .total-row.final { 
            border-top: 2px solid #4f46e5; 
            margin-top: 10px; 
            padding-top: 10px; 
            font-weight: 700; 
            font-size: 11pt; 
            color: #4f46e5;
            background: rgba(79, 70, 229, 0.05);
            border-radius: 4px;
            padding: 8px;
            margin: 8px -8px 0 -8px;
          }
          
          .total-label { 
            font-weight: 600; 
            color: #4a5568;
            font-size: 8pt;
          }
          
          .total-value { 
            font-weight: 600;
            color: #1a202c;
            font-size: 9pt;
          }
          
          .total-value { 
            font-weight: 600; 
            color: #2d3748;
          }
          
          /* Payment Information */
          .payment-info { 
            margin-top: 30px; 
            background: #fffbeb; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 15px;
            border-left: 4px solid #f59e0b;
          }
          
          .payment-info h3 { 
            color: #92400e; 
            font-size: 10pt; 
            font-weight: 700; 
            margin-bottom: 10px; 
            text-transform: uppercase;
          }
          
          .payment-info p { 
            color: #78350f; 
            font-size: 9pt; 
            line-height: 1.5;
            margin-bottom: 5px;
          }
          
          /* Notes Section */
          .notes-section { 
            margin-top: 25px; 
            background: #f0f9ff; 
            border: 1px solid #0ea5e9; 
            border-radius: 8px; 
            padding: 15px;
            border-left: 4px solid #0ea5e9;
          }
          
          .notes-section h3 { 
            color: #0c4a6e; 
            font-size: 10pt; 
            font-weight: 700; 
            margin-bottom: 8px; 
            text-transform: uppercase;
          }
          
          .notes-section p { 
            color: #075985; 
            font-size: 9pt; 
            line-height: 1.5;
          }
          
          /* Footer */
          .invoice-footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280; 
            font-size: 8pt;
          }
          
          .footer-text { 
            margin-bottom: 8px; 
            line-height: 1.4;
          }
          
          /* Print Optimizations */
          @media print {
            body { 
              font-size: 9pt; 
              line-height: 1.3;
            }
            .invoice-container { 
              margin: 0; 
              padding: 0;
            }
            .invoice-header { 
              margin-bottom: 20px;
            }
            .page-break { 
              page-break-before: always; 
            }
            .no-break { 
              page-break-inside: avoid; 
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header Section -->
          <div class="invoice-header">
            <div class="company-info">
              <div class="company-name">OptiStore Pro</div>
              <div class="company-tagline">Professional Optical Care & Services</div>
              <div class="company-address">
                123 Medical Plaza, Suite 100<br>
                Healthcare City, HC 12345<br>
                Phone: (555) 123-4567 | Email: info@optistorepro.com
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-title">Invoice</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              <div style="font-size: 8pt; margin-bottom: 8px;">
                Date: ${format(new Date(invoice.date), 'MMM dd, yyyy')}<br>
                Due: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
              </div>
              <div class="qr-placeholder">
                QR CODE<br>
                ${invoice.invoiceNumber}
              </div>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="detail-card">
              <h3>Bill To</h3>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value font-medium">${invoice.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer ID:</span>
                <span class="detail-value">${invoice.customerId.slice(0, 8)}</span>
              </div>
            </div>

            <div class="detail-card">
              <h3>Invoice Information</h3>
              <div class="detail-row">
                <span class="detail-label">Store:</span>
                <span class="detail-value">${invoice.storeName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge status-${invoice.status}">${invoice.status}</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment:</span>
                <span class="detail-value">${invoice.paymentMethod || 'Pending'}</span>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="items-section no-break">
            <div class="section-header">
              Invoice Items
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Description</th>
                  <th style="width: 10%;" class="text-center">Qty</th>
                  <th style="width: 15%;" class="text-right">Unit Price</th>
                  <th style="width: 10%;" class="text-center">Discount</th>
                  <th style="width: 15%;" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>
                      <div class="font-medium">${item.productName}</div>
                      <div style="font-size: 8pt; color: #6b7280; margin-top: 2px;">
                        Product ID: ${item.productId.slice(0, 8)}
                      </div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                    <td class="text-center">${item.discount || 0}%</td>
                    <td class="text-right font-medium">$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="totals-card">
              <h3>Invoice Summary</h3>
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">$${subtotal.toFixed(2)}</span>
              </div>
              ${discountAmount > 0 ? `
                <div class="total-row">
                  <span class="total-label">Discount:</span>
                  <span class="total-value">-$${discountAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="total-row">
                <span class="total-label">Tax (${invoice.taxRate || 0}%):</span>
                <span class="total-value">$${taxAmount.toFixed(2)}</span>
              </div>
              <div class="total-row final">
                <span class="total-label">Total Amount:</span>
                <span class="total-value">$${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="payment-info no-break">
            <h3>Payment Information</h3>
            <p><strong>Payment Methods Accepted:</strong> Cash, Credit/Debit Cards, Check, Bank Transfer</p>
            <p><strong>Bank Details:</strong> OptiStore Pro Medical Center | Account: 1234567890 | Routing: 987654321</p>
            <p><strong>Payment Terms:</strong> Net 30 days from invoice date</p>
            <p><strong>Late Fee:</strong> 1.5% monthly service charge on overdue amounts</p>
          </div>

          <!-- Notes Section -->
          ${invoice.notes ? `
            <div class="notes-section no-break">
              <h3>Additional Notes</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="invoice-footer">
            <div class="footer-text">
              <strong>Thank you for choosing OptiStore Pro!</strong><br>
              For questions about this invoice, please contact us at (555) 123-4567 or billing@optistorepro.com
            </div>
            <div class="footer-text">
              This invoice was generated electronically on ${format(new Date(), 'MMMM dd, yyyy')} at ${format(new Date(), 'h:mm a')}
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Auto-print after content loads
  setTimeout(() => {
    printWindow.print();
  }, 1000);

  return printWindow;
};
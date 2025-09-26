import { format } from "date-fns";

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
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod?: string;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export const generateA4Invoice = (invoice: Invoice) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = invoice.discountAmount || 0;
  const taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;
  const totalAmount = subtotal + taxAmount - discountAmount;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber} - IeOMS</title>
        <style>
          /* A4 Page Setup */
          @page { 
            size: A4 portrait;
            margin: 15mm 20mm;
            
            @top-left {
              content: "IeOMS";
              font-size: 9pt;
              color: #666;
              font-weight: 600;
            }
            
            @top-right {
              content: "Invoice ${invoice.invoiceNumber}";
              font-size: 9pt;
              color: #666;
              font-weight: 600;
            }
            
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages) " | Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}";
              font-size: 8pt;
              color: #888;
            }
          }

          /* Reset and Base Styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #1a1a1a;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
          }

          /* Header Section */
          .invoice-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 25px 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .company-section {
            flex: 1;
          }

          .company-name {
            font-size: 26pt;
            font-weight: 900;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            letter-spacing: -0.5px;
          }

          .company-tagline {
            font-size: 11pt;
            opacity: 0.9;
            margin-bottom: 12px;
            font-style: italic;
            font-weight: 300;
          }

          .company-details {
            font-size: 9pt;
            opacity: 0.85;
            line-height: 1.5;
          }

          .invoice-title-section {
            text-align: right;
            padding-left: 30px;
          }

          .invoice-title {
            font-size: 32pt;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            letter-spacing: -1px;
          }

          .invoice-number {
            font-size: 14pt;
            font-weight: 600;
            margin-bottom: 5px;
            opacity: 0.9;
          }

          .invoice-date {
            font-size: 10pt;
            opacity: 0.8;
          }

          /* Customer & Invoice Info Section */
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            gap: 40px;
          }

          .customer-info, .invoice-info {
            flex: 1;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }

          .section-title {
            font-size: 13pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .info-item {
            margin-bottom: 8px;
            display: flex;
            flex-direction: column;
          }

          .info-label {
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
          }

          .info-value {
            font-size: 11pt;
            color: #1a1a1a;
            font-weight: 500;
          }

          /* Status Badge */
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-overdue { background: #fee2e2; color: #dc2626; }
          .status-draft { background: #f1f5f9; color: #475569; }

          /* Items Table */
          .items-section {
            margin-bottom: 30px;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .items-table thead {
            background: #1e40af;
            color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .items-table th {
            padding: 15px 12px;
            text-align: left;
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .items-table th:first-child { border-radius: 8px 0 0 0; }
          .items-table th:last-child { border-radius: 0 8px 0 0; text-align: right; }

          .items-table tbody tr {
            border-bottom: 1px solid #e2e8f0;
          }

          .items-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          .items-table tbody tr:hover {
            background: #f1f5f9;
          }

          .items-table td {
            padding: 12px;
            font-size: 10pt;
            vertical-align: top;
          }

          .items-table td:last-child {
            text-align: right;
            font-weight: 600;
          }

          .item-description {
            color: #64748b;
            font-size: 9pt;
            margin-top: 2px;
            font-style: italic;
          }

          /* Totals Section */
          .totals-section {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }

          .totals-table {
            width: 350px;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .totals-table tr {
            border-bottom: 1px solid #e2e8f0;
          }

          .totals-table tr:last-child {
            border-bottom: none;
            background: #1e40af;
            color: white;
            font-weight: 700;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .totals-table td {
            padding: 12px 20px;
            font-size: 11pt;
          }

          .totals-table td:first-child {
            font-weight: 600;
            color: #374151;
          }

          .totals-table td:last-child {
            text-align: right;
            font-weight: 600;
          }

          .totals-table tr:last-child td {
            color: white;
            font-size: 13pt;
            font-weight: 700;
          }

          /* Footer Section */
          .footer-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
          }

          .payment-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin-bottom: 20px;
          }

          .notes-section {
            background: #fefbf3;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin-bottom: 20px;
          }

          .footer-note {
            text-align: center;
            font-size: 9pt;
            color: #64748b;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }

          /* Print Optimization */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .invoice-container {
              margin: 0;
              box-shadow: none;
            }
            
            .no-print {
              display: none !important;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
          }

          /* QR Code Section */
          .qr-section {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
          }

          .qr-title {
            font-size: 10pt;
            font-weight: 600;
            color: #475569;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header Section -->
          <div class="invoice-header">
            <div class="company-section">
              <div class="company-name">IeOMS</div>
              <div class="company-tagline">Professional Optical Care & Retail Solutions</div>
              <div class="company-details">
                Sandy Babb Street, Kitty, Georgetown, Guyana<br>
                Phone: +592 750-3901<br>
                Email: info.indiaespectacular@gmail.com<br>
                Website: https://www.ienet.com
              </div>
            </div>
            <div class="invoice-title-section">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              <div class="invoice-date">${format(new Date(invoice.date), 'MMMM dd, yyyy')}</div>
            </div>
          </div>

          <!-- Customer & Invoice Information -->
          <div class="info-section">
            <div class="customer-info">
              <div class="section-title">Bill To</div>
              <div class="info-item">
                <div class="info-label">Customer</div>
                <div class="info-value">${invoice.customerName || 'Guest Customer'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Customer ID</div>
                <div class="info-value">${invoice.customerId}</div>
              </div>
            </div>
            
            <div class="invoice-info">
              <div class="section-title">Invoice Details</div>
              <div class="info-item">
                <div class="info-label">Issue Date</div>
                <div class="info-value">${format(new Date(invoice.date), 'dd/MM/yyyy')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Due Date</div>
                <div class="info-value">${format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
                </div>
              </div>
              ${invoice.paymentMethod ? `
              <div class="info-item">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${invoice.paymentMethod.toUpperCase()}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Items Section -->
          <div class="items-section avoid-break">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40%">Item Description</th>
                  <th style="width: 12%">Qty</th>
                  <th style="width: 16%">Unit Price</th>
                  <th style="width: 16%">Discount</th>
                  <th style="width: 16%">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.productName}</strong>
                      ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>${item.discount}%</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals Section -->
          <div class="totals-section avoid-break">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td>$${subtotal.toFixed(2)}</td>
              </tr>
              ${discountAmount > 0 ? `
              <tr>
                <td>Discount</td>
                <td>-$${discountAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td>Tax (${invoice.taxRate || 0}%)</td>
                <td>$${taxAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>TOTAL AMOUNT</strong></td>
                <td><strong>$${totalAmount.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Payment Information -->
          ${invoice.status === 'paid' ? `
          <div class="payment-info avoid-break">
            <div class="section-title">Payment Information</div>
            <div class="info-item">
              <div class="info-label">Payment Status</div>
              <div class="info-value"><span class="status-badge status-paid">PAID</span></div>
            </div>
            ${invoice.paymentMethod ? `
            <div class="info-item">
              <div class="info-label">Payment Method</div>
              <div class="info-value">${invoice.paymentMethod.toUpperCase()}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <!-- QR Code Section -->
          <div class="qr-section avoid-break">
            <div class="qr-title">Quick Pay QR Code</div>
            <div style="display: flex; justify-content: center; margin: 10px 0;">
              <div style="width: 120px; height: 120px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; background: white;">
                <span style="font-size: 8pt; color: #94a3b8;">QR Code</span>
              </div>
            </div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 5px;">
              Scan to pay online or view invoice details
            </div>
          </div>

          <!-- Notes Section -->
          ${invoice.notes ? `
          <div class="notes-section avoid-break">
            <div class="section-title">Notes</div>
            <div style="font-size: 10pt; line-height: 1.5; color: #374151;">
              ${invoice.notes}
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer-note">
            <strong>Thank you for your business!</strong><br>
            For questions about this invoice, please contact us at info.indiaespectacular@gmail.com or +592 750-3901<br>
            <em>This is a computer-generated invoice and does not require a signature.</em>
          </div>
        </div>

        <script>
          // Auto-print when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
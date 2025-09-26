import React from "react";
import { useParams } from "wouter";

export default function PrintPreview() {
  const { invoiceId } = useParams<{ invoiceId: string }>();

  // Sample invoice data for preview
  const sampleInvoice = {
    invoiceNumber: "INV-789319",
    date: "2025-08-05",
    dueDate: "2025-09-04",
    customerName: "Patient XYZ",
    storeName: "IeOMS",
    items: [
      { productName: "ABC Crane", quantity: 1, unitPrice: 999, total: 999 },
      { productName: "Ray-Ban@23225", quantity: 1, unitPrice: 1877, total: 1877 }
    ],
    subtotal: 2876,
    taxAmount: 402.64,
    discountAmount: 4,
    total: 3274.64
  };

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Inter', 'Segoe UI', sans-serif; 
          font-size: 11pt; 
          color: #1a202c; 
          background: white; 
          line-height: 1.5;
        }
        
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
          color: white;
          padding: 30px;
          margin-bottom: 30px;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        
        .company h1 {
          font-size: 28pt;
          font-weight: 800;
          margin-bottom: 8px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .company-tagline {
          font-size: 12pt;
          opacity: 0.9;
          margin-bottom: 12px;
        }
        
        .company-address {
          font-size: 10pt;
          opacity: 0.8;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 24pt;
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .invoice-number {
          background: rgba(255,255,255,0.15);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14pt;
          font-weight: 700;
          display: inline-block;
        }
        
        .content {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .billing-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 40px;
        }
        
        .bill-to, .invoice-details {
          flex: 1;
        }
        
        .bill-to h3, .invoice-details h3 {
          font-size: 12pt;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .bill-to p, .invoice-details p {
          margin-bottom: 4px;
          font-size: 11pt;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .items-table th {
          background: #f8fafc;
          padding: 15px 12px;
          text-align: left;
          font-weight: 700;
          color: #374151;
          border-bottom: 2px solid #e2e8f0;
          font-size: 10pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 11pt;
        }
        
        .items-table tr:last-child td {
          border-bottom: none;
        }
        
        .items-table .text-right {
          text-align: right;
        }
        
        .totals {
          margin-left: auto;
          width: 300px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .totals-row:last-child {
          border-bottom: none;
          background: #1e3a8a;
          color: white;
          font-weight: 700;
          font-size: 12pt;
        }
        
        .totals-row.subtotal {
          background: #f8fafc;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
        }
        
        .footer p {
          color: #64748b;
          font-size: 10pt;
          margin-bottom: 8px;
        }
        
        .qr-code {
          margin: 20px 0;
          text-align: center;
        }
      `}</style>

      <div className="content">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="company">
              <h1>{sampleInvoice.storeName}</h1>
              <div className="company-tagline">Premium Vision Care Solutions</div>
              <div className="company-address">
                123 Vision Street, Eyecare City, EC 12345<br/>
                Phone: +592 750-3901 | Email: info.indiaespectacular@gmail.com
              </div>
            </div>
            <div className="invoice-info">
              <div className="invoice-title">Invoice</div>
              <div className="invoice-number">{sampleInvoice.invoiceNumber}</div>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="billing-info">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <p><strong>{sampleInvoice.customerName}</strong></p>
            <p>123 Customer Street</p>
            <p>Customer City, CC 12345</p>
          </div>
          <div className="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> {sampleInvoice.date}</p>
            <p><strong>Due Date:</strong> {sampleInvoice.dueDate}</p>
            <p><strong>Payment Terms:</strong> Net 30</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sampleInvoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                <td className="text-right">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals">
          <div className="totals-row subtotal">
            <span>Subtotal:</span>
            <span>${sampleInvoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Discount:</span>
            <span>-${sampleInvoice.discountAmount.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Tax:</span>
            <span>${sampleInvoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Total:</span>
            <span>${sampleInvoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="qr-code">
          <div style={{ 
            width: "120px", 
            height: "120px", 
            border: "2px solid #e2e8f0", 
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc"
          }}>
            QR Code
          </div>
          <p style={{ marginTop: "10px", fontSize: "9pt", color: "#64748b" }}>
            Scan for payment details
          </p>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your business!</p>
          <p>For questions about this invoice, please contact us at info.indiaespectacular@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
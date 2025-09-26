import React from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Printer, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PurchaseInvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discount?: number;
}

interface PurchaseInvoiceTemplateProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    customerName?: string;
    supplierName?: string;
    supplierAddress?: string;
    supplierPhone?: string;
    supplierEmail?: string;
    items: PurchaseInvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    shippingCost?: number;
    discountAmount?: number;
    total: number;
    status: 'pending' | 'paid' | 'overdue';
    notes?: string;
  };
  onClose?: () => void;
}

export default function PurchaseInvoiceTemplate({ 
  invoice,
  onClose
}: PurchaseInvoiceTemplateProps) {
  
  const printInvoice = () => {
    window.print();
  };

  const downloadPDF = () => {
    // PDF generation logic would go here
    console.log('Downloading PDF...');
  };

  const shareInvoice = () => {
    // Share functionality would go here
    navigator.clipboard.writeText(`Purchase Invoice: ${invoice.invoiceNumber}\nTotal: $${invoice.total.toFixed(2)}\nDate: ${invoice.date}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">PAID</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">OVERDUE</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">PENDING</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Preview Controls */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Purchase Invoice Preview</h2>
          <div className="flex gap-2">
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-auto max-h-[calc(95vh-120px)]">
          <div className="max-w-4xl mx-auto bg-white p-8">
            
            {/* Enhanced Header with Branding and Info */}
            <div className="mb-8">
              {/* Top Branding Section */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">IeOMS</h1>
                <p className="text-sm text-gray-600 mb-1">Optical Retail Management</p>
                <p className="text-sm text-gray-600 mb-1">123 Vision Street</p>
                <p className="text-sm text-gray-600 mb-1">Eyecare City, EC 12345</p>
                <p className="text-sm text-gray-600">Phone: +592 750-3901 | Email: info.indiaespectacular@gmail.com</p>
              </div>

              {/* Header Row with Invoice Title, Bill To, Ship To, and Status */}
              <div className="grid grid-cols-4 gap-6 border border-gray-300 p-6 rounded-lg bg-gray-50">
                {/* Invoice Title & Number */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">PURCHASE INVOICE</h2>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div>Date: {new Date(invoice.date).toLocaleDateString()}</div>
                    <div>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Bill To Section */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">Bill To:</h3>
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-1">{invoice.supplierName || invoice.customerName || 'Supplier'}</div>
                    <div className="text-gray-600">
                      <div>{invoice.supplierAddress || 'Supplier Address Line 1'}</div>
                      <div>City, State ZIP</div>
                      <div>Phone: {invoice.supplierPhone || '(555) 123-4567'}</div>
                      <div>Email: {invoice.supplierEmail || 'supplier@example.com'}</div>
                    </div>
                  </div>
                </div>

                {/* Ship To Section */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">Ship To:</h3>
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-1">IeOMS - Main Location</div>
                    <div className="text-gray-600">
                      <div>456 Inventory Avenue</div>
                      <div>Stock City, SC 67890</div>
                      <div>Phone: (555) 987-6543</div>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">Payment Status</h3>
                  <div className="mb-3">
                    {getStatusBadge(invoice.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Total: <span className="font-semibold">${invoice.total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left">Item Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Product ID</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">Quantity</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">Unit Cost</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3">{item.productName}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{item.productSku || item.productId}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>${invoice.taxAmount.toFixed(2)}</span>
                  </div>
                  {invoice.discountAmount && invoice.discountAmount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span>Discount:</span>
                      <span className="text-green-600">-${invoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.shippingCost && invoice.shippingCost > 0 && (
                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>${invoice.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-2">Notes:</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Action Icons */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={printInvoice} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </Button>
            <Button 
              onClick={shareInvoice} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button 
              onClick={downloadPDF} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
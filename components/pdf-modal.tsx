"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Share2, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { UpiShareModal } from "@/components/upi-share-modal"

interface PDFModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: any
}

export function PDFModal({ isOpen, onClose, invoice }: PDFModalProps) {
  const { clients } = useAppStore()
  const [shareModalOpen, setShareModalOpen] = useState(false)

  if (!invoice) return null

  const client = clients.find((c) => c.id === invoice.clientId)

  const generateInvoiceHTML = () => {
    const upiLink = `upi://pay?pa=business@paytm&pn=HustlePro&am=${invoice.total}&cu=INR&tn=Payment for Invoice ${invoice.invoiceNumber}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiLink)}`

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background: white; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
          
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
          .company-info h1 { font-size: 32px; font-weight: bold; color: #6366f1; margin: 0; }
          .company-info p { color: #666; margin: 5px 0; font-size: 14px; }
          .invoice-badge { background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 18px; }
          
          /* Invoice Details */
          .invoice-details { 
            display: flex; 
            justify-content: flex-end; 
            margin-bottom: 30px; 
            width: 100%;
          }

          .invoice-info { 
            text-align: right; 
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
            width: 280px;
            margin-left: auto;
          }
          
          /* Client Section */
          .client-section { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .bill-to h3 { color: #333; margin: 0 0 15px 0; font-size: 16px; font-weight: bold; }
          .client-details { display: flex; align-items: start; gap: 15px; }
          .client-logo { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; border: 2px solid #ddd; }
          .client-avatar { width: 50px; height: 50px; border-radius: 6px; background: linear-gradient(135deg, #6366f1, #ec4899); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; }
          .client-info { color: #666; line-height: 1.6; }
          .client-info .name { font-weight: bold; color: #333; font-size: 16px; margin-bottom: 5px; }
          
          /* Payment Section */
          .payment-section { text-align: right; }
          .payment-section h3 { color: #333; margin: 0 0 15px 0; font-size: 16px; font-weight: bold; }
          .qr-container { display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .qr-code { width: 100px; height: 100px; border: 2px solid #6366f1; border-radius: 8px; }
          .upi-text { font-size: 12px; color: #666; text-align: center; max-width: 120px; }
          
          /* Items Table */
          .items-section { margin: 30px 0; }
          .items-section h3 { color: #333; margin-bottom: 15px; font-size: 18px; font-weight: bold; }
          .items-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .items-table th { background: #6366f1; color: white; text-align: left; padding: 15px; font-weight: bold; font-size: 14px; }
          .items-table th:last-child { text-align: right; }
          .items-table td { padding: 15px; border-bottom: 1px solid #eee; color: #666; }
          .items-table td:last-child { text-align: right; font-weight: 500; }
          .items-table tr:last-child td { border-bottom: none; }
          
          /* Totals */
          .totals-section { display: flex; justify-content: flex-end; margin: 30px 0; }
          .totals-table { width: 300px; background: #f8f9fa; border-radius: 8px; padding: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; color: #666; }
          .totals-row.subtotal { border-bottom: 1px solid #ddd; }
          .totals-row.tax { border-bottom: 1px solid #ddd; }
          .totals-row.total { font-weight: bold; font-size: 18px; color: #333; border-top: 2px solid #6366f1; padding-top: 15px; margin-top: 10px; }
          
          /* Footer */
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          .footer h4 { color: #6366f1; margin-bottom: 10px; }
          .footer p { margin: 5px 0; font-size: 14px; }
          
          /* Terms */
          .terms-section { margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .terms-section h4 { color: #333; margin-bottom: 10px; font-size: 14px; }
          .terms-section p { color: #666; font-size: 12px; line-height: 1.5; margin: 5px 0; }
          
          @media print { 
            body { margin: 0; padding: 10px; } 
            .invoice-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              <h1>HustlePro</h1>
              <p>Professional Business Solutions</p>
              <p>📧 contact@hustlepro.com | 📞 +91 98765 43210</p>
            </div>
            <div class="invoice-badge">INVOICE</div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="invoice-info">
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> <span class="invoice-number">${invoice.invoiceNumber}</span></p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
              <p><strong>Status:</strong> <span style="text-transform: capitalize; color: ${invoice.status === "paid" ? "#10b981" : invoice.status === "overdue" ? "#ef4444" : "#f59e0b"};">${invoice.status}</span></p>
            </div>
          </div>

          <!-- Client & Payment Section -->
          <div class="client-section">
            <div class="bill-to">
              <h3>📋 Bill To:</h3>
              <div class="client-details">
                ${
                  client?.logo
                    ? `<img src="${client.logo}" alt="${client.name} logo" class="client-logo" />`
                    : `<div class="client-avatar">${client?.name?.charAt(0).toUpperCase()}</div>`
                }
                <div class="client-info">
                  <div class="name">${client?.name}</div>
                  <div>📧 ${client?.email || "N/A"}</div>
                  <div>📞 ${client?.phone || "N/A"}</div>
                  <div style="white-space: pre-line;">📍 ${client?.address || "N/A"}</div>
                </div>
              </div>
            </div>
            
            <div class="payment-section">
              <h3>💳 Quick Payment</h3>
              <div class="qr-container">
                <img src="${qrCodeUrl}" alt="UPI Payment QR Code" class="qr-code" />
                <div class="upi-text">Scan to pay ₹${invoice.total} instantly via UPI</div>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="items-section">
            <h3>📝 Invoice Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 60%;">Description</th>
                  <th style="width: 20%;">Qty</th>
                  <th style="width: 20%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>1</td>
                    <td>${formatCurrency(item.amount)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="totals-table">
              <div class="totals-row subtotal">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoice.subtotal)}</span>
              </div>
              <div class="totals-row tax">
                <span>GST (18%):</span>
                <span>${formatCurrency(invoice.gst)}</span>
              </div>
              <div class="totals-row total">
                <span>Total Amount:</span>
                <span>${formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="terms-section">
            <h4>📋 Terms & Conditions</h4>
            <p>• Payment is due within 30 days of invoice date</p>
            <p>• Late payments may incur additional charges</p>
            <p>• Please reference invoice number in all communications</p>
            <p>• For any queries, contact us at the above details</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <h4>Thank you for your business! 🙏</h4>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p><strong>HustlePro</strong> - Empowering Your Business Growth</p>
          </div>
        </div>
      </body>
    </html>
  `
  }

  const handleDownload = () => {
    const invoiceHTML = generateInvoiceHTML()
    const blob = new Blob([invoiceHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-card border-2 border-primary/20 max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="gradient-text text-xl">Invoice Preview</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleDownload} className="bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare} className="bg-transparent">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[80vh]">
            <div
              className="bg-white rounded-lg shadow-lg p-8 border"
              dangerouslySetInnerHTML={{ __html: generateInvoiceHTML() }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <UpiShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} invoice={invoice} />
    </>
  )
}

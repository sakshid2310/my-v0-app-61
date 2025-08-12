"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Mail, Copy, ExternalLink, Printer } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface UpiShareModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: any
}

export function UpiShareModal({ isOpen, onClose, invoice }: UpiShareModalProps) {
  const { clients } = useAppStore()
  const { toast } = useToast()

  if (!invoice) return null

  const client = clients.find((c) => c.id === invoice.clientId)

  // Generate UPI link
  const generateUpiLink = () => {
    const businessUpi = "business@paytm" // Replace with actual UPI ID
    const amount = invoice.total
    const note = `Payment for Invoice ${invoice.invoiceNumber}`
    return `upi://pay?pa=${businessUpi}&pn=HustlePro&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  }

  const upiPaymentLink = generateUpiLink()

  const generateInvoiceText = () => {
    return `Hi ${client?.name || "Client"},

Your invoice ${invoice.invoiceNumber} is ready!

Amount: ${formatCurrency(invoice.total)}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Pay instantly using this UPI link:
${upiPaymentLink}

You can also click this link to pay directly: ${upiPaymentLink}

Invoice Details:
${invoice.items.map((item: any) => `• ${item.description}: ${formatCurrency(item.amount)}`).join("\n")}

Subtotal: ${formatCurrency(invoice.subtotal)}
GST (18%): ${formatCurrency(invoice.gst)}
Total: ${formatCurrency(invoice.total)}

Thank you for your business!

Best regards,
HustlePro`
  }

  const handleWhatsAppShare = async () => {
    const text = generateInvoiceText()
    const phone = client?.phone?.replace(/[^\d]/g, "") || ""
    const encodedText = encodeURIComponent(text)
    const url = `https://wa.me/${phone}?text=${encodedText}`

    // Open WhatsApp in new tab
    window.open(url, "_blank")

    toast({
      title: "WhatsApp Opened",
      description: "WhatsApp opened with invoice details and UPI link.",
    })
    onClose()
  }

  const handleEmailShare = async () => {
    const text = generateInvoiceText()
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} - ${formatCurrency(invoice.total)}`)
    const body = encodeURIComponent(text)

    // Open Gmail in new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${client?.email || ""}&su=${subject}&body=${body}`
    window.open(gmailUrl, "_blank")

    toast({
      title: "Gmail Opened",
      description: "Gmail opened with invoice details and UPI link.",
    })
    onClose()
  }

  const handleCopyUpiLink = () => {
    navigator.clipboard.writeText(upiPaymentLink)
    toast({
      title: "UPI Link Copied",
      description: "Payment link copied to clipboard",
    })
  }

  const handleCopyDetails = () => {
    const text = generateInvoiceText()
    navigator.clipboard.writeText(text)
    toast({
      title: "Details Copied",
      description: "Invoice details with UPI link copied to clipboard",
    })
  }

  const handleOpenUpiLink = () => {
    window.open(upiPaymentLink, "_blank")
    toast({
      title: "UPI App Opening",
      description: "Opening UPI payment app",
    })
  }

  const handlePrintPdf = () => {
    // Generate invoice HTML for printing
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
             Header 
            <div class="header">
              <div class="company-info">
                <h1>HustlePro</h1>
                <p>Professional Business Solutions</p>
                <p>📧 contact@hustlepro.com | 📞 +91 98765 43210</p>
              </div>
              <div class="invoice-badge">INVOICE</div>
            </div>

             Invoice Details 
            <div class="invoice-details">
              <div class="invoice-info">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> <span class="invoice-number">${invoice.invoiceNumber}</span></p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
                <p><strong>Status:</strong> <span style="text-transform: capitalize; color: ${invoice.status === "paid" ? "#10b981" : invoice.status === "overdue" ? "#ef4444" : "#f59e0b"};">${invoice.status}</span></p>
              </div>
            </div>

             Client & Payment Section 
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

             Items Section 
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

             Totals Section 
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

             Terms & Conditions 
            <div class="terms-section">
              <h4>📋 Terms & Conditions</h4>
              <p>• Payment is due within 30 days of invoice date</p>
              <p>• Late payments may incur additional charges</p>
              <p>• Please reference invoice number in all communications</p>
              <p>• For any queries, contact us at the above details</p>
            </div>

             Footer 
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

    // Create a new window and trigger print directly
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const invoiceHTML = generateInvoiceHTML()
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()

      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        printWindow.print()
      }

      toast({
        title: "Print Dialog Opened",
        description: "Print dialog opened. Choose 'Save as PDF' to download or print directly.",
      })
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-2 border-primary/20 max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">Share Invoice</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Share invoice {invoice.invoiceNumber} with {client?.name}
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] space-y-6 px-2">
          {/* Invoice Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">{invoice.invoiceNumber}</span>
              <span className="text-2xl font-bold gradient-text">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
          </div>

          {/* Invoice PDF Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Invoice Preview</label>
            <div className="bg-white rounded-lg shadow-lg p-8 max-h-96 overflow-y-auto border">
              {/* Compact PDF Preview */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b-2 border-purple-500">
                  <div>
                    <h1 className="text-xl font-bold gradient-text">HustlePro</h1>
                    <p className="text-gray-600 text-xs">Professional Business Solutions</p>
                  </div>
                  <div className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">INVOICE</div>
                </div>

                {/* Invoice Details */}
                <div className="flex justify-end">
                  <div className="text-right text-xs space-y-1">
                    <p>
                      <strong>Invoice #:</strong>{" "}
                      <span className="text-purple-600 font-bold">{invoice.invoiceNumber}</span>
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}
                    </p>
                    <p>
                      <strong>Due:</strong> {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Client & Payment Section */}
                <div className="bg-gray-50 rounded p-3 flex justify-between text-xs">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">📋 Bill To:</h3>
                    <div className="flex items-start space-x-2">
                      {client?.logo ? (
                        <img
                          src={client.logo || "/placeholder.svg"}
                          alt={`${client.name} logo`}
                          className="w-8 h-8 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                          {client?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-gray-600">
                        <p className="font-medium text-gray-800">{client?.name}</p>
                        <p>📧 {client?.email}</p>
                        <p>📞 {client?.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 mb-2">💳 Quick Pay</h3>
                    <div className="w-16 h-16 bg-gray-200 border border-purple-500 rounded flex items-center justify-center">
                      <div className="text-xs text-gray-600">QR</div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Scan to pay</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">📝 Items</h3>
                  <div className="bg-white rounded border overflow-hidden">
                    <div className="bg-purple-500 text-white text-xs">
                      <div className="flex py-2 px-3">
                        <div className="flex-1">Description</div>
                        <div className="w-12 text-center">Qty</div>
                        <div className="w-20 text-right">Amount</div>
                      </div>
                    </div>
                    {invoice.items.map((item: any, index: number) => (
                      <div key={index} className="flex py-2 px-3 text-xs border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">{item.description}</div>
                        <div className="w-12 text-center">1</div>
                        <div className="w-20 text-right">{formatCurrency(item.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-40 bg-gray-50 rounded p-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span>{formatCurrency(invoice.gst)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-purple-500 pt-2 mt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UPI Payment Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium">UPI Payment Link</label>
            <div className="flex space-x-2">
              <Input value={upiPaymentLink} readOnly className="flex-1 text-xs bg-primary/5 border-primary/20" />
              <Button size="sm" variant="outline" onClick={handleCopyUpiLink} className="px-3 bg-transparent">
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpenUpiLink} className="px-3 bg-transparent">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share Options</label>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWhatsAppShare} className="bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>

              <Button onClick={handleEmailShare} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <Button onClick={handleCopyDetails} variant="outline" className="animate-button-press bg-transparent">
              <Copy className="mr-2 h-4 w-4" />
              Copy Details
            </Button>

            <Button onClick={handlePrintPdf} variant="outline" className="animate-button-press bg-transparent">
              <Printer className="mr-2 h-4 w-4" />
              Print/PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

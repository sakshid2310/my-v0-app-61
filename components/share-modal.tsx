"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Copy } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { FileText, Download } from "lucide-react"
import { useState } from "react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: any
}

export function ShareModal({ isOpen, onClose, invoice }: ShareModalProps) {
  const { clients } = useAppStore()
  const { toast } = useToast()

  const [isAttachingPdf, setIsAttachingPdf] = useState(false)
  const [attachedPdf, setAttachedPdf] = useState<Blob | null>(null)

  if (!invoice) return null

  const client = clients.find((c) => c.id === invoice.clientId)

  const generateInvoiceText = () => {
    const upiLink = `upi://pay?pa=business@paytm&pn=HustlePro&am=${invoice.total}&cu=INR&tn=Payment for Invoice ${invoice.invoiceNumber}`

    return `Hi ${client?.name || "Client"},

Your invoice ${invoice.invoiceNumber} is ready!

Amount: ${formatCurrency(invoice.total)}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Please find the invoice details below:
${invoice.items.map((item: any) => `• ${item.description}: ${formatCurrency(item.amount)}`).join("\n")}

Subtotal: ${formatCurrency(invoice.subtotal)}
GST (18%): ${formatCurrency(invoice.gst)}
Total: ${formatCurrency(invoice.total)}

💳 Quick Payment via UPI:
${upiLink}

${attachedPdf ? "📄 Invoice PDF is attached with this message." : ""}

Thank you for your business!

Best regards,
HustlePro`
  }

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

  const handleAttachPdf = async () => {
    setIsAttachingPdf(true)
    try {
      // Generate PDF HTML content
      const invoiceHTML = generateInvoiceHTML()
      const blob = new Blob([invoiceHTML], { type: "text/html" })

      // Simulate download process (background)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.html`
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Store the PDF blob for sharing
      setAttachedPdf(blob)

      toast({
        title: "PDF Attached",
        description: "Invoice PDF has been downloaded and attached for sharing",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to attach PDF",
        variant: "destructive",
      })
    } finally {
      setIsAttachingPdf(false)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateInvoiceText())
    const phone = client?.phone?.replace(/[^\d]/g, "") || ""
    const url = `https://wa.me/${phone}?text=${text}`

    if (attachedPdf) {
      // If PDF is attached, create a download link for manual attachment
      const pdfUrl = URL.createObjectURL(attachedPdf)
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `invoice-${invoice.invoiceNumber}.html`
      link.click()
      URL.revokeObjectURL(pdfUrl)

      setTimeout(() => {
        window.open(url, "_blank")
      }, 1000)

      toast({
        title: "WhatsApp & PDF Ready",
        description: "PDF downloaded for attachment. WhatsApp opened with message.",
      })
    } else {
      window.open(url, "_blank")
      toast({
        title: "WhatsApp Opened",
        description: "Invoice shared via WhatsApp",
      })
    }
    onClose()
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} - ${formatCurrency(invoice.total)}`)
    const body = encodeURIComponent(`Dear ${client?.name || "Client"},

I hope this email finds you well.

Please find the details of your invoice below:

Invoice Number: ${invoice.invoiceNumber}
Amount: ${formatCurrency(invoice.total)}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Invoice Details:
${invoice.items.map((item: any) => `• ${item.description}: ${formatCurrency(item.amount)}`).join("\n")}

Subtotal: ${formatCurrency(invoice.subtotal)}
GST (18%): ${formatCurrency(invoice.gst)}
Total Amount: ${formatCurrency(invoice.total)}

💳 Quick Payment via UPI:
upi://pay?pa=business@paytm&pn=HustlePro&am=${invoice.total}&cu=INR&tn=Payment for Invoice ${invoice.invoiceNumber}

${attachedPdf ? "📄 Please find the invoice PDF attached to this email." : ""}

Please make the payment by the due date to avoid any inconvenience.

Thank you for your business!

Best regards,
HustlePro Team
business@hustlepro.com`)

    if (attachedPdf) {
      // Download PDF for manual attachment
      const pdfUrl = URL.createObjectURL(attachedPdf)
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `invoice-${invoice.invoiceNumber}.html`
      link.click()
      URL.revokeObjectURL(pdfUrl)

      setTimeout(() => {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(client?.email || "")}&su=${subject}&body=${body}`
        window.open(gmailUrl, "_blank")
      }, 1000)

      toast({
        title: "Email & PDF Ready",
        description: "PDF downloaded for attachment. Gmail opened with email draft.",
      })
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(client?.email || "")}&su=${subject}&body=${body}`
      window.open(gmailUrl, "_blank")

      toast({
        title: "Gmail Opened",
        description: "Invoice email draft created in Gmail",
      })
    }
    onClose()
  }

  const handleCopyLink = () => {
    const text = generateInvoiceText()
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Invoice details copied to clipboard",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Share Invoice {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <p>
              <strong>Client:</strong> {client?.name}
            </p>
            <p>
              <strong>Amount:</strong> {formatCurrency(invoice.total)}
            </p>
            <p>
              <strong>Due:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>

          {/* UPI Payment Link Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">💳 UPI Payment Link</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">
                upi://pay?pa=business@paytm&pn=HustlePro&am={invoice.total}&cu=INR&tn=Payment for Invoice{" "}
                {invoice.invoiceNumber}
              </code>
            </div>

            {/* Attach PDF Button */}
            <Button
              onClick={handleAttachPdf}
              disabled={isAttachingPdf}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white animate-button-press disabled:opacity-50"
            >
              {isAttachingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Attaching PDF...
                </>
              ) : attachedPdf ? (
                <>
                  <FileText className="mr-2 h-4 w-4 text-green-200" />✅ PDF Attached
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />📎 Attach PDF
                </>
              )}
            </Button>

            {attachedPdf && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                PDF will be included when sharing via WhatsApp or Email
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white animate-button-press"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>

            <Button
              onClick={handleEmailShare}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-button-press"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>

            <Button onClick={handleCopyLink} variant="outline" className="animate-button-press bg-transparent">
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
          </div>

          <Button onClick={onClose} variant="ghost" className="w-full mt-4">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

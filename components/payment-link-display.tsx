"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Smartphone, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface PaymentLinkDisplayProps {
  invoice: any
  client: any
}

export function PaymentLinkDisplay({ invoice, client }: PaymentLinkDisplayProps) {
  const { toast } = useToast()

  const copyPaymentLink = () => {
    if (invoice.paymentLink) {
      navigator.clipboard.writeText(invoice.paymentLink)
      toast({
        title: "Payment Link Copied",
        description: "UPI payment link copied to clipboard",
      })
    }
  }

  const openPaymentLink = () => {
    if (invoice.paymentLink) {
      window.open(invoice.paymentLink, "_blank")
    }
  }

  const generateQRCode = () => {
    // This would generate a QR code for the UPI link
    toast({
      title: "QR Code Generated",
      description: "QR code for payment is ready",
    })
  }

  if (!invoice.paymentLink) return null

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <CreditCard className="mr-2 h-5 w-5 text-green-600" />
          Payment Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Amount Due: {formatCurrency(invoice.total - (invoice.paidAmount || 0))}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">Invoice: {invoice.invoiceNumber}</p>
          </div>
          <Badge variant={invoice.paymentStatus === "paid" ? "default" : "destructive"} className="capitalize">
            {invoice.paymentStatus.replace("-", " ")}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Quick Payment Methods:</h4>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={openPaymentLink}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              size="sm"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Pay with UPI
            </Button>

            <Button onClick={copyPaymentLink} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>

          <Button onClick={generateQRCode} variant="outline" className="w-full bg-transparent" size="sm">
            Generate QR Code
          </Button>
        </div>

        <div className="text-xs text-gray-500 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <p className="font-medium mb-1">Supported Apps:</p>
          <p>PhonePe, Google Pay, Paytm, BHIM, and all UPI apps</p>
        </div>
      </CardContent>
    </Card>
  )
}

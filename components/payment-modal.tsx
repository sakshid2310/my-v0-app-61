"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle } from "lucide-react"
import { createPayment, updatePayment } from "@/lib/crud-actions"
import { useDashboardData } from "@/hooks/use-dashboard-data"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  payment?: any
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? "Updating..." : "Recording..."}
        </>
      ) : (
        `${isEdit ? "Update" : "Record"} Payment`
      )}
    </Button>
  )
}

export function PaymentModal({ isOpen, onClose, payment }: PaymentModalProps) {
  const { clients, invoices, refetch } = useDashboardData()
  const [state, formAction] = useActionState(payment ? updatePayment : createPayment, null)
  const [selectedClient, setSelectedClient] = useState(payment?.client_id || "")
  const [selectedInvoice, setSelectedInvoice] = useState(payment?.invoice_id || "")
  const [selectedMethod, setSelectedMethod] = useState(payment?.payment_method || "upi")
  const [selectedStatus, setSelectedStatus] = useState(payment?.status || "completed")

  const availableInvoices = invoices.filter(
    (invoice) => invoice.client_id === selectedClient && invoice.status !== "paid",
  )

  const handleSuccess = async () => {
    if (state?.success) {
      await refetch()
      onClose()
    }
  }

  // Handle success state
  if (state?.success) {
    setTimeout(handleSuccess, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">{payment ? "Edit Payment" : "Record New Payment"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {payment && <input type="hidden" name="paymentId" value={payment.id} />}
          <input type="hidden" name="clientId" value={selectedClient} />
          <input type="hidden" name="invoiceId" value={selectedInvoice} />
          <input type="hidden" name="paymentMethod" value={selectedMethod} />
          <input type="hidden" name="status" value={selectedStatus} />

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {state.success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium">
              Client *
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="glass-card border-white/20">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableInvoices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="invoice" className="text-sm font-medium">
                Invoice (Optional)
              </Label>
              <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific invoice</SelectItem>
                  {availableInvoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - ₹{invoice.total}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (₹) *
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={payment?.amount || ""}
                className="glass-card border-white/20"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="text-sm font-medium">
                Payment Date *
              </Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                defaultValue={payment?.payment_date || new Date().toISOString().split("T")[0]}
                className="glass-card border-white/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method" className="text-sm font-medium">
                Payment Method
              </Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber" className="text-sm font-medium">
              Reference Number
            </Label>
            <Input
              id="referenceNumber"
              name="referenceNumber"
              defaultValue={payment?.reference_number || ""}
              className="glass-card border-white/20"
              placeholder="Transaction reference"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={payment?.notes || ""}
              className="glass-card border-white/20"
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <SubmitButton isEdit={!!payment} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

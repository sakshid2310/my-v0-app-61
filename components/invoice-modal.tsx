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
import { createInvoice, updateInvoice } from "@/lib/crud-actions"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { formatCurrency } from "@/lib/utils"

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoice?: any
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? "Updating..." : "Creating..."}
        </>
      ) : (
        `${isEdit ? "Update" : "Create"} Invoice`
      )}
    </Button>
  )
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  const { clients, refetch } = useDashboardData()
  const [state, formAction] = useActionState(invoice ? updateInvoice : createInvoice, null)
  const [selectedClient, setSelectedClient] = useState(invoice?.client_id || "")
  const [selectedStatus, setSelectedStatus] = useState(invoice?.status || "draft")
  const [subtotal, setSubtotal] = useState(invoice?.subtotal || 0)
  const [taxRate, setTaxRate] = useState(invoice?.tax_rate || 0.18)

  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

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
      <DialogContent className="glass-card border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="gradient-text">{invoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {invoice && <input type="hidden" name="invoiceId" value={invoice.id} />}
          <input type="hidden" name="clientId" value={selectedClient} />
          <input type="hidden" name="status" value={selectedStatus} />
          <input type="hidden" name="subtotal" value={subtotal.toString()} />
          <input type="hidden" name="taxRate" value={taxRate.toString()} />

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

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={invoice?.due_date || ""}
              className="glass-card border-white/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotalInput" className="text-sm font-medium">
                Subtotal (₹) *
              </Label>
              <Input
                id="subtotalInput"
                type="number"
                step="0.01"
                value={subtotal}
                onChange={(e) => setSubtotal(Number.parseFloat(e.target.value) || 0)}
                className="glass-card border-white/20"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRateInput" className="text-sm font-medium">
                Tax Rate (%)
              </Label>
              <Input
                id="taxRateInput"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                className="glass-card border-white/20"
                placeholder="0.18"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={invoice?.notes || ""}
              className="glass-card border-white/20"
              placeholder="Additional notes or terms"
              rows={3}
            />
          </div>

          <div className="glass-card p-4 border-white/20 rounded-lg">
            <h3 className="font-semibold mb-3">Invoice Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <SubmitButton isEdit={!!invoice} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

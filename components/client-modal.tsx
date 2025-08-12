"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"
import { createClient, updateClient } from "@/lib/crud-actions"
import { useDashboardData } from "@/hooks/use-dashboard-data"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: any
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? "Updating..." : "Creating..."}
        </>
      ) : (
        `${isEdit ? "Update" : "Add"} Client`
      )}
    </Button>
  )
}

export function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const { refetch } = useDashboardData()
  const [state, formAction] = useActionState(client ? updateClient : createClient, null)

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
          <DialogTitle className="gradient-text">{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {client && <input type="hidden" name="clientId" value={client.id} />}

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
            <Label htmlFor="name" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={client?.name || ""}
              className="glass-card border-white/20"
              placeholder="Client name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email || ""}
              className="glass-card border-white/20"
              placeholder="client@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Company
            </Label>
            <Input
              id="company"
              name="company"
              defaultValue={client?.company || ""}
              className="glass-card border-white/20"
              placeholder="Company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={client?.phone || ""}
              className="glass-card border-white/20"
              placeholder="+91 9876543210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={client?.address || ""}
              className="glass-card border-white/20"
              placeholder="Client address"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <SubmitButton isEdit={!!client} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

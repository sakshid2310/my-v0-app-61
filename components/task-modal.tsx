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
import { createTask, updateTask } from "@/lib/crud-actions"
import { useDashboardData } from "@/hooks/use-dashboard-data"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: any
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? "Updating..." : "Creating..."}
        </>
      ) : (
        `${isEdit ? "Update" : "Add"} Task`
      )}
    </Button>
  )
}

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { clients, refetch } = useDashboardData()
  const [state, formAction] = useActionState(task ? updateTask : createTask, null)
  const [selectedClient, setSelectedClient] = useState(task?.client_id || "")
  const [selectedPriority, setSelectedPriority] = useState(task?.priority || "medium")
  const [selectedStatus, setSelectedStatus] = useState(task?.status || "pending")

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
          <DialogTitle className="gradient-text">{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {task && <input type="hidden" name="taskId" value={task.id} />}
          <input type="hidden" name="clientId" value={selectedClient} />
          <input type="hidden" name="priority" value={selectedPriority} />
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
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={task?.title || ""}
              className="glass-card border-white/20"
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task?.description || ""}
              className="glass-card border-white/20"
              placeholder="Task description"
              rows={3}
            />
          </div>

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
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={task?.due_date || ""}
              className="glass-card border-white/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <SubmitButton isEdit={!!task} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

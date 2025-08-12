"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, X, MessageCircle, Mail, CheckCircle, AlertCircle, Clock, FileText, Calendar } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToSection?: (section: string, itemId?: string) => void
}

export function NotificationPanel({ isOpen, onClose, onNavigateToSection }: NotificationPanelProps) {
  const { notifications, markNotificationRead, clearNotifications, sendPaymentReminder, clients, invoices, tasks } =
    useAppStore()
  const router = useRouter()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "payment_received":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "task_due":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "invoice_sent":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "payment_due":
        return <Calendar className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id)

    // Navigate to the relevant section based on notification type
    switch (notification.type) {
      case "payment_overdue":
      case "payment_received":
        if (onNavigateToSection) {
          onNavigateToSection("invoices", notification.invoiceId)
        } else {
          router.push("/invoices")
        }
        break
      case "task_due":
        if (onNavigateToSection) {
          onNavigateToSection("tasks", notification.taskId)
        } else {
          router.push("/tasks")
        }
        break
      case "invoice_sent":
        if (onNavigateToSection) {
          onNavigateToSection("invoices", notification.invoiceId)
        } else {
          router.push("/invoices")
        }
        break
      default:
        break
    }

    onClose()
  }

  const handleSendReminder = (invoiceId: string, method: "whatsapp" | "email") => {
    sendPaymentReminder(invoiceId, method)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </SheetTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs">
                Clear All
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <div className="p-4 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const client = clients.find((c) => c.id === notification.clientId)
                const invoice = invoices.find((i) => i.id === notification.invoiceId)
                const task = tasks.find((t) => t.id === notification.taskId)

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      notification.read
                        ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="ml-2">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>

                        {notification.type === "payment_overdue" && notification.invoiceId && (
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendReminder(notification.invoiceId!, "whatsapp")
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendReminder(notification.invoiceId!, "email")
                              }}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                          </div>
                        )}

                        {client && <div className="text-xs text-gray-500 mt-1">Client: {client.name}</div>}

                        {invoice && (
                          <div className="text-xs text-gray-500">
                            Invoice: {invoice.invoiceNumber} - {formatCurrency(invoice.total)}
                          </div>
                        )}

                        {task && (
                          <div className="text-xs text-gray-500">
                            Task: {task.title} - {formatCurrency(task.price)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

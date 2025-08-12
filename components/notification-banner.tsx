"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: number
  action?: () => void
  actionLabel?: string
}

interface NotificationBannerProps {
  showNotifications?: boolean
}

export function NotificationBanner({ showNotifications = false }: NotificationBannerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { tasks, invoices, payments } = useAppStore()

  useEffect(() => {
    if (!showNotifications) return

    const now = new Date()
    const newNotifications: Notification[] = []

    // Check for overdue tasks
    const overdueTasksCount = tasks.filter(
      (task) => new Date(task.deadline) < now && task.status !== "completed",
    ).length

    // Check for overdue invoices
    const overdueInvoicesCount = invoices.filter(
      (invoice) => new Date(invoice.dueDate) < now && invoice.status !== "paid",
    ).length

    // Check for pending payments
    const pendingPaymentsCount = payments.filter((payment) => payment.status === "pending").length

    // Check for recent achievements
    const completedTasksToday = tasks.filter((task) => {
      const completedDate = new Date(task.updatedAt || task.createdAt)
      const today = new Date()
      return task.status === "completed" && completedDate.toDateString() === today.toDateString()
    }).length

    if (overdueTasksCount > 0) {
      newNotifications.push({
        id: "overdue-tasks",
        type: "error",
        title: "Overdue Tasks",
        message: `You have ${overdueTasksCount} overdue task${overdueTasksCount > 1 ? "s" : ""} that need attention`,
        timestamp: Date.now(),
      })
    }

    if (overdueInvoicesCount > 0) {
      newNotifications.push({
        id: "overdue-invoices",
        type: "warning",
        title: "Payment Overdue",
        message: `${overdueInvoicesCount} invoice${overdueInvoicesCount > 1 ? "s are" : " is"} past due date`,
        timestamp: Date.now(),
      })
    }

    if (pendingPaymentsCount > 0) {
      newNotifications.push({
        id: "pending-payments",
        type: "info",
        title: "Pending Payments",
        message: `${pendingPaymentsCount} payment${pendingPaymentsCount > 1 ? "s" : ""} awaiting confirmation`,
        timestamp: Date.now(),
      })
    }

    if (completedTasksToday > 0) {
      newNotifications.push({
        id: "daily-achievement",
        type: "success",
        title: "Great Progress!",
        message: `You've completed ${completedTasksToday} task${completedTasksToday > 1 ? "s" : ""} today. Keep it up!`,
        timestamp: Date.now(),
      })
    }

    setNotifications(newNotifications)
  }, [tasks, invoices, payments, showNotifications])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNotificationClass = (type: string) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-700/50 text-green-800 dark:text-green-200"
      case "error":
        return "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200/50 dark:border-red-700/50 text-red-800 dark:text-red-200"
      case "warning":
        return "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200/50 dark:border-orange-700/50 text-orange-800 dark:text-orange-200"
      case "info":
        return "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-700/50 text-blue-800 dark:text-blue-200"
      default:
        return "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-700/50 text-blue-800 dark:text-blue-200"
    }
  }

  if (!showNotifications || notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-80">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`animate-notification ${getNotificationClass(notification.type)} rounded-xl p-4 shadow-lg backdrop-blur-sm min-h-[80px] max-h-[120px]`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start space-x-3 h-full">
            <div className="flex-shrink-0 mt-0.5 opacity-70">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold truncate pr-2">{notification.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm opacity-80 line-clamp-2 leading-relaxed">{notification.message}</p>
              {notification.action && notification.actionLabel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={notification.action}
                  className="mt-2 h-7 text-xs hover:bg-black/10 dark:hover:bg-white/10 self-start px-2"
                >
                  {notification.actionLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

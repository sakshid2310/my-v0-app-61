"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  Target,
  Zap,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Calendar,
  ArrowRight,
  FileText,
  MessageCircle,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { NotificationBanner } from "@/components/notification-banner"
import { EarningsChart } from "@/components/earnings-chart"
import { useToast } from "@/hooks/use-toast"
import { useDashboardData } from "@/hooks/use-dashboard-data"

interface DashboardProps {
  onNavigateToPayments?: () => void
  onNavigateToTasks?: () => void
  onNavigateToInvoices?: () => void
  onNavigateToClients?: () => void
}

export function Dashboard({
  onNavigateToPayments,
  onNavigateToTasks,
  onNavigateToInvoices,
  onNavigateToClients,
}: DashboardProps) {
  const { clients, tasks, invoices, payments, notifications, loading, error, refetch } = useDashboardData()
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Loading your business overview...</p>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Error loading your business data</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Failed to Load Data</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={refetch} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthEarnings = payments
    .filter((p) => {
      const paymentDate = new Date(p.payment_date)
      return (
        p.status === "completed" && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const pendingPayments = invoices
    .filter((i) => i.status === "pending" || i.status === "partially-paid")
    .reduce((sum, i) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0)

  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter(
    (t) => t.status === "in-progress" || t.status === "todo" || t.status === "pending",
  ).length
  const activeClients = clients.filter((c) => c.status === "active" || !c.status).length
  const openTasksCount = tasks.filter((t) => t.status !== "completed").length

  // Overdue tasks
  const today = new Date()
  const overdueTasks = tasks.filter((t) => new Date(t.due_date) < today && t.status !== "completed")

  // Unpaid invoices
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid")
  const unpaidInvoicesAmount = unpaidInvoices.reduce((sum, i) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0)

  // Average payment time calculation
  const paidInvoices = invoices.filter((i) => i.status === "paid")
  const averagePaymentTime =
    paidInvoices.length > 0
      ? paidInvoices.reduce((sum, invoice) => {
          const sentDate = new Date(invoice.due_date)
          const paidPayment = payments.find((p) => p.invoice_id === invoice.id && p.status === "completed")
          if (paidPayment) {
            const paidDate = new Date(paidPayment.payment_date)
            const daysDiff = Math.ceil((paidDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + Math.max(0, daysDiff)
          }
          return sum
        }, 0) / paidInvoices.length
      : 0

  const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  // Previous month comparison for revenue
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const lastMonthEarnings = payments
    .filter((p) => {
      const paymentDate = new Date(p.payment_date)
      return (
        p.status === "completed" && paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
      )
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const revenueGrowth =
    lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0
        ? 100
        : 0

  // Tasks due in next 3 days
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(today.getDate() + 3)
  const upcomingTasks = tasks
    .filter((t) => {
      const taskDate = new Date(t.due_date)
      return t.status !== "completed" && taskDate >= today && taskDate <= threeDaysFromNow
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)

  // Overdue invoices
  const overdueInvoices = invoices
    .filter((i) => {
      const dueDate = new Date(i.due_date)
      return dueDate < today && i.status !== "paid"
    })
    .map((invoice) => {
      const client = clients.find((c) => c.id === invoice.client_id)
      const daysOverdue = Math.ceil((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...invoice,
        client,
        daysOverdue,
        remainingAmount: (invoice.total || 0) - (invoice.paidAmount || 0),
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  const totalInvoices = invoices.length
  const invoicePaymentRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0

  // Payment Overview Data
  const pendingInvoices = invoices.filter((i) => i.status === "pending")
  const partiallyPaidInvoices = invoices.filter((i) => i.status === "partially-paid")
  const paidPayments = invoices.filter((i) => i.status === "paid")

  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0)
  const partiallyPaidAmount = partiallyPaidInvoices.reduce((sum, i) => sum + ((i.total || 0) - (i.paidAmount || 0)), 0)
  const completedAmount = paidPayments.reduce((sum, i) => sum + (i.total || 0), 0)

  // Task Overview Data
  const todayString = today.toDateString()
  const dueTodayTasks = tasks.filter(
    (t) => new Date(t.due_date).toDateString() === todayString && t.status !== "completed",
  )
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== "completed" && new Date(t.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3)

  const handlePaymentCardClick = (type: string) => {
    if (onNavigateToPayments) {
      onNavigateToPayments()
    }
  }

  const handleTaskClick = (taskId: string) => {
    if (onNavigateToTasks) {
      onNavigateToTasks()
    }
  }

  const handleSendReminder = (invoiceId: string, method: "whatsapp" | "email") => {
    const invoice = invoices.find((i) => i.id === invoiceId)
    const client = clients.find((c) => c.id === invoice?.client_id)

    if (!invoice || !client) return

    const generatePaymentReminderText = () => {
      const remainingAmount = (invoice.total || 0) - (invoice.paidAmount || 0)
      return `Hi ${client.name},

This is a friendly reminder about your overdue payment.

Invoice Details:
Invoice Number: ${invoice.invoice_number}
Amount: ${formatCurrency(remainingAmount)}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
Days Overdue: ${Math.ceil((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))}

Please complete your payment at your earliest convenience to avoid any service interruption.

If you have already made the payment, please ignore this message.

Thank you for your business!

Best regards,
HustlePro`
    }

    const reminderText = generatePaymentReminderText()

    if (method === "whatsapp") {
      const phone = client.phone?.replace(/[^\d]/g, "") || ""
      const encodedText = encodeURIComponent(reminderText)
      const url = `https://wa.me/${phone}?text=${encodedText}`
      window.open(url, "_blank")
    } else if (method === "email") {
      const subject = encodeURIComponent(`Payment Overdue Reminder - ${invoice.invoice_number}`)
      const body = encodeURIComponent(reminderText)
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${client.email || ""}&su=${subject}&body=${body}`
      window.open(gmailUrl, "_blank")
    }

    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent via ${method}`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Notifications - Only show on dashboard */}
      <NotificationBanner showNotifications={true} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refetch} className="bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
          >
            <Zap className="w-3 h-3 mr-1" />
            All Systems Active
          </Badge>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              This Month Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 animate-count-up">
              {formatCurrency(thisMonthEarnings)}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`} />
              <span className={`text-sm font-medium ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {revenueGrowth >= 0 ? "+" : ""}
                {revenueGrowth.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToInvoices?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 animate-count-up">
              {formatCurrency(pendingPayments)}
            </div>
            <div className="flex items-center mt-2">
              <IndianRupee className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm text-orange-600 font-medium">{unpaidInvoices.length} invoices pending</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToClients?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 animate-count-up">{activeClients}</div>
            <div className="flex items-center mt-2">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">{clients.length} total clients</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToTasks?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Open Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 animate-count-up">
              {openTasksCount}
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600 font-medium">{overdueTasks.length} overdue</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Business Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToInvoices?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Invoices Sent (Unpaid)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 animate-count-up">
              {unpaidInvoices.length}
            </div>
            <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mt-1">
              {formatCurrency(unpaidInvoicesAmount)}
            </div>
            <div className="flex items-center mt-2">
              <FileText className="h-4 w-4 text-indigo-600 mr-1" />
              <span className="text-sm text-indigo-600 font-medium">Total unpaid amount</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">Avg Payment Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900 dark:text-teal-100 animate-count-up">
              {averagePaymentTime.toFixed(0)} days
            </div>
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 text-teal-600 mr-1" />
              <span className="text-sm text-teal-600 font-medium">
                {averagePaymentTime <= 30 ? "Excellent" : averagePaymentTime <= 45 ? "Good" : "Needs improvement"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 animate-count-up">
              {taskCompletionRate.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">
                {completedTasks} of {tasks.length} completed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {taskCompletionRate.toFixed(1)}%
              </span>
              <div className="flex items-center">
                <Target className="h-4 w-4 text-emerald-600 mr-1" />
                <Badge
                  variant={taskCompletionRate >= 80 ? "default" : "secondary"}
                  className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-800/50 dark:text-emerald-300 dark:border-emerald-700"
                >
                  {taskCompletionRate >= 80 ? "Excellent" : "Good"}
                </Badge>
              </div>
            </div>
            <Progress value={taskCompletionRate} className="h-2" />
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <span>{completedTasks} completed</span>
              <span>{tasks.length} total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Invoice Payment Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {invoicePaymentRate.toFixed(1)}%
              </span>
              <div className="flex items-center">
                <IndianRupee className="h-4 w-4 text-indigo-600 mr-1" />
                <Badge
                  variant={invoicePaymentRate >= 80 ? "default" : "secondary"}
                  className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-800/50 dark:text-indigo-300 dark:border-indigo-700"
                >
                  {invoicePaymentRate >= 80 ? "Great" : "Improving"}
                </Badge>
              </div>
            </div>
            <Progress value={invoicePaymentRate} className="h-2" />
            <div className="flex justify-between text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              <span>{paidInvoices.length} paid</span>
              <span>{totalInvoices} total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-amber-700 dark:text-amber-300">
            Upcoming Deadlines (Next 3 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const client = clients.find((c) => c.id === task.client_id)
                const taskDate = new Date(task.due_date)
                const isToday = taskDate.toDateString() === todayString
                const isOverdue = taskDate < today

                let colorClass = "border-yellow-200 bg-yellow-50 text-yellow-800"
                let urgencyText = "Due Soon"

                if (isOverdue) {
                  colorClass = "border-red-200 bg-red-50 text-red-800"
                  urgencyText = "Overdue"
                } else if (isToday) {
                  colorClass = "border-orange-200 bg-orange-50 text-orange-800"
                  urgencyText = "Due Today"
                }

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border-2 ${colorClass} cursor-pointer hover:shadow-md transition-all duration-200`}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate mb-1">{task.title}</div>
                        <div className="text-xs opacity-75 truncate">{client?.name}</div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-xs font-bold mb-1">{urgencyText}</div>
                        <div className="text-xs">{taskDate.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-amber-600">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming deadlines in the next 3 days</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold gradient-text">Payment Overview</h2>
          <Badge
            variant="outline"
            className="text-xs bg-muted/50 text-muted-foreground border-border/50 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onNavigateToInvoices?.()}
          >
            {invoices.length} total invoices
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handlePaymentCardClick("pending")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100 animate-count-up">
                {formatCurrency(pendingAmount)}
              </div>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">{pendingInvoices.length} invoices</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handlePaymentCardClick("partial")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Partially Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 animate-count-up">
                {formatCurrency(partiallyPaidAmount)}
              </div>
              <div className="flex items-center mt-2">
                <CreditCard className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600 font-medium">{partiallyPaidInvoices.length} invoices</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handlePaymentCardClick("completed")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Completed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 animate-count-up">
                {formatCurrency(completedAmount)}
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">{paidPayments.length} invoices</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold gradient-text">Tasks Overview</h2>
          <Badge
            variant="outline"
            className="text-xs bg-muted/50 text-muted-foreground border-border/50 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onNavigateToTasks?.()}
          >
            {tasks.length} total tasks
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100 animate-count-up">
                {dueTodayTasks.length}
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">
                  {dueTodayTasks.length > 0 ? "Need attention" : "All clear"}
                </span>
              </div>
              {dueTodayTasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {dueTodayTasks.slice(0, 2).map((task) => {
                    const client = clients.find((c) => c.id === task.client_id)
                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-red-200/50 dark:border-red-700/50"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                            {client?.name}
                          </span>
                          <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 px-2 py-1 rounded">
                            {formatCurrency(task.price)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {dueTodayTasks.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateToTasks?.()}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 text-xs h-8"
                    >
                      View all {dueTodayTasks.length} tasks
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 animate-count-up">
                {upcomingDeadlines.length}
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600 font-medium">
                  {upcomingDeadlines.length > 0 ? "Scheduled" : "No upcoming"}
                </span>
              </div>
              {upcomingDeadlines.length > 0 && (
                <div className="mt-3 space-y-2">
                  {upcomingDeadlines.slice(0, 2).map((task) => {
                    const client = clients.find((c) => c.id === task.client_id)
                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-blue-200/50 dark:border-blue-700/50"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded">
                            {formatCurrency(task.price)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {upcomingDeadlines.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateToTasks?.()}
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 text-xs h-8"
                    >
                      View all {upcomingDeadlines.length} tasks
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-800/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 animate-count-up">
                {overdueTasks.length}
              </div>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-4 w-4 text-gray-600 mr-1" />
                <span className="text-sm text-gray-600 font-medium">
                  {overdueTasks.length > 0 ? "Past due" : "All clear"}
                </span>
              </div>
              {overdueTasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {overdueTasks.slice(0, 2).map((task) => {
                    const client = clients.find((c) => c.id === task.client_id)
                    const daysOverdue = Math.ceil(
                      (Date.now() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-600 dark:text-red-400 truncate font-medium">
                            Overdue by {daysOverdue} days
                          </span>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700/50 px-2 py-1 rounded">
                            {formatCurrency(task.price)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {overdueTasks.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateToTasks?.()}
                      className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/30 text-xs h-8"
                    >
                      View all {overdueTasks.length} tasks
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overdue Payments Section */}
      {overdueInvoices.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Overdue Payments ({overdueInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueInvoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-red-200/50 dark:border-red-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {invoice.client?.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{invoice.invoice_number}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-bold text-sm text-red-700 dark:text-red-300">
                      {formatCurrency(invoice.remainingAmount)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">{invoice.daysOverdue} days overdue</div>
                  </div>
                  <div className="ml-3 flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 bg-green-100 hover:bg-green-200 text-green-700 border-green-300 p-1"
                      onClick={() => handleSendReminder(invoice.id, "whatsapp")}
                    >
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300 p-1"
                      onClick={() => handleSendReminder(invoice.id, "email")}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {overdueInvoices.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToInvoices?.()}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 text-xs h-8"
              >
                View all {overdueInvoices.length} overdue invoices
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revenue Trend Chart */}
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold gradient-text">Revenue Trend</span>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Last 6 Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EarningsChart />
        </CardContent>
      </Card>

      {/* Show empty state if no data */}
      {clients.length === 0 && tasks.length === 0 && invoices.length === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900/20 dark:to-purple-800/20">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-4">Welcome to HustlePro!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by adding your first client, creating a task, or generating an invoice. Your business data
              will appear here.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => onNavigateToClients?.()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Users className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
              <Button
                onClick={() => onNavigateToTasks?.()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

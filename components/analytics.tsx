"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Users,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  DollarSign,
  BarChart3,
  PieChart,
  Award,
  AlertTriangle,
  Zap,
  Activity,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { EarningsChart } from "@/components/earnings-chart"
import { useToast } from "@/hooks/use-toast"

export function Analytics() {
  const { tasks, invoices, payments, clients } = useAppStore()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("monthly")

  // Date filtering logic
  const getDateRange = (period: string) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case "weekly":
        const weekStart = new Date(startOfDay)
        weekStart.setDate(startOfDay.getDate() - startOfDay.getDay())
        return { start: weekStart, end: now }
      case "monthly":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
        }
      case "quarterly":
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        return { start: quarterStart, end: now }
      case "yearly":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now,
        }
      case "all":
      default:
        return { start: new Date(2020, 0, 1), end: now }
    }
  }

  const { start: dateStart, end: dateEnd } = getDateRange(dateRange)

  // Filter data by date range
  const filteredPayments = useMemo(
    () =>
      payments.filter((p) => {
        const paymentDate = new Date(p.date)
        return paymentDate >= dateStart && paymentDate <= dateEnd
      }),
    [payments, dateStart, dateEnd],
  )

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((i) => {
        const invoiceDate = new Date(i.dueDate)
        return invoiceDate >= dateStart && invoiceDate <= dateEnd
      }),
    [invoices, dateStart, dateEnd],
  )

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const taskDate = new Date(t.deadline)
        return taskDate >= dateStart && taskDate <= dateEnd
      }),
    [tasks, dateStart, dateEnd],
  )

  // Revenue Analytics
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalEarningsByPeriod = totalRevenue

  const earningsByClient = useMemo(() => {
    const clientEarnings = clients
      .map((client) => {
        const clientPayments = filteredPayments.filter((p) => p.clientId === client.id)
        const earnings = clientPayments.reduce((sum, p) => sum + p.amount, 0)
        const percentage = totalRevenue > 0 ? (earnings / totalRevenue) * 100 : 0
        return { ...client, earnings, percentage }
      })
      .sort((a, b) => b.earnings - a.earnings)
    return clientEarnings
  }, [clients, filteredPayments, totalRevenue])

  const averageInvoiceValue =
    filteredInvoices.length > 0
      ? filteredInvoices.reduce((sum, inv) => sum + inv.total, 0) / filteredInvoices.length
      : 0

  const paymentDelayTrend = useMemo(() => {
    const paidInvoices = filteredInvoices.filter((i) => i.paymentStatus === "paid")
    if (paidInvoices.length === 0) return 0

    const totalDelay = paidInvoices.reduce((sum, inv) => {
      const dueDate = new Date(inv.dueDate)
      const paidDate = new Date() // Simplified - in real app, track actual payment date
      const delay = Math.max(0, (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + delay
    }, 0)

    return totalDelay / paidInvoices.length
  }, [filteredInvoices])

  const onTimeVsLatePayments = useMemo(() => {
    const paidInvoices = filteredInvoices.filter((i) => i.paymentStatus === "paid")
    if (paidInvoices.length === 0) return { onTime: 0, late: 0, onTimePercentage: 0 }

    const onTime = paidInvoices.filter((inv) => {
      const dueDate = new Date(inv.dueDate)
      const paidDate = new Date() // Simplified
      return paidDate <= dueDate
    }).length

    const late = paidInvoices.length - onTime
    const onTimePercentage = (onTime / paidInvoices.length) * 100

    return { onTime, late, onTimePercentage }
  }, [filteredInvoices])

  // Task Analytics
  const completedTasks = filteredTasks.filter((t) => t.status === "completed")
  const taskCompletionRate = filteredTasks.length > 0 ? (completedTasks.length / filteredTasks.length) * 100 : 0

  const averageTaskDuration = useMemo(() => {
    if (completedTasks.length === 0) return 0

    const totalDuration = completedTasks.reduce((sum, task) => {
      const createdDate = new Date(task.deadline) // Simplified - use creation date if available
      const completedDate = new Date() // Simplified - use completion date if available
      const duration = (completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      return sum + Math.abs(duration)
    }, 0)

    return totalDuration / completedTasks.length
  }, [completedTasks])

  const tasksByClient = useMemo(() => {
    return clients
      .map((client) => {
        const clientTasks = filteredTasks.filter((t) => t.clientId === client.id)
        const completed = clientTasks.filter((t) => t.status === "completed").length
        const inProgress = clientTasks.filter((t) => t.status === "in-progress").length
        const pending = clientTasks.filter((t) => t.status === "pending").length

        return {
          ...client,
          totalTasks: clientTasks.length,
          completed,
          inProgress,
          pending,
          completionRate: clientTasks.length > 0 ? (completed / clientTasks.length) * 100 : 0,
        }
      })
      .sort((a, b) => b.totalTasks - a.totalTasks)
  }, [clients, filteredTasks])

  const overdueTasks = filteredTasks.filter((t) => new Date(t.deadline) < new Date() && t.status !== "completed")

  const tasksByPriority = useMemo(() => {
    const high = filteredTasks.filter((t) => t.priority === "high").length
    const medium = filteredTasks.filter((t) => t.priority === "medium").length
    const low = filteredTasks.filter((t) => t.priority === "low").length
    return { high, medium, low }
  }, [filteredTasks])

  const billableVsNonBillable = useMemo(() => {
    const billable = filteredTasks.filter((t) => t.price > 0).length
    const nonBillable = filteredTasks.length - billable
    const billableRevenue = filteredTasks.filter((t) => t.price > 0).reduce((sum, t) => sum + t.price, 0)

    return { billable, nonBillable, billableRevenue }
  }, [filteredTasks])

  // Client Performance Analytics
  const topClientsByRevenue = earningsByClient.slice(0, 5)

  const clientsWithHighestDelays = useMemo(() => {
    return clients
      .map((client) => {
        const clientInvoices = filteredInvoices.filter((i) => i.clientId === client.id && i.paymentStatus === "paid")
        if (clientInvoices.length === 0) return { ...client, averageDelay: 0 }

        const totalDelay = clientInvoices.reduce((sum, inv) => {
          const dueDate = new Date(inv.dueDate)
          const paidDate = new Date() // Simplified
          const delay = Math.max(0, (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return sum + delay
        }, 0)

        return { ...client, averageDelay: totalDelay / clientInvoices.length }
      })
      .sort((a, b) => b.averageDelay - a.averageDelay)
      .slice(0, 5)
  }, [clients, filteredInvoices])

  const repeatBusinessRate = useMemo(() => {
    const clientsWithMultipleTasks = clients.filter((client) => {
      const clientTasks = filteredTasks.filter((t) => t.clientId === client.id)
      return clientTasks.length > 1
    }).length

    return clients.length > 0 ? (clientsWithMultipleTasks / clients.length) * 100 : 0
  }, [clients, filteredTasks])

  const avgTaskCompletionTimePerClient = useMemo(() => {
    return clients
      .map((client) => {
        const clientTasks = completedTasks.filter((t) => t.clientId === client.id)
        if (clientTasks.length === 0) return { ...client, avgCompletionTime: 0 }

        const totalTime = clientTasks.reduce((sum, task) => {
          // Simplified calculation - in real app, track actual completion time
          return sum + 7 // Average 7 days per task
        }, 0)

        return { ...client, avgCompletionTime: totalTime / clientTasks.length }
      })
      .sort((a, b) => a.avgCompletionTime - b.avgCompletionTime)
  }, [clients, completedTasks])

  // Cash Flow & Payment Insights
  const revenueForecast = useMemo(() => {
    const unpaidInvoices = invoices.filter((i) => i.paymentStatus === "pending" || i.paymentStatus === "partially-paid")
    return unpaidInvoices.reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0)
  }, [invoices])

  const monthlyCashFlow = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const inflow = payments
      .filter((p) => {
        const paymentDate = new Date(p.date)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      })
      .reduce((sum, p) => sum + p.amount, 0)

    // Simplified outflow calculation
    const outflow = inflow * 0.3 // Assume 30% expenses

    return { inflow, outflow, netFlow: inflow - outflow }
  }, [payments])

  const collectionRate = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

    return totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0
  }, [invoices, payments])

  // Current calculations for existing cards
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = payments
    .filter((p) => {
      const paymentDate = new Date(p.date)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const averagePaymentPerProject = completedTasks.length > 0 ? totalRevenue / completedTasks.length : 0

  const pendingInvoices = invoices.filter((i) => i.paymentStatus === "pending")
  const overdueInvoices = invoices.filter((i) => i.paymentStatus === "pending" && new Date(i.dueDate) < new Date())
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0)
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0)

  const totalTasks = tasks.length
  const totalTasksCompleted = completedTasks.length
  const paidInvoices = invoices.filter((i) => i.paymentStatus === "paid")

  const highPriorityTasks = tasks.filter((t) => t.priority === "high").length
  const mediumPriorityTasks = tasks.filter((t) => t.priority === "medium").length
  const lowPriorityTasks = tasks.filter((t) => t.priority === "low").length

  const clientRevenue = clients
    .map((client) => {
      const clientPayments = payments.filter((p) => p.clientId === client.id)
      const revenue = clientPayments.reduce((sum, p) => sum + p.amount, 0)
      const taskCount = tasks.filter((t) => t.clientId === client.id).length
      return { ...client, revenue, taskCount }
    })
    .sort((a, b) => b.revenue - a.revenue)

  const mostProfitableClients = clientRevenue.slice(0, 5)
  const mostFrequentClients = clientRevenue.sort((a, b) => b.taskCount - a.taskCount).slice(0, 5)

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Comprehensive insights into your business performance and growth metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Analysis Period</span>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="quarterly">This Quarter</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 1. Revenue & Earnings Reports */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Revenue & Earnings Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  {dateRange === "all" ? "All time" : `This ${dateRange.replace("ly", "")}`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Average Invoice Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(averageInvoiceValue)}
              </div>
              <div className="flex items-center mt-2">
                <Target className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600 font-medium">Per invoice</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Payment Delay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {paymentDelayTrend.toFixed(1)} days
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-sm text-purple-600 font-medium">Average delay</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                On-Time Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {onTimeVsLatePayments.onTimePercentage.toFixed(1)}%
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle2 className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600 font-medium">
                  {onTimeVsLatePayments.onTime}/{onTimeVsLatePayments.onTime + onTimeVsLatePayments.late} invoices
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings by Client */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Earnings by Client</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {earningsByClient.slice(0, 5).map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {client.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(client.earnings)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 2. Payment Tracking Reports */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Payment Tracking Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Revenue Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {formatCurrency(revenueForecast)}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-sm text-yellow-600 font-medium">Unpaid invoices</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{collectionRate.toFixed(1)}%</div>
              <div className="flex items-center mt-2">
                <Target className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">Invoices collected</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Monthly Inflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {formatCurrency(monthlyCashFlow.inflow)}
              </div>
              <div className="flex items-center mt-2">
                <DollarSign className="h-4 w-4 text-indigo-600 mr-1" />
                <span className="text-sm text-indigo-600 font-medium">This month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Net Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(monthlyCashFlow.netFlow)}
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">Monthly net</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Task & Productivity Reports */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Task & Productivity Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {taskCompletionRate.toFixed(1)}%
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-1" />
                <span className="text-sm text-emerald-600 font-medium">
                  {completedTasks.length}/{filteredTasks.length} tasks
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {averageTaskDuration.toFixed(1)} days
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600 font-medium">Per task</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900 dark:text-red-100">{overdueTasks.length}</div>
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">Need attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">
                Billable Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                {formatCurrency(billableVsNonBillable.billableRevenue)}
              </div>
              <div className="flex items-center mt-2">
                <DollarSign className="h-4 w-4 text-violet-600 mr-1" />
                <span className="text-sm text-violet-600 font-medium">
                  {billableVsNonBillable.billable} billable tasks
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Breakdown */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <span>Task Priority Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{tasksByPriority.high}</div>
                <div className="text-sm text-red-600 font-medium">High Priority</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{tasksByPriority.medium}</div>
                <div className="text-sm text-yellow-600 font-medium">Medium Priority</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{tasksByPriority.low}</div>
                <div className="text-sm text-green-600 font-medium">Low Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Client */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Tasks by Client</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksByClient.slice(0, 5).map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {client.completionRate.toFixed(1)}% completion rate
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{client.totalTasks} tasks</div>
                  <div className="text-sm text-gray-600">
                    {client.completed}C • {client.inProgress}P • {client.pending}P
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 4. Client Insights */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-amber-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Client Performance Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Repeat Business Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {repeatBusinessRate.toFixed(1)}%
              </div>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 text-amber-600 mr-1" />
                <span className="text-sm text-amber-600 font-medium">Client retention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{clients.length}</div>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">Total clients</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Task Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {avgTaskCompletionTimePerClient.length > 0
                  ? avgTaskCompletionTimePerClient.reduce((sum, c) => sum + c.avgCompletionTime, 0) /
                    avgTaskCompletionTimePerClient.length
                  : 0}{" "}
                days
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600 font-medium">Per client avg</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Top Client Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {topClientsByRevenue.length > 0 ? formatCurrency(topClientsByRevenue[0].earnings) : formatCurrency(0)}
              </div>
              <div className="flex items-center mt-2">
                <Award className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-sm text-purple-600 font-medium">
                  {topClientsByRevenue.length > 0 ? topClientsByRevenue[0].name : "No data"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Profitable Clients */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Top 5 Clients by Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topClientsByRevenue.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {client.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(client.earnings)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clients with Highest Payment Delays */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span>Clients with Highest Payment Delays</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientsWithHighestDelays.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average delay</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{client.averageDelay.toFixed(1)} days</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Revenue Trend Analysis
              </span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Last 6 Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EarningsChart />
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Table } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

export function ExportManager() {
  const { invoices, payments, clients, tasks } = useAppStore()
  const { toast } = useToast()
  const [exportType, setExportType] = useState("invoices")
  const [dateRange, setDateRange] = useState("current-month")

  const exportToPDF = (type: string) => {
    // Generate PDF based on type
    const data = getExportData(type)
    generatePDF(data, type)

    toast({
      title: "PDF Generated",
      description: `${type} report exported successfully`,
    })
  }

  const exportToCSV = (type: string) => {
    const data = getExportData(type)
    generateCSV(data, type)

    toast({
      title: "CSV Generated",
      description: `${type} data exported successfully`,
    })
  }

  const getExportData = (type: string) => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    switch (type) {
      case "invoices":
        return invoices.filter((invoice) => {
          if (dateRange === "current-month") {
            const invoiceDate = new Date(invoice.dueDate)
            return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
          }
          return true
        })
      case "payments":
        return payments.filter((payment) => {
          if (dateRange === "current-month") {
            const paymentDate = new Date(payment.date)
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
          }
          return true
        })
      case "clients":
        return clients
      case "tasks":
        return tasks
      case "revenue":
        return getRevenueReportData()
      case "task-status":
        return getTaskStatusReportData()
      case "invoice-aging":
        return getInvoiceAgingReportData()
      case "client-summary":
        return getClientSummaryReportData()
      default:
        return []
    }
  }

  const getRevenueReportData = () => {
    return clients
      .map((client) => {
        const clientPayments = payments.filter((p) => p.clientId === client.id)
        const clientInvoices = invoices.filter((i) => i.clientId === client.id)
        const totalRevenue = clientPayments.reduce((sum, p) => sum + p.amount, 0)
        const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.total, 0)
        const pendingAmount = clientInvoices
          .filter((i) => i.paymentStatus !== "paid")
          .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0)

        return {
          clientName: client.name,
          totalRevenue,
          totalInvoiced,
          pendingAmount,
          collectionRate: totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0,
        }
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }

  const getTaskStatusReportData = () => {
    return tasks
      .map((task) => {
        const client = clients.find((c) => c.id === task.clientId)
        const isOverdue = new Date(task.deadline) < new Date() && task.status !== "completed"

        return {
          taskTitle: task.title,
          clientName: client?.name || "Unknown",
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          price: task.price,
          isOverdue,
          daysOverdue: isOverdue
            ? Math.floor((new Date().getTime() - new Date(task.deadline).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        }
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }

  const getInvoiceAgingReportData = () => {
    return invoices
      .map((invoice) => {
        const client = clients.find((c) => c.id === invoice.clientId)
        const dueDate = new Date(invoice.dueDate)
        const today = new Date()
        const daysOverdue =
          invoice.paymentStatus !== "paid"
            ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        const agingCategory =
          daysOverdue <= 0
            ? "Current"
            : daysOverdue <= 30
              ? "1-30 days"
              : daysOverdue <= 60
                ? "31-60 days"
                : daysOverdue <= 90
                  ? "61-90 days"
                  : "90+ days"

        return {
          invoiceNumber: invoice.invoiceNumber,
          clientName: client?.name || "Unknown",
          total: invoice.total,
          paidAmount: invoice.paidAmount || 0,
          pendingAmount: invoice.total - (invoice.paidAmount || 0),
          dueDate: invoice.dueDate,
          paymentStatus: invoice.paymentStatus,
          daysOverdue: Math.max(0, daysOverdue),
          agingCategory,
        }
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }

  const getClientSummaryReportData = () => {
    return clients
      .map((client) => {
        const clientTasks = tasks.filter((t) => t.clientId === client.id)
        const clientInvoices = invoices.filter((i) => i.clientId === client.id)
        const clientPayments = payments.filter((p) => p.clientId === client.id)

        const completedTasks = clientTasks.filter((t) => t.status === "completed").length
        const totalRevenue = clientPayments.reduce((sum, p) => sum + p.amount, 0)
        const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.total, 0)
        const pendingAmount = clientInvoices
          .filter((i) => i.paymentStatus !== "paid")
          .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0)

        const avgPaymentDelay =
          clientInvoices.filter((i) => i.paymentStatus === "paid").length > 0
            ? clientInvoices
                .filter((i) => i.paymentStatus === "paid")
                .reduce((sum, inv) => {
                  const dueDate = new Date(inv.dueDate)
                  const paidDate = new Date() // Simplified
                  const delay = Math.max(0, (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                  return sum + delay
                }, 0) / clientInvoices.filter((i) => i.paymentStatus === "paid").length
            : 0

        return {
          clientName: client.name,
          email: client.email,
          phone: client.phone,
          totalTasks: clientTasks.length,
          completedTasks,
          completionRate: clientTasks.length > 0 ? (completedTasks / clientTasks.length) * 100 : 0,
          totalInvoices: clientInvoices.length,
          totalRevenue,
          totalInvoiced,
          pendingAmount,
          avgPaymentDelay: avgPaymentDelay.toFixed(1),
          lastTaskDate:
            clientTasks.length > 0
              ? clientTasks.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())[0].deadline
              : "N/A",
        }
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }

  const generatePDF = (data: any[], type: string) => {
    // Create PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>HustlePro ${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #8b5cf6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total { font-weight: bold; background-color: #e3f2fd; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HustlePro</div>
          <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        ${generateTableHTML(data, type)}
      </body>
      </html>
    `

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hustlepro-${type}-${new Date().toISOString().split("T")[0]}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateCSV = (data: any[], type: string) => {
    let csvContent = ""

    switch (type) {
      case "invoices":
        csvContent = "Invoice Number,Client,Amount,Due Date,Status,Payment Status\n"
        data.forEach((invoice) => {
          const client = clients.find((c) => c.id === invoice.clientId)
          csvContent += `${invoice.invoiceNumber},${client?.name || "Unknown"},${invoice.total},${invoice.dueDate},${invoice.status},${invoice.paymentStatus}\n`
        })
        break
      case "payments":
        csvContent = "Date,Client,Amount,Method,Status,Invoice\n"
        data.forEach((payment) => {
          const client = clients.find((c) => c.id === payment.clientId)
          const invoice = invoices.find((i) => i.id === payment.invoiceId)
          csvContent += `${payment.date},${client?.name || "Unknown"},${payment.amount},${payment.method},${payment.status},${invoice?.invoiceNumber || "N/A"}\n`
        })
        break
      case "clients":
        csvContent = "Name,Email,Phone,Address\n"
        data.forEach((client) => {
          csvContent += `${client.name},${client.email},${client.phone},"${client.address}"\n`
        })
        break
      case "tasks":
        csvContent = "Title,Client,Price,Deadline,Priority,Status\n"
        data.forEach((task) => {
          const client = clients.find((c) => c.id === task.clientId)
          csvContent += `${task.title},${client?.name || "Unknown"},${task.price},${task.deadline},${task.priority},${task.status}\n`
        })
        break
      case "revenue":
        csvContent = "Client,Total Revenue,Total Invoiced,Pending Amount,Collection Rate\n"
        data.forEach((item) => {
          csvContent += `${item.clientName},${item.totalRevenue},${item.totalInvoiced},${item.pendingAmount},${item.collectionRate.toFixed(1)}%\n`
        })
        break
      case "task-status":
        csvContent = "Task,Client,Status,Priority,Deadline,Price,Overdue,Days Overdue\n"
        data.forEach((item) => {
          csvContent += `${item.taskTitle},${item.clientName},${item.status},${item.priority},${item.deadline},${item.price},${item.isOverdue ? "Yes" : "No"},${item.daysOverdue}\n`
        })
        break
      case "invoice-aging":
        csvContent =
          "Invoice Number,Client,Total,Paid Amount,Pending Amount,Due Date,Status,Days Overdue,Aging Category\n"
        data.forEach((item) => {
          csvContent += `${item.invoiceNumber},${item.clientName},${item.total},${item.paidAmount},${item.pendingAmount},${item.dueDate},${item.paymentStatus},${item.daysOverdue},${item.agingCategory}\n`
        })
        break
      case "client-summary":
        csvContent =
          "Client,Email,Phone,Total Tasks,Completed Tasks,Completion Rate,Total Invoices,Total Revenue,Pending Amount,Avg Payment Delay,Last Task Date\n"
        data.forEach((item) => {
          csvContent += `${item.clientName},${item.email},${item.phone},${item.totalTasks},${item.completedTasks},${item.completionRate.toFixed(1)}%,${item.totalInvoices},${item.totalRevenue},${item.pendingAmount},${item.avgPaymentDelay},${item.lastTaskDate}\n`
        })
        break
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hustlepro-${type}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateTableHTML = (data: any[], type: string) => {
    switch (type) {
      case "invoices":
        return `
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map((invoice) => {
                  const client = clients.find((c) => c.id === invoice.clientId)
                  return `
                  <tr>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${client?.name || "Unknown"}</td>
                    <td>₹${invoice.total.toLocaleString()}</td>
                    <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td>${invoice.status}</td>
                    <td>${invoice.paymentStatus}</td>
                  </tr>
                `
                })
                .join("")}
              <tr class="total">
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>₹${data.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}</strong></td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
        `
      case "revenue":
        return `
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Total Revenue</th>
                <th>Total Invoiced</th>
                <th>Pending Amount</th>
                <th>Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (item) => `
                  <tr>
                    <td>${item.clientName}</td>
                    <td>₹${item.totalRevenue.toLocaleString()}</td>
                    <td>₹${item.totalInvoiced.toLocaleString()}</td>
                    <td>₹${item.pendingAmount.toLocaleString()}</td>
                    <td>${item.collectionRate.toFixed(1)}%</td>
                  </tr>
                `,
                )
                .join("")}
              <tr class="total">
                <td><strong>Total</strong></td>
                <td><strong>₹${data.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString()}</strong></td>
                <td><strong>₹${data.reduce((sum, item) => sum + item.totalInvoiced, 0).toLocaleString()}</strong></td>
                <td><strong>₹${data.reduce((sum, item) => sum + item.pendingAmount, 0).toLocaleString()}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `
      case "task-status":
        return `
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Client</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Price</th>
                <th>Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (item) => `
                  <tr>
                    <td>${item.taskTitle}</td>
                    <td>${item.clientName}</td>
                    <td>${item.status}</td>
                    <td>${item.priority}</td>
                    <td>${new Date(item.deadline).toLocaleDateString()}</td>
                    <td>₹${item.price.toLocaleString()}</td>
                    <td>${item.daysOverdue}</td>
                  </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>
        `
      case "invoice-aging":
        return `
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Total</th>
                <th>Pending Amount</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Aging Category</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (item) => `
                  <tr>
                    <td>${item.invoiceNumber}</td>
                    <td>${item.clientName}</td>
                    <td>₹${item.total.toLocaleString()}</td>
                    <td>₹${item.pendingAmount.toLocaleString()}</td>
                    <td>${new Date(item.dueDate).toLocaleDateString()}</td>
                    <td>${item.daysOverdue}</td>
                    <td>${item.agingCategory}</td>
                  </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>
        `
      case "client-summary":
        return `
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Total Tasks</th>
                <th>Completion Rate</th>
                <th>Total Revenue</th>
                <th>Pending Amount</th>
                <th>Avg Payment Delay</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (item) => `
                  <tr>
                    <td>${item.clientName}</td>
                    <td>${item.totalTasks}</td>
                    <td>${item.completionRate.toFixed(1)}%</td>
                    <td>₹${item.totalRevenue.toLocaleString()}</td>
                    <td>₹${item.pendingAmount.toLocaleString()}</td>
                    <td>${item.avgPaymentDelay} days</td>
                  </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>
        `
      default:
        return "<p>No data available for export</p>"
    }
  }

  const getExportStats = () => {
    const data = getExportData(exportType)
    switch (exportType) {
      case "invoices":
        return {
          count: data.length,
          total: data.reduce((sum: number, inv: any) => sum + inv.total, 0),
          label: "Total Amount",
        }
      case "payments":
        return {
          count: data.length,
          total: data.reduce((sum: number, pay: any) => sum + pay.amount, 0),
          label: "Total Received",
        }
      case "revenue":
        return {
          count: data.length,
          total: data.reduce((sum: number, item: any) => sum + item.totalRevenue, 0),
          label: "Total Revenue",
        }
      case "task-status":
        return {
          count: data.length,
          total: data.reduce((sum: number, item: any) => sum + item.price, 0),
          label: "Total Value",
        }
      case "invoice-aging":
        return {
          count: data.length,
          total: data.reduce((sum: number, item: any) => sum + item.pendingAmount, 0),
          label: "Pending Amount",
        }
      case "client-summary":
        return {
          count: data.length,
          total: data.reduce((sum: number, item: any) => sum + item.totalRevenue, 0),
          label: "Total Revenue",
        }
      default:
        return { count: data.length, total: 0, label: "Items" }
    }
  }

  const stats = getExportStats()

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="mr-2 h-5 w-5" />
          Export Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Type</label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="revenue">Revenue Report</SelectItem>
                <SelectItem value="task-status">Task Status Report</SelectItem>
                <SelectItem value="invoice-aging">Invoice Aging Report</SelectItem>
                <SelectItem value="client-summary">Client Summary Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Ready to Export</p>
              <p className="font-bold text-blue-800 dark:text-blue-200">
                {stats.count} {exportType}
              </p>
            </div>
            {stats.total > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-600 dark:text-blue-400">{stats.label}</p>
                <p className="font-bold text-blue-800 dark:text-blue-200">{formatCurrency(stats.total)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => exportToPDF(exportType)}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>

          <Button
            onClick={() => exportToCSV(exportType)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
          >
            <Table className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• PDF exports include formatted reports with your branding</p>
          <p>• CSV exports are compatible with Excel and Google Sheets</p>
          <p>• All exports include data based on selected date range</p>
          <p>• New report types: Revenue, Task Status, Invoice Aging, Client Summary</p>
        </div>
      </CardContent>
    </Card>
  )
}

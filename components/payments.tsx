"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  Info,
  MessageCircle,
  Mail,
  Bell,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { PaymentModal } from "@/components/payment-modal"
import { formatCurrency } from "@/lib/utils"
import { ClientLogo } from "@/components/client-logo"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

export function Payments() {
  const { payments, clients, invoices, deletePayment, sendPaymentReminderForPayment, updatePayment } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterMethod, setFilterMethod] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const { toast } = useToast()

  const filteredPayments = payments.filter((payment) => {
    const client = clients.find((c) => c.id === payment.clientId)
    const invoice = invoices.find((i) => i.id === payment.invoiceId)
    const matchesSearch =
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount.toString().includes(searchTerm)
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus
    const matchesMethod = filterMethod === "all" || payment.method === filterMethod
    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleEdit = (payment: any) => {
    setEditingPayment(payment)
    setIsModalOpen(true)
  }

  const handleDelete = (paymentId: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      deletePayment(paymentId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPayment(null)
  }

  const handleToggleStatus = (payment: any) => {
    const newStatus = payment.status === "completed" ? "pending" : "completed"
    updatePayment(payment.id, { ...payment, status: newStatus })
    toast({
      title: "Payment Status Updated",
      description: `Payment marked as ${newStatus}`,
    })
  }

  const handleSendReminder = (paymentId: string, method: "whatsapp" | "email") => {
    const payment = payments.find((p) => p.id === paymentId)
    const client = clients.find((c) => c.id === payment?.clientId)
    const invoice = invoices.find((i) => i.id === payment?.invoiceId)

    if (!payment || !client) return

    const generatePaymentReminderText = () => {
      return `Hi ${client.name},

This is a friendly reminder about your pending payment.

Payment Details:
Amount: ${formatCurrency(payment.amount)}
Invoice: ${invoice?.invoiceNumber || "N/A"}
Due Date: ${new Date(payment.date).toLocaleDateString()}
Payment Method: ${payment.method.toUpperCase()}

Please complete your payment at your earliest convenience.

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
      const subject = encodeURIComponent(`Payment Reminder - ${formatCurrency(payment.amount)}`)
      const body = encodeURIComponent(reminderText)
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${client.email || ""}&su=${subject}&body=${body}`
      window.open(gmailUrl, "_blank")
    }

    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent via ${method}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "failed":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "upi":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
      case "bank":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "cash":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "card":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const needsReminder = (payment: any) => {
    return payment.status === "pending" || payment.status === "failed"
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text">Payments</h1>
          <Button onClick={() => setIsModalOpen(true)} className="btn-primary animate-button-press">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-2"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 glass-card border-2">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-48 glass-card border-2">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Group payments by client */}
        {(() => {
          const paymentsByClient = filteredPayments.reduce(
            (acc, payment) => {
              const client = clients.find((c) => c.id === payment.clientId)
              const clientName = client?.name || "Unknown Client"
              if (!acc[clientName]) {
                acc[clientName] = { client, payments: [] }
              }
              acc[clientName].payments.push(payment)
              return acc
            },
            {} as Record<string, { client: any; payments: any[] }>,
          )

          return Object.entries(paymentsByClient).map(([clientName, { client, payments: clientPayments }]) => (
            <div key={clientName} className="space-y-4">
              {/* Client Header */}
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <ClientLogo client={client || { name: clientName }} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-card-foreground">{clientName}</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => {
                            const clientsSection = document.querySelector('[data-section="clients"]')
                            if (clientsSection) {
                              clientsSection.scrollIntoView({ behavior: "smooth" })
                            } else {
                              window.location.hash = "clients"
                            }
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View client details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {clientPayments.length} payment{clientPayments.length !== 1 ? "s" : ""} • Total:{" "}
                    {formatCurrency(clientPayments.reduce((sum, payment) => sum + payment.amount, 0))}
                  </p>
                </div>
                <div className="ml-auto flex space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {clientPayments.filter((p) => p.status === "completed").length} Completed
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {clientPayments.filter((p) => p.status === "pending").length} Pending
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {clientPayments.filter((p) => p.status === "failed").length} Failed
                  </Badge>
                </div>
              </div>

              {/* Payments Grid for this client */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                {clientPayments.map((payment) => {
                  const invoice = invoices.find((i) => i.id === payment.invoiceId)
                  const showReminder = needsReminder(payment)

                  return (
                    <Card
                      key={payment.id}
                      className={`glass-card border-2 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up h-[300px] flex flex-col ${
                        showReminder ? "ring-2 ring-orange-300 animate-pulse" : "border-primary/20"
                      }`}
                    >
                      <CardHeader className="pb-3 flex-shrink-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-bold text-card-foreground truncate">
                              {formatCurrency(payment.amount)}
                            </CardTitle>
                            {invoice && (
                              <p className="text-sm text-muted-foreground truncate">{invoice.invoiceNumber}</p>
                            )}
                          </div>
                          <div className="flex space-x-1 flex-shrink-0 ml-2">
                            {showReminder && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-colors"
                                      onClick={() => handleSendReminder(payment.id, "whatsapp")}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Send WhatsApp reminder</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                      onClick={() => handleSendReminder(payment.id, "email")}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Send email reminder</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleStatus(payment)}
                                  className={`h-8 w-8 p-0 transition-colors ${
                                    payment.status === "completed"
                                      ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20"
                                      : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                  }`}
                                >
                                  {payment.status === "completed" ? (
                                    <Clock className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{payment.status === "completed" ? "Mark as pending" : "Mark as received"}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(payment)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit payment</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(payment.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete payment</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1 flex flex-col">
                        <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{new Date(payment.date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                          <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="capitalize">{payment.method}</span>
                        </div>

                        {/* Fixed position badges */}
                        <div className="flex items-center justify-between pt-2 mt-auto">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getMethodColor(payment.method)}>
                            {payment.method.toUpperCase()}
                          </Badge>
                        </div>

                        {showReminder && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md flex-shrink-0">
                            <div className="flex items-center text-xs text-orange-700">
                              <Bell className="mr-1 h-3 w-3" />
                              <span>Reminder needed</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        })()}

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No payments found</div>
            <Button onClick={() => setIsModalOpen(true)} className="btn-primary animate-button-press">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Payment
            </Button>
          </div>
        )}

        <PaymentModal isOpen={isModalOpen} onClose={handleCloseModal} payment={editingPayment} />
      </div>
    </TooltipProvider>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, IndianRupee, FileText, Share2, Edit, Trash2, Info } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { InvoiceModal } from "@/components/invoice-modal"
import { formatCurrency } from "@/lib/utils"
import { PDFModal } from "@/components/pdf-modal"
import { UpiShareModal } from "@/components/upi-share-modal"
import { ClientLogo } from "@/components/client-logo"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Invoices() {
  const { invoices, clients, deleteInvoice } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfInvoice, setPdfInvoice] = useState(null)

  const filteredInvoices = invoices.filter((invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId)
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleDelete = (invoiceId: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(invoiceId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const handleShare = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShareModalOpen(true)
  }

  const handleViewPDF = (invoice: any) => {
    setPdfInvoice(invoice)
    setPdfModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "sent":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== "paid"
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text">Invoices</h1>
          <Button onClick={() => setIsModalOpen(true)} className="btn-primary animate-button-press">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invoices..."
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
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Group invoices by client */}
        {(() => {
          const invoicesByClient = filteredInvoices.reduce(
            (acc, invoice) => {
              const client = clients.find((c) => c.id === invoice.clientId)
              const clientName = client?.name || "Unknown Client"
              if (!acc[clientName]) {
                acc[clientName] = { client, invoices: [] }
              }
              acc[clientName].invoices.push(invoice)
              return acc
            },
            {} as Record<string, { client: any; invoices: any[] }>,
          )

          return Object.entries(invoicesByClient).map(([clientName, { client, invoices: clientInvoices }]) => (
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
                    {clientInvoices.length} invoice{clientInvoices.length !== 1 ? "s" : ""} • Total:{" "}
                    {formatCurrency(clientInvoices.reduce((sum, inv) => sum + inv.total, 0))}
                  </p>
                </div>
                <div className="ml-auto flex space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {clientInvoices.filter((i) => i.status === "paid").length} Paid
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {clientInvoices.filter((i) => i.status === "sent").length} Sent
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    {clientInvoices.filter((i) => i.status === "draft").length} Draft
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {clientInvoices.filter((i) => isOverdue(i.dueDate, i.status)).length} Overdue
                  </Badge>
                </div>
              </div>

              {/* Invoices Grid for this client */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                {clientInvoices.map((invoice) => {
                  const overdue = isOverdue(invoice.dueDate, invoice.status)

                  return (
                    <Card
                      key={invoice.id}
                      className={`glass-card border-2 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up h-[280px] flex flex-col ${
                        overdue ? "animate-pulse-glow border-red-300" : "border-primary/20"
                      }`}
                    >
                      <CardHeader className="pb-3 flex-shrink-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-bold text-card-foreground truncate">
                              {invoice.invoiceNumber}
                            </CardTitle>
                          </div>
                          <div className="flex space-x-1 flex-shrink-0 ml-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                  onClick={() => handleShare(invoice)}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Share invoice</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(invoice)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit invoice</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(invoice.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1 flex flex-col">
                        <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            {overdue && <span className="text-red-500 ml-2 font-medium">(Overdue)</span>}
                          </span>
                        </div>

                        <div className="flex items-center text-sm flex-shrink-0">
                          <IndianRupee className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span className="font-bold text-xl gradient-text">{formatCurrency(invoice.total)}</span>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                          <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>{invoice.items.length} item(s)</span>
                        </div>

                        {/* Fixed position badges and button */}
                        <div className="flex items-center justify-between pt-2 mt-auto">
                          <Badge className={getStatusColor(overdue ? "overdue" : invoice.status)}>
                            {overdue ? "Overdue" : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 animate-button-press bg-transparent"
                            onClick={() => handleViewPDF(invoice)}
                          >
                            View PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        })()}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No invoices found</div>
            <Button onClick={() => setIsModalOpen(true)} className="btn-primary animate-button-press">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Invoice
            </Button>
          </div>
        )}

        <InvoiceModal isOpen={isModalOpen} onClose={handleCloseModal} invoice={editingInvoice} />
        <UpiShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} invoice={selectedInvoice} />
        <PDFModal isOpen={pdfModalOpen} onClose={() => setPdfModalOpen(false)} invoice={pdfInvoice} />
      </div>
    </TooltipProvider>
  )
}

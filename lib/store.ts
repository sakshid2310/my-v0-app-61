"use client"

import { create } from "zustand"

interface ClientDocument {
  id: string
  clientId: string
  title: string
  type: "contract" | "project-notes" | "proposal" | "invoice" | "other"
  content: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

interface TaskDocument {
  id: string
  taskId: string
  title: string
  type: "project-notes" | "documentation"
  content: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status?: "active" | "inactive"
  logo?: string
  documents?: ClientDocument[]
}

interface Task {
  id: string
  title: string
  description: string
  clientId: string
  deadline: string
  price: number
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  documents?: TaskDocument[]
}

interface InvoiceItem {
  taskId?: string
  description: string
  amount: number
}

interface Invoice {
  id: string
  clientId: string
  invoiceNumber: string
  dueDate: string
  status: "draft" | "sent" | "paid"
  items: InvoiceItem[]
  subtotal: number
  gst: number
  total: number
  paymentStatus?: "pending" | "partially-paid" | "paid"
  paidAmount?: number
  paymentLink?: string
  lastReminderSent?: string
}

interface Payment {
  id: string
  clientId: string
  invoiceId?: string
  amount: number
  date: string
  method: "cash" | "bank" | "upi" | "card"
  status?: "pending" | "completed" | "failed"
}

interface Notification {
  id: string
  type: "payment_received" | "invoice_sent" | "task_completed" | "reminder"
  title: string
  message: string
  timestamp: string
  read: boolean
  clientId?: string
  invoiceId?: string
}

interface AppState {
  clients: Client[]
  tasks: Task[]
  invoices: Invoice[]
  payments: Payment[]
  notifications: Notification[]
  currentUser: string
  isOffline: boolean

  // Client actions - now just update local state for UI demo
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Task actions
  addTask: (task: Omit<Task, "id">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, "id">) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  generatePaymentLink: (invoiceId: string) => string

  // Payment actions
  addPayment: (payment: Omit<Payment, "id">) => void
  updatePayment: (id: string, payment: Partial<Payment>) => void
  deletePayment: (id: string) => void

  // Notification actions
  addNotification: (notification: Omit<Notification, "id">) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void

  // Reminder actions - now just show mock behavior
  sendPaymentReminder: (invoiceId: string, method: "whatsapp" | "email") => void
  sendPaymentReminderForPayment: (paymentId: string, method: "whatsapp" | "email") => void
  sendPaymentReminderForInvoice: (invoiceId: string, method: "whatsapp" | "email") => void

  // Offline actions
  setOfflineStatus: (status: boolean) => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

// Generate invoice number in format INC-YYYY-NNNN
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 9999) + 1
  return `INC-${year}-${randomNum.toString().padStart(4, "0")}`
}

const mockClients: Client[] = [
  {
    id: "client1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+91 9876543210",
    address: "123 Business District, Mumbai, Maharashtra",
    status: "active",
    logo: "/acme-corporation-logo.png",
    documents: [
      {
        id: "doc1",
        clientId: "client1",
        title: "Website Redesign Contract",
        type: "contract",
        content: "This contract outlines the terms and conditions for the complete website redesign project...",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "client2",
    name: "TechStart Solutions",
    email: "hello@techstart.com",
    phone: "+91 9876543211",
    address: "456 Innovation Hub, Bangalore, Karnataka",
    status: "active",
    logo: "/placeholder-cjr3c.png",
    documents: [],
  },
  {
    id: "client3",
    name: "Creative Agency",
    email: "info@creative.com",
    phone: "+91 9876543212",
    address: "789 Design Street, Delhi, India",
    status: "active",
    logo: "/creative-agency-logo.png",
    documents: [],
  },
]

const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Website Redesign",
    description: "Complete website redesign with modern UI/UX",
    clientId: "client1",
    deadline: "2024-02-15",
    price: 50000,
    priority: "high",
    status: "in-progress",
    documents: [],
  },
  {
    id: "task2",
    title: "Mobile App Development",
    description: "Develop iOS and Android mobile application",
    clientId: "client2",
    deadline: "2024-03-01",
    price: 75000,
    priority: "high",
    status: "pending",
    documents: [],
  },
  {
    id: "task3",
    title: "Logo Design",
    description: "Create brand identity and logo design",
    clientId: "client3",
    deadline: "2024-01-30",
    price: 15000,
    priority: "medium",
    status: "completed",
    documents: [],
  },
]

const mockInvoices: Invoice[] = [
  {
    id: "invoice1",
    clientId: "client1",
    invoiceNumber: "INC-2024-0001",
    dueDate: "2024-02-01",
    status: "sent",
    items: [{ taskId: "task1", description: "Website Redesign", amount: 50000 }],
    subtotal: 50000,
    gst: 9000,
    total: 59000,
    paymentStatus: "pending",
    paidAmount: 0,
  },
  {
    id: "invoice2",
    clientId: "client3",
    invoiceNumber: "INC-2024-0002",
    dueDate: "2024-01-25",
    status: "paid",
    items: [{ taskId: "task3", description: "Logo Design", amount: 15000 }],
    subtotal: 15000,
    gst: 2700,
    total: 17700,
    paymentStatus: "paid",
    paidAmount: 17700,
  },
]

const mockPayments: Payment[] = [
  {
    id: "payment1",
    clientId: "client3",
    invoiceId: "invoice2",
    amount: 17700,
    date: "2024-01-20",
    method: "upi",
    status: "completed",
  },
]

const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "payment_received",
    title: "Payment Received",
    message: "Payment of ₹17,700 received from Creative Agency",
    timestamp: new Date().toISOString(),
    read: false,
    clientId: "client3",
    invoiceId: "invoice2",
  },
]

export const useAppStore = create<AppState>((set, get) => ({
  clients: mockClients,
  tasks: mockTasks,
  invoices: mockInvoices,
  payments: mockPayments,
  notifications: mockNotifications,
  currentUser: "Demo User",
  isOffline: false,

  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, { ...client, id: generateId(), documents: [] }],
    })),

  updateClient: (id, client) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...client } : c)),
    })),

  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: generateId(), documents: [] }],
    })),

  updateTask: (id, task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  addInvoice: (invoice) => {
    const newInvoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber: invoice.invoiceNumber || generateInvoiceNumber(),
      paymentStatus: "pending" as const,
      paidAmount: 0,
    }

    set((state) => ({
      invoices: [...state.invoices, newInvoice],
    }))

    // Generate mock payment link
    get().generatePaymentLink(newInvoice.id)
  },

  updateInvoice: (id, invoice) =>
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...invoice } : i)),
    })),

  deleteInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== id),
    })),

  generatePaymentLink: (invoiceId: string) => {
    const invoice = get().invoices.find((i) => i.id === invoiceId)
    if (!invoice) return ""

    const mockUpiLink = `upi://pay?pa=demo@paytm&pn=HustlePro&am=${invoice.total}&cu=INR&tn=Invoice%20${invoice.invoiceNumber}`

    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === invoiceId ? { ...i, paymentLink: mockUpiLink } : i)),
    }))

    return mockUpiLink
  },

  addPayment: (payment) => {
    const newPayment = { ...payment, id: generateId() }

    set((state) => {
      const updatedInvoices = state.invoices.map((invoice) => {
        if (invoice.id === payment.invoiceId) {
          const newPaidAmount = (invoice.paidAmount || 0) + payment.amount
          const paymentStatus =
            newPaidAmount >= invoice.total ? "paid" : newPaidAmount > 0 ? "partially-paid" : "pending"

          return {
            ...invoice,
            paidAmount: newPaidAmount,
            paymentStatus,
            status: paymentStatus === "paid" ? "paid" : invoice.status,
          }
        }
        return invoice
      })

      return {
        payments: [...state.payments, newPayment],
        invoices: updatedInvoices,
      }
    })

    // Add mock notification
    get().addNotification({
      type: "payment_received",
      title: "Payment Received",
      message: `Payment of ₹${payment.amount} received`,
      timestamp: new Date().toISOString(),
      read: false,
      clientId: payment.clientId,
      invoiceId: payment.invoiceId,
    })
  },

  updatePayment: (id, payment) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...payment } : p)),
    })),

  deletePayment: (id) =>
    set((state) => ({
      payments: state.payments.filter((p) => p.id !== id),
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [{ ...notification, id: generateId() }, ...state.notifications],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearNotifications: () => set({ notifications: [] }),

  sendPaymentReminder: (invoiceId: string, method: "whatsapp" | "email") => {
    const { invoices, clients } = get()
    const invoice = invoices.find((i) => i.id === invoiceId)
    const client = clients.find((c) => c.id === invoice?.clientId)

    if (!invoice || !client) return

    // Mock reminder - just show alert in demo
    alert(`Demo: Payment reminder would be sent to ${client.name} via ${method}`)

    // Add mock notification
    get().addNotification({
      type: "reminder",
      title: "Reminder Sent",
      message: `Payment reminder sent to ${client.name} via ${method}`,
      timestamp: new Date().toISOString(),
      read: false,
      clientId: client.id,
      invoiceId,
    })
  },

  sendPaymentReminderForPayment: (paymentId: string, method: "whatsapp" | "email") => {
    const { payments, clients } = get()
    const payment = payments.find((p) => p.id === paymentId)
    const client = clients.find((c) => c.id === payment?.clientId)

    if (!payment || !client) return

    // Mock reminder - just show alert in demo
    alert(`Demo: Payment reminder would be sent to ${client.name} via ${method}`)
  },

  sendPaymentReminderForInvoice: (invoiceId: string, method: "whatsapp" | "email") => {
    get().sendPaymentReminder(invoiceId, method)
  },

  setOfflineStatus: (status) => set({ isOffline: status }),
}))

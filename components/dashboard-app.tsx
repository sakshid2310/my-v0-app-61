"use client"

import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { Clients } from "@/components/clients"
import { Tasks } from "@/components/tasks"
import { Invoices } from "@/components/invoices"
import { Payments } from "@/components/payments"
import { Analytics } from "@/components/analytics"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { ClientModal } from "@/components/client-modal"
import { TaskModal } from "@/components/task-modal"
import { InvoiceModal } from "@/components/invoice-modal"
import { PaymentModal } from "@/components/payment-modal"
import { useMobile } from "@/hooks/use-mobile"
import { AuthProvider } from "@/components/auth/auth-provider"

export function DashboardApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const isMobile = useMobile()

  const handleNavigateToPayments = () => {
    setActiveTab("payments")
  }

  const handleNavigateToTasks = () => {
    setActiveTab("tasks")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigateToPayments={handleNavigateToPayments} onNavigateToTasks={handleNavigateToTasks} />
      case "clients":
        return <Clients />
      case "tasks":
        return <Tasks />
      case "invoices":
        return <Invoices />
      case "payments":
        return <Payments />
      case "analytics":
        return <Analytics />
      default:
        return <Dashboard onNavigateToPayments={handleNavigateToPayments} onNavigateToTasks={handleNavigateToTasks} />
    }
  }

  return (
    <AuthProvider>
      <div className="flex h-screen bg-background">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenClientModal={() => setIsClientModalOpen(true)}
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className={`flex-1 flex flex-col ${isMobile ? "" : "ml-64"}`}>
          {isMobile && (
            <MobileHeader
              activeTab={activeTab}
              onMenuClick={() => setIsSidebarOpen(true)}
              onOpenClientModal={() => setIsClientModalOpen(true)}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
              onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
            />
          )}

          <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
        </div>

        <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
        <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
        <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
        <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
      </div>
    </AuthProvider>
  )
}

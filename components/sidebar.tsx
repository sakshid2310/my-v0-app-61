"use client"

import { Home, Users, CheckSquare, FileText, CreditCard, Plus, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/components/user-profile"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onOpenClientModal: () => void
  onOpenTaskModal: () => void
  onOpenInvoiceModal: () => void
  onOpenPaymentModal: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: Home },
  { id: "clients", name: "Clients", icon: Users },
  { id: "tasks", name: "Tasks", icon: CheckSquare },
  { id: "invoices", name: "Invoices", icon: FileText },
  { id: "payments", name: "Payments", icon: CreditCard },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
]

export function Sidebar({
  activeTab,
  setActiveTab,
  onOpenClientModal,
  onOpenTaskModal,
  onOpenInvoiceModal,
  onOpenPaymentModal,
  isMobile = false,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const sidebarClasses = cn(
    "h-full w-64 glass-card border-r border-white/20 dark:border-gray-700 p-6 transition-transform duration-300 flex flex-col",
    isMobile
      ? isOpen
        ? "fixed left-0 top-0 z-50 transform translate-x-0"
        : "fixed left-0 top-0 z-50 transform -translate-x-full"
      : "fixed left-0 top-0",
  )

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={sidebarClasses}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">HustlePro</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your hustle</p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left animate-button-press",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "hover:bg-white/50 dark:hover:bg-gray-800/50",
                )}
                onClick={() => {
                  setActiveTab(item.id)
                  if (isMobile && onClose) onClose()
                }}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            )
          })}
        </nav>

        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white animate-button-press flex items-center justify-start"
              onClick={() => {
                onOpenClientModal()
                if (isMobile && onClose) onClose()
              }}
            >
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Add Client</span>
            </Button>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-button-press flex items-center justify-start"
              onClick={() => {
                onOpenTaskModal()
                if (isMobile && onClose) onClose()
              }}
            >
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Add Task</span>
            </Button>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white animate-button-press flex items-center justify-start"
              onClick={() => {
                onOpenInvoiceModal()
                if (isMobile && onClose) onClose()
              }}
            >
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Create Invoice</span>
            </Button>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-button-press flex items-center justify-start"
              onClick={() => {
                onOpenPaymentModal()
                if (isMobile && onClose) onClose()
              }}
            >
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Add Payment</span>
            </Button>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <UserProfile onClose={isMobile ? onClose : undefined} />
        </div>
      </div>
    </>
  )
}

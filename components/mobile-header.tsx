"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Bell, Wifi, WifiOff } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface MobileHeaderProps {
  activeTab: string
  onMenuClick: () => void
  onOpenClientModal: () => void
  onOpenTaskModal: () => void
  onOpenInvoiceModal: () => void
}

export function MobileHeader({
  activeTab,
  onMenuClick,
  onOpenClientModal,
  onOpenTaskModal,
  onOpenInvoiceModal,
}: MobileHeaderProps) {
  const { notifications, isOffline } = useAppStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard"
      case "clients":
        return "Clients"
      case "tasks":
        return "Tasks"
      case "invoices":
        return "Invoices"
      case "payments":
        return "Payments"
      case "analytics":
        return "Analytics"
      default:
        return "HustlePro"
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-card border-b border-white/20 dark:border-gray-700 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold gradient-text">{getTabTitle(activeTab)}</h1>
      </div>

      <div className="flex items-center space-x-2">
        {isOffline && (
          <div className="flex items-center text-red-500">
            <WifiOff className="h-4 w-4 mr-1" />
            <span className="text-xs">Offline</span>
          </div>
        )}

        {!isOffline && <Wifi className="h-4 w-4 text-green-500" />}

        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  )
}

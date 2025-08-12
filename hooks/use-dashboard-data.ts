"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

interface DashboardData {
  clients: any[]
  tasks: any[]
  invoices: any[]
  payments: any[]
  notifications: any[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth()
  const [data, setData] = useState({
    clients: [],
    tasks: [],
    invoices: [],
    payments: [],
    notifications: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [clientsRes, tasksRes, invoicesRes, paymentsRes, notificationsRes] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      // Check for errors
      if (clientsRes.error) throw clientsRes.error
      if (tasksRes.error) throw tasksRes.error
      if (invoicesRes.error) throw invoicesRes.error
      if (paymentsRes.error) throw paymentsRes.error
      if (notificationsRes.error) throw notificationsRes.error

      setData({
        clients: clientsRes.data || [],
        tasks: tasksRes.data || [],
        invoices: invoicesRes.data || [],
        payments: paymentsRes.data || [],
        notifications: notificationsRes.data || [],
      })
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  return {
    ...data,
    loading,
    error,
    refetch: fetchData,
  }
}

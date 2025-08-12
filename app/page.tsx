import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardApp } from "@/components/dashboard-app"

export default async function Home() {
  const supabase = createClient()

  if (!supabase) {
    redirect("/landing")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/landing")
  }

  return <DashboardApp />
}

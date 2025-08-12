"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(prevState: any, formData: FormData) {
  const userId = formData.get("userId") as string
  const fullName = formData.get("fullName") as string
  const occupation = formData.get("occupation") as string
  const phoneNumber = formData.get("phoneNumber") as string

  if (!userId || !fullName) {
    return { error: "User ID and full name are required" }
  }

  const supabase = createClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        occupation: occupation || null,
        phone_number: phoneNumber || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Profile update error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Profile updated successfully!" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

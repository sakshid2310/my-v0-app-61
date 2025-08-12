"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const fullName = formData.get("fullName") as string
  const occupation = formData.get("occupation") as string
  const phoneNumber = formData.get("phoneNumber") as string

  if (!email || !password || !fullName) {
    return { error: "Email, password, and full name are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  const supabase = createClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: fullName,
        occupation,
        phone_number: phoneNumber,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      email,
      occupation,
      phone_number: phoneNumber,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Don't return error here as the user was created successfully
    }
  }

  return { success: "Check your email to confirm your account." }
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) return

  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/landing")
}

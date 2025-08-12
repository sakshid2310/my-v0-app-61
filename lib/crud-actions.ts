"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Client CRUD Operations
export async function createClient(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const company = formData.get("company") as string

  if (!name || !email) {
    return { error: "Name and email are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("clients").insert({
      name,
      email,
      phone: phone || null,
      address: address || null,
      company: company || null,
      user_id: user.id,
    })

    if (error) {
      console.error("Client creation error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Client created successfully!" }
  } catch (error) {
    console.error("Client creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateClient(prevState: any, formData: FormData) {
  const clientId = formData.get("clientId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const company = formData.get("company") as string

  if (!clientId || !name || !email) {
    return { error: "Client ID, name and email are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("clients")
      .update({
        name,
        email,
        phone: phone || null,
        address: address || null,
        company: company || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Client update error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Client updated successfully!" }
  } catch (error) {
    console.error("Client update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteClient(clientId: string) {
  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id)

    if (error) {
      console.error("Client deletion error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Client deleted successfully!" }
  } catch (error) {
    console.error("Client deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Task CRUD Operations
export async function createTask(prevState: any, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const clientId = formData.get("clientId") as string
  const dueDate = formData.get("dueDate") as string
  const priority = formData.get("priority") as string
  const status = formData.get("status") as string

  if (!title || !clientId || !dueDate) {
    return { error: "Title, client, and due date are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("tasks").insert({
      title,
      description: description || null,
      client_id: clientId,
      due_date: dueDate,
      priority: priority || "medium",
      status: status || "pending",
      user_id: user.id,
    })

    if (error) {
      console.error("Task creation error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Task created successfully!" }
  } catch (error) {
    console.error("Task creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateTask(prevState: any, formData: FormData) {
  const taskId = formData.get("taskId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const clientId = formData.get("clientId") as string
  const dueDate = formData.get("dueDate") as string
  const priority = formData.get("priority") as string
  const status = formData.get("status") as string

  if (!taskId || !title || !clientId || !dueDate) {
    return { error: "Task ID, title, client, and due date are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        description: description || null,
        client_id: clientId,
        due_date: dueDate,
        priority: priority || "medium",
        status: status || "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Task update error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Task updated successfully!" }
  } catch (error) {
    console.error("Task update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteTask(taskId: string) {
  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id)

    if (error) {
      console.error("Task deletion error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Task deleted successfully!" }
  } catch (error) {
    console.error("Task deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Invoice CRUD Operations
export async function createInvoice(prevState: any, formData: FormData) {
  const clientId = formData.get("clientId") as string
  const dueDate = formData.get("dueDate") as string
  const status = formData.get("status") as string
  const subtotal = Number.parseFloat(formData.get("subtotal") as string) || 0
  const taxRate = Number.parseFloat(formData.get("taxRate") as string) || 0.18
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount
  const notes = formData.get("notes") as string

  if (!clientId || !dueDate) {
    return { error: "Client and due date are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    // Generate invoice number
    const year = new Date().getFullYear()
    const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user.id)

    const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(4, "0")}`

    const { error } = await supabase.from("invoices").insert({
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: dueDate,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      status: status || "draft",
      notes: notes || null,
      user_id: user.id,
    })

    if (error) {
      console.error("Invoice creation error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Invoice created successfully!" }
  } catch (error) {
    console.error("Invoice creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateInvoice(prevState: any, formData: FormData) {
  const invoiceId = formData.get("invoiceId") as string
  const clientId = formData.get("clientId") as string
  const dueDate = formData.get("dueDate") as string
  const status = formData.get("status") as string
  const subtotal = Number.parseFloat(formData.get("subtotal") as string) || 0
  const taxRate = Number.parseFloat(formData.get("taxRate") as string) || 0.18
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount
  const notes = formData.get("notes") as string

  if (!invoiceId || !clientId || !dueDate) {
    return { error: "Invoice ID, client, and due date are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("invoices")
      .update({
        client_id: clientId,
        due_date: dueDate,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        status: status || "draft",
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Invoice update error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Invoice updated successfully!" }
  } catch (error) {
    console.error("Invoice update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("invoices").delete().eq("id", invoiceId).eq("user_id", user.id)

    if (error) {
      console.error("Invoice deletion error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Invoice deleted successfully!" }
  } catch (error) {
    console.error("Invoice deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Payment CRUD Operations
export async function createPayment(prevState: any, formData: FormData) {
  const clientId = formData.get("clientId") as string
  const invoiceId = formData.get("invoiceId") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentDate = formData.get("paymentDate") as string
  const paymentMethod = formData.get("paymentMethod") as string
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string
  const referenceNumber = formData.get("referenceNumber") as string

  if (!clientId || !amount || !paymentDate) {
    return { error: "Client, amount, and payment date are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("payments").insert({
      client_id: clientId,
      invoice_id: invoiceId || null,
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod || "upi",
      status: status || "completed",
      notes: notes || null,
      reference_number: referenceNumber || null,
      user_id: user.id,
    })

    if (error) {
      console.error("Payment creation error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Payment recorded successfully!" }
  } catch (error) {
    console.error("Payment creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updatePayment(prevState: any, formData: FormData) {
  const paymentId = formData.get("paymentId") as string
  const clientId = formData.get("clientId") as string
  const invoiceId = formData.get("invoiceId") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentDate = formData.get("paymentDate") as string
  const paymentMethod = formData.get("paymentMethod") as string
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string
  const referenceNumber = formData.get("referenceNumber") as string

  if (!paymentId || !clientId || !amount || !paymentDate) {
    return { error: "Payment ID, client, amount, and payment date are required" }
  }

  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("payments")
      .update({
        client_id: clientId,
        invoice_id: invoiceId || null,
        amount,
        payment_date: paymentDate,
        payment_method: paymentMethod || "upi",
        status: status || "completed",
        notes: notes || null,
        reference_number: referenceNumber || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Payment update error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Payment updated successfully!" }
  } catch (error) {
    console.error("Payment update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deletePayment(paymentId: string) {
  const supabase = createSupabaseClient()
  if (!supabase) {
    return { error: "Supabase not configured" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const { error } = await supabase.from("payments").delete().eq("id", paymentId).eq("user_id", user.id)

    if (error) {
      console.error("Payment deletion error:", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: "Payment deleted successfully!" }
  } catch (error) {
    console.error("Payment deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera, CheckCircle, User, Mail, Phone, Briefcase } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { updateProfile } from "@/lib/profile-actions"

interface Profile {
  id: string
  full_name: string
  email: string
  occupation?: string
  phone_number?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Update Profile"
      )}
    </Button>
  )
}

export function ProfileSettingsModal({ isOpen, onClose, profile }: ProfileSettingsModalProps) {
  const { refreshProfile } = useAuth()
  const [state, formAction] = useActionState(updateProfile, null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSuccess = async () => {
    if (state?.success) {
      await refreshProfile()
      onClose()
    }
  }

  // Handle success state
  if (state?.success) {
    setTimeout(handleSuccess, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center gradient-text">Profile Settings</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userId" value={profile.id} />

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {state.success}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white/50">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-lg"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click the camera icon to update your profile picture
            </p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={profile.full_name}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profile.email}
                required
                className="h-11"
                disabled
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed from here</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation" className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Occupation
              </Label>
              <Input
                id="occupation"
                name="occupation"
                type="text"
                defaultValue={profile.occupation || ""}
                placeholder="e.g., Freelance Designer"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                defaultValue={profile.phone_number || ""}
                placeholder="+1 (555) 123-4567"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

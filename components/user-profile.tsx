"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Settings, LogOut, Briefcase } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"

interface UserProfileProps {
  onClose?: () => void
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, profile, signOut, loading } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  if (loading) {
    return (
      <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user || !profile) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    await signOut()
    if (onClose) onClose()
  }

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
    if (onClose) onClose()
  }

  return (
    <>
      <Card className="border-0 bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/50">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{profile.email}</p>
            </div>
          </div>

          {profile.occupation && (
            <div className="mb-3">
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <Briefcase className="w-3 h-3 mr-1" />
                {profile.occupation}
              </Badge>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70 border-white/50"
              onClick={handleSettingsClick}
            >
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
              onClick={handleSignOut}
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} profile={profile} />
    </>
  )
}

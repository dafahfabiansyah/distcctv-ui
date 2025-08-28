"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Bell, QrCode } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function Topbar() {
  const { user } = useAuth()
  
  // Function to get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  // Function to get display name
  const getDisplayName = () => {
    if (!user) return 'User'
    return user.name || user.email || 'User'
  }
  
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search leads, contacts..." className="pl-10 bg-gray-50 border-gray-200" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-black" />
          <Badge className="absolute -top-1 -right-1 bg-crm-badge-high text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
            3
          </Badge>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm"  title="Scan QR Code"
          aria-label="QR Code Scanner">
          <QrCode className="h-5 w-5 text-black" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="relative">
            <div className="w-8 h-8 bg-crm-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials(user?.name || user?.email)}
              </span>
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-black">{getDisplayName()}</div>
            <div className="text-gray-500 text-xs">Online</div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Users, MessageSquare, Settings } from "lucide-react"

const menuItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: "crm",
    name: "CRM",
    icon: <Users className="h-5 w-5" />,
    active: true,
  },
  {
    id: "omnichannel",
    name: "Omnichannel",
    icon: <MessageSquare className="h-5 w-5" />,
    badge: 3,
  },
]

export default function Sidebar() {
  return (
    <div className="bg-white border-r border-gray-200 w-20 hover:w-64 h-screen flex flex-col transition-all duration-300 group">
      {/* Logo */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-crm-primary rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="text-black font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            kiriman
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start gap-3 text-black hover:bg-gray-50 ${
                item.active ? "bg-crm-primary text-white" : ""
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between w-full overflow-hidden">
                <span className="whitespace-nowrap">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="bg-crm-badge-high text-white flex-shrink-0">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start gap-3 text-black hover:bg-gray-50">
          <div className="flex-shrink-0">
            <Settings className="h-5 w-5" />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            Settings
          </span>
        </Button>
      </div>
    </div>
  )
}

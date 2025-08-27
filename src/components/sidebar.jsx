"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { LayoutDashboard, Users, MessageSquare, Settings } from "lucide-react"
import { Link, useLocation } from "react-router"

const menuItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    url: "/"
  },
  {
    id: "crm",
    name: "CRM",
    icon: <Users className="h-5 w-5" />,
    url: "/pipeline"
  },
  {
    id: "omnichannel",
    name: "Omnichannel",
    icon: <MessageSquare className="h-5 w-5" />,
    badge: 3,
    url: "/omnichannel"
  },
]

export default function Sidebar() {
  const location = useLocation()
  
  // Function to check if menu item is active
  const isActive = (url) => {
    if (url === "/") {
      return location.pathname === "/" || location.pathname === "/dashboard"
    }
    return location.pathname === url
  }

  return (
    <div className="bg-white border-r border-gray-200 w-20 hover:w-64 h-screen flex flex-col transition-all duration-300 group shadow-sm">
      {/* Logo */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-center">
        <div className="flex items-center justify-center w-full">
          <img 
            src="/distributor-cctv-logo-1611915586.jpg" 
            alt="Kiriman Logo" 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.url)
            return (
              <Link key={item.id} to={item.url} className="block">
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 transition-all duration-200 relative overflow-hidden border-l-4 ${
                    active 
                      ? "bg-crm-primary text-white hover:bg-crm-primary-hover hover:!text-white shadow-sm border-l-white" 
                      : "text-gray-700 hover:bg-crm-sidebar-hover hover:text-crm-primary hover:shadow-sm border-l-transparent"
                  }`}
                >
                  <div className="flex-shrink-0 relative z-10">
                    {item.icon}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between w-full overflow-hidden">
                    <span className="whitespace-nowrap font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="bg-crm-badge-high text-white flex-shrink-0 ml-2 shadow-sm"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-gray-700 hover:bg-crm-sidebar-hover hover:text-crm-primary transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex-shrink-0">
            <Settings className="h-5 w-5" />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden font-medium">
            Settings
          </span>
        </Button>
      </div>
    </div>
  )
}

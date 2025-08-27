"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { LayoutDashboard, Users, MessageSquare, Settings, ChevronDown, ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

const menuItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    url: "/"
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
  const { token } = useAuth()
  const [pipelines, setPipelines] = useState([])
  const [isPipelineOpen, setIsPipelineOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  // Function to check if menu item is active
  const isActive = (url) => {
    if (url === "/") {
      return location.pathname === "/" || location.pathname === "/dashboard"
    }
    return location.pathname === url
  }

  // Function to check if pipeline menu should be open
  const isPipelineMenuActive = () => {
    return location.pathname.includes('/pipeline')
  }

  // Fetch pipelines from API
  const fetchPipelines = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v2/crm/pipelines', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPipelines(data.pipelines || [])
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load pipelines on component mount and when token changes
  useEffect(() => {
    fetchPipelines()
  }, [token])

  // Set pipeline menu open if current path includes pipeline and sidebar is hovered
  useEffect(() => {
    if (isPipelineMenuActive() && isHovered) {
      setIsPipelineOpen(true)
    } else if (!isHovered) {
      setIsPipelineOpen(false)
    }
  }, [location.pathname, isHovered])

  // Toggle pipeline dropdown
  const togglePipelineDropdown = () => {
    setIsPipelineOpen(!isPipelineOpen)
  }

  return (
    <div 
      className="bg-white border-r border-gray-200 w-20 hover:w-64 h-screen flex flex-col transition-all duration-300 group shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          {/* Dashboard Menu */}
          {menuItems.filter(item => item.id === 'dashboard').map((item) => {
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
                  </div>
                </Button>
              </Link>
            )
          })}

          {/* Pipeline Dropdown Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={togglePipelineDropdown}
              className={`w-full justify-start gap-3 transition-all duration-200 relative overflow-hidden border-l-4 ${
                isPipelineMenuActive() 
                  ? "bg-crm-primary text-white hover:bg-crm-primary-hover hover:!text-white shadow-sm border-l-white" 
                  : "text-gray-700 hover:bg-crm-sidebar-hover hover:text-crm-primary hover:shadow-sm border-l-transparent"
              }`}
            >
              <div className="flex-shrink-0 relative z-10">
                <Users className="h-5 w-5" />
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between w-full overflow-hidden">
                <span className="whitespace-nowrap font-medium">Check All Pipeline</span>
                <div className="flex-shrink-0 ml-2">
                  {isPipelineOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </Button>

            {/* Pipeline Submenu */}
            {isPipelineOpen && isHovered && (
              <div className="ml-4 mt-1 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {loading ? (
                  <div className="text-gray-500 text-sm px-4 py-2">Loading pipelines...</div>
                ) : pipelines.length > 0 ? (
                  pipelines.map((pipeline) => {
                    const pipelineActive = location.pathname === `/pipeline/${pipeline.id}`
                    return (
                      <Link key={pipeline.id} to={`/pipeline/${pipeline.id}`} className="block">
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 transition-all duration-200 relative overflow-hidden border-l-4 text-sm ${
                            pipelineActive 
                              ? "bg-crm-primary text-white hover:bg-crm-primary-hover hover:!text-white shadow-sm border-l-white" 
                              : "text-gray-600 hover:bg-crm-sidebar-hover hover:text-crm-primary hover:shadow-sm border-l-transparent"
                          }`}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center w-full overflow-hidden">
                            <span className="whitespace-nowrap font-medium pl-4">{pipeline.name}</span>
                          </div>
                        </Button>
                      </Link>
                    )
                  })
                ) : (
                  <div className="text-gray-500 text-sm px-4 py-2">No pipelines found</div>
                )}
              </div>
            )}
          </div>

          {/* Other Menu Items */}
          {menuItems.filter(item => item.id !== 'dashboard').map((item) => {
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

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users
} from "lucide-react"

// Mock data untuk demo
const mockEvents = [
  {
    id: 1,
    title: "Project White Hall Lo...",
    time: "10:00 - 11:00",
    type: "Busy",
    color: "bg-orange-400"
  },
  {
    id: 2,
    title: "Retrospect Active...",
    time: "04:00 AM",
    type: "Busy",
    color: "bg-purple-400"
  },
  {
    id: 3,
    title: "Busy",
    time: "10am - 11am",
    type: "Busy",
    color: "bg-blue-400"
  }
]

const mockAssets = [
  {
    id: 1,
    name: "Camera HIKVISION DS-2CD2085FWD-I",
    type: "IP Camera",
    status: "Available",
    location: "Warehouse A",
    assignedTo: "John Doe",
    lastUsed: "2024-10-20",
    condition: "Good"
  },
  {
    id: 2,
    name: "NVR HIKVISION DS-7608NI-K2/8P",
    type: "Network Video Recorder",
    status: "In Use",
    location: "Site B",
    assignedTo: "Jane Smith",
    lastUsed: "2024-10-22",
    condition: "Excellent"
  },
  {
    id: 3,
    name: "Switch POE TP-LINK TL-SF1008P",
    type: "Network Switch",
    status: "Maintenance",
    location: "Workshop",
    assignedTo: "-",
    lastUsed: "2024-10-18",
    condition: "Fair"
  },
  {
    id: 4,
    name: "Cable UTP Cat6 305m",
    type: "Network Cable",
    status: "Available",
    location: "Warehouse A",
    assignedTo: "-",
    lastUsed: "2024-10-15",
    condition: "Good"
  },
  {
    id: 5,
    name: "Monitor ASUS VA24EHE 24\"",
    type: "Display Monitor",
    status: "Available",
    location: "Office",
    assignedTo: "Mike Johnson",
    lastUsed: "2024-10-21",
    condition: "Excellent"
  }
]

// const timeZones = [
//   { value: "warsaw", label: "Warsaw", flag: "🇵🇱", time: "2:32 AM" },
//   { value: "london", label: "London", flag: "🇬🇧", time: "2:32 AM" },
//   { value: "surabaya", label: "Surabaya", flag: "🇮🇩", time: "2:32 AM" }
// ]

const statusColors = {
  "Available": "bg-green-100 text-green-800",
  "In Use": "bg-blue-100 text-blue-800", 
  "Maintenance": "bg-yellow-100 text-yellow-800",
  "Out of Service": "bg-red-100 text-red-800"
}

// Calendar Component
function CalendarComponent({ onCreateSchedule, schedules }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTimeZone, setSelectedTimeZone] = useState("surabaya")
  const [selectedDate, setSelectedDate] = useState(null)

  const currentMonth = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  
  // Get days in current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => null)

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{currentMonth}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Time Zone Selector */}
          {/* <div className="flex items-center gap-4">
            {timeZones.map((tz) => (
              <div key={tz.value} className="text-center">
                <div className="flex items-center gap-1 text-sm">
                  <span>{tz.flag}</span>
                  <span className="font-medium">{tz.label}</span>
                </div>
                <div className="text-xs text-gray-600">{tz.time}</div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Calendar View Options */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Calendar View</Button>
            <Button variant="outline" size="sm">Schedule Prompt</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">Helper</Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-50">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="p-3 text-sm font-medium text-gray-600 text-center border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar body */}
          <div className="grid grid-cols-7" style={{ minHeight: '600px' }}>
            {/* Empty days */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="border-r border-b border-gray-200 bg-gray-50"></div>
            ))}
            
            {/* Calendar days */}
            {days.map((day) => {
              const daySchedules = (schedules || []).filter(schedule => {
                const scheduleDate = new Date(schedule.date)
                return scheduleDate.getDate() === day && 
                       scheduleDate.getMonth() === currentDate.getMonth() &&
                       scheduleDate.getFullYear() === currentDate.getFullYear()
              })
              
              return (
                <div key={day} className="border-r border-b border-gray-200 last:border-r-0 relative group hover:bg-gray-50">
                  <div className="p-2">
                    <div className="font-medium text-sm mb-2">{day}</div>
                    
                    {/* Real schedules */}
                    {daySchedules.length > 0 && (
                      <div className="space-y-1">
                        {daySchedules.map((schedule, index) => {
                          const colors = [
                            'bg-blue-400',
                            'bg-green-400', 
                            'bg-purple-400',
                            'bg-red-400',
                            'bg-yellow-400',
                            'bg-indigo-400',
                            'bg-pink-400',
                            'bg-orange-400'
                          ]
                          const colorClass = colors[index % colors.length]
                          
                          return (
                            <div key={schedule.id} className={`${colorClass} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80`}
                                 title={`${schedule.title}\n${schedule.startTime} - ${schedule.endTime}\nAsset: ${schedule.assetName || 'No asset assigned'}`}>
                              <div className="truncate font-medium">{schedule.title}</div>
                              <div className="text-xs opacity-90">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              {schedule.assetName && (
                                <div className="text-xs opacity-75 truncate">
                                  {schedule.assetName}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Sample events for demonstration (show only if no real schedules) */}
                    {daySchedules.length === 0 && (
                      <>
                        {day === 23 && (
                          <div className="space-y-1">
                            <div className="bg-orange-400 text-white text-xs p-1 rounded truncate opacity-50">
                              Sample: Project Demo
                              <div className="text-xs opacity-90">10:00 - 11:00</div>
                            </div>
                          </div>
                        )}
                        
                        {day === 24 && (
                          <div className="space-y-1">
                            <div className="bg-purple-400 text-white text-xs p-1 rounded opacity-50">
                              Sample: Meeting
                              <div className="text-xs opacity-90">04:00 PM</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Add event button - appears on hover */}
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedDate(day)
                      onCreateSchedule(day)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Asset Table Component
function AssetTable() {
  const [assets, setAssets] = useState(mockAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateAsset, setShowCreateAsset] = useState(false)

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Asset List</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Out of Service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateAsset(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Asset Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Assigned To</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Last Used</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Condition</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{asset.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.type}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={`${statusColors[asset.status]} border-0`}>
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {asset.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {asset.assignedTo}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.lastUsed}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      asset.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                      asset.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No assets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredAssets.length} of {assets.length} assets
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Slot Page Component
export default function SlotPage() {
  const [showCreateSchedule, setShowCreateSchedule] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [notification, setNotification] = useState(null)
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      title: "Camera Installation",
      date: "2024-10-25",
      startTime: "09:00",
      endTime: "11:00",
      assetId: "1",
      assetName: "Camera HIKVISION DS-2CD2085FWD-I",
      description: "Install CCTV camera at main entrance",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Network Setup",
      date: "2024-10-27",
      startTime: "14:00",
      endTime: "16:00",
      assetId: "2",
      assetName: "NVR HIKVISION DS-7608NI-K2/8P",
      description: "Configure NVR system",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Team Meeting",
      date: "2024-10-28",
      startTime: "10:00",
      endTime: "11:00",
      assetId: "",
      assetName: "",
      description: "Weekly team sync up",
      createdAt: new Date().toISOString()
    }
  ])
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    assetId: 'none',
    description: ''
  })

  // Form handlers
  const handleFormChange = (field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setScheduleForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      assetId: 'none',
      description: ''
    })
  }

  const handleCreateSchedule = () => {
    console.log('Form data:', scheduleForm) // Debug log
    
    if (!scheduleForm.title?.trim() || !scheduleForm.date?.trim() || !scheduleForm.startTime?.trim() || !scheduleForm.endTime?.trim()) {
      console.log('Validation failed:', {
        title: scheduleForm.title,
        date: scheduleForm.date, 
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime
      })
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    const newSchedule = {
      id: Date.now(),
      title: scheduleForm.title,
      date: scheduleForm.date,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      assetId: scheduleForm.assetId === 'none' ? '' : scheduleForm.assetId,
      assetName: (scheduleForm.assetId && scheduleForm.assetId !== 'none') ? mockAssets.find(a => a.id.toString() === scheduleForm.assetId)?.name : '',
      description: scheduleForm.description,
      createdAt: new Date().toISOString()
    }

    setSchedules(prev => [...prev, newSchedule])
    setShowCreateSchedule(false)
    setSelectedDate(null)
    resetForm()
    
    setNotification({
      type: 'success',
      message: 'Schedule created successfully!'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="flex-1 bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-black">Scheduling Management</h1>
          <div className="flex items-center gap-3">
            <Dialog open={showCreateSchedule} onOpenChange={(open) => {
              setShowCreateSchedule(open)
              if (!open) {
                setSelectedDate(null)
                resetForm()
              } else {
                // Ketika modal dibuka dari header button, reset form
                if (!selectedDate) {
                  resetForm()
                }
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedDate ? `Create Schedule for ${selectedDate} October 2024` : 'Create New Schedule'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-sm font-medium text-red-500">Title *</label>
                    <Input 
                      className="col-span-3" 
                      placeholder="Schedule title"
                      value={scheduleForm.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-sm font-medium text-red-500">Date *</label>
                    <Input 
                      type="date" 
                      className="col-span-3"
                      value={scheduleForm.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-sm font-medium text-red-500">Time *</label>
                    <div className="col-span-3 flex gap-2">
                      <Input 
                        type="time" 
                        className="flex-1" 
                        placeholder="Start time"
                        value={scheduleForm.startTime}
                        onChange={(e) => handleFormChange('startTime', e.target.value)}
                      />
                      <Input 
                        type="time" 
                        className="flex-1" 
                        placeholder="End time"
                        value={scheduleForm.endTime}
                        onChange={(e) => handleFormChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-sm font-medium">Asset</label>
                    <Select value={scheduleForm.assetId} onValueChange={(value) => handleFormChange('assetId', value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select asset (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No asset assigned</SelectItem>
                        {mockAssets.filter(asset => asset.status === 'Available').map(asset => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} - {asset.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Schedule description (optional)"
                      rows={3}
                      value={scheduleForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setShowCreateSchedule(false)
                    setSelectedDate(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSchedule}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold">{mockAssets.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Schedules</p>
                  <p className="text-2xl font-bold text-green-600">
                    {schedules.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Use</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockAssets.filter(a => a.status === 'In Use').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mockAssets.filter(a => a.status === 'Maintenance').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Calendar Section */}
        <div className="col-span-8">
          <CalendarComponent 
            onCreateSchedule={(day) => {
              setSelectedDate(day)
              // Pre-fill form when creating from calendar
              const currentDate = new Date()
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
              setScheduleForm(prev => ({
                ...prev,
                date: dateStr,
                startTime: '09:00',
                endTime: '10:00'
              }))
              setShowCreateSchedule(true)
            }}
            schedules={schedules}
          />
        </div>

        {/* Asset Table Section */}
        <div className="col-span-4">
          <AssetTable />
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

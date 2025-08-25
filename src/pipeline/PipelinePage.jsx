"use client"

import { useState } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Clock, Plus, MoreHorizontal, Eye, ArrowRight, GripVertical, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data
const stages = [
  { id: "new", name: "New", count: 6, color: "bg-crm-stage-new" },
  { id: "open", name: "Open", count: 4, color: "bg-crm-stage-open" },
  { id: "progress", name: "In Progress", count: 3, color: "bg-crm-stage-progress" },
  { id: "closed", name: "Closed", count: 2, color: "bg-crm-stage-closed" },
]

const initialLeads = {
  new: [
    {
      id: 1,
      name: "Arlene McCoy",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 2,
      name: "Wade Warren",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/thoughtful-man.png",
    },
    {
      id: 3,
      name: "Kristin Watson",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 4,
      name: "Darlene Robertson",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 5,
      name: "Annette Black",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 6,
      name: "Jerome Bell",
      email: "jeromebell@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/thoughtful-man.png",
    },
  ],
  open: [
    {
      id: 7,
      name: "Jenny Wilson",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/diverse-woman-portrait.png",
    },
  ],
  progress: [
    {
      id: 8,
      name: "Jenny Wilson",
      email: "emailkuyahui@gmail.com",
      phone: "(405) 555-0128",
      time: "Today at 4:30 PM",
      avatar: "/diverse-woman-portrait.png",
    },
  ],
  closed: [],
}

const leadDetails = {
  name: "Jerome Bell",
  email: "jeromebell@gmail.com",
  phone: "(405) 555-0128",
  avatar: "/thoughtful-man.png",
  leadOwner: "Esther Howard",
  company: "Google",
  jobTitle: "Content Writer",
  annualRevenue: "$ 5,000",
  leadSource: "Online store",
  lastActivity: "2 Jan 2020 at 10:00 AM",
  upcomingActivity: {
    title: "Prepare quote for Jerome Bell",
    description:
      "She's interested in our new product line and wants our very best price. Please include a detailed breakdown of costs.",
    reminder: "No reminder",
    priority: "High",
    assignedTo: "Esther Howard",
  },
  notes: [
    {
      id: 1,
      author: "Esther Howard",
      time: "Today, 10:00 AM",
      content:
        "She's interested in our new product line and wants our very best price. Please include a detailed breakdown of costs.",
    },
    {
      id: 2,
      author: "Esther Howard",
      time: "Today, 10:00 AM",
      content: "Follow up call scheduled for next week.",
    },
  ],
}

// Lead Card Component dengan Drag
function LeadCard({ lead, onLeadClick }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'lead',
    item: { id: lead.id, lead },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const handleClick = (e) => {
    // Jangan trigger click jika sedang drag
    if (!isDragging) {
      onLeadClick(lead)
    }
  }

  return (
    <Card
      ref={drag}
      className={`cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      }`}
    >
      <CardContent className="p-4" onClick={handleClick}>
        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-black truncate">{lead.name}</h4>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Clock className="h-3 w-3" />
              <span className="truncate">{lead.time}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stage Column Component dengan Drop
function StageColumn({ stage, leads, onLeadClick, onMoveLead }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'lead',
    drop: (item) => {
      onMoveLead(item.lead, stage.id)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
          <h3 className="font-medium text-black">{stage.name}</h3>
          <Badge variant="secondary" className="bg-gray-100 text-black">
            {leads.length} Leads
          </Badge>
        </div>
      </div>

      {/* Drop Area */}
      <div
        ref={drop}
        className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
        }`}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onLeadClick={onLeadClick} />
        ))}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [leadsData, setLeadsData] = useState(initialLeads)
  const [selectedLead, setSelectedLead] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    sales: '',
    sortBy: 'newest'
  })

  const handleLeadClick = (lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const handleMoveLead = (lead, targetStageId) => {
    // Cari stage asal
    let sourceStageId = null
    for (const [stageId, stageLeads] of Object.entries(leadsData)) {
      if (stageLeads.find(l => l.id === lead.id)) {
        sourceStageId = stageId
        break
      }
    }

    // Jika sudah di stage yang sama, tidak perlu pindah
    if (sourceStageId === targetStageId) return

    // Update leads data
    setLeadsData(prev => {
      const newData = { ...prev }
      
      // Remove dari stage asal
      newData[sourceStageId] = newData[sourceStageId].filter(l => l.id !== lead.id)
      
      // Add ke stage tujuan
      newData[targetStageId] = [...newData[targetStageId], lead]
      
      return newData
    })
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplyFilters = () => {
    // Logic untuk apply filters bisa ditambahkan di sini
    console.log('Applied filters:', filters)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      sales: '',
      sortBy: 'newest'
    })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-white p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-black">567 Leads</h1>
            <Button className="bg-crm-primary hover:bg-crm-primary-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-black bg-transparent">
              All leads
            </Button>
            {/* <Button variant="outline" className="text-black bg-transparent">
              Create date
            </Button> */}
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-gray-600 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  More filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Leads</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* From Date */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="fromDate" className="text-right text-sm font-medium">
                      From Date
                    </label>
                    <Input
                      id="fromDate"
                      type="date"
                      value={filters.fromDate}
                      onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  {/* To Date */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="toDate" className="text-right text-sm font-medium">
                      To Date
                    </label>
                    <Input
                      id="toDate"
                      type="date"
                      value={filters.toDate}
                      onChange={(e) => handleFilterChange('toDate', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  {/* Sales */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="sales" className="text-right text-sm font-medium">
                      Sales
                    </label>
                    <Select
                      value={filters.sales}
                      onValueChange={(value) => handleFilterChange('sales', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select Sales Person"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sales</SelectItem>
                        <SelectItem value="Alice">Alice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort By */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="sortBy" className="text-right text-sm font-medium">
                      Sort By
                    </label>
                    <select
                      id="sortBy"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="revenue-high">Revenue High to Low</option>
                      <option value="revenue-low">Revenue Low to High</option>
                    </select>
                  </div>
                </div>
                
                {/* Filter Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset
                  </Button>
                  <Button onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-4 gap-6">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={leadsData[stage.id] || []}
              onLeadClick={handleLeadClick}
              onMoveLead={handleMoveLead}
            />
          ))}
        </div>

        {/* Lead Details Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
          <DrawerContent className="!w-[60vw] !max-w-[99vw] p-0">
            <DrawerHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle className="flex items-center gap-2 text-lg font-medium">
                  <Eye className="h-5 w-5" />
                  Lead Preview
                </DrawerTitle>
                <Button variant="outline" size="sm">
                  View full details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </DrawerHeader>

            <div className="px-6 py-6 space-y-6">
              {/* Lead Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedLead?.avatar || leadDetails.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {(selectedLead?.name || leadDetails.name)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedLead?.name || leadDetails.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedLead?.email || leadDetails.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedLead?.phone || leadDetails.phone}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lead owner</label>
                  <p className="text-sm text-gray-900 mt-1">{leadDetails.leadOwner}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-sm text-black mt-1">{leadDetails.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Title</label>
                  <p className="text-sm text-black mt-1">{leadDetails.jobTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Annual revenue</label>
                  <p className="text-sm text-black mt-1">{leadDetails.annualRevenue}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-row w-full">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-r-none border-r-0 flex-1 justify-center">✓ New</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-none border-r-0 flex-1 justify-center">✓ Open</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-none border-r-0 flex-1 justify-center">In Progress</Badge>
                <Badge variant="outline" className="text-gray-600 bg-gray-50 rounded-none border-r-0 flex-1 justify-center">Open deals</Badge>
                <Badge variant="outline" className="text-gray-600 bg-gray-50 rounded-l-none flex-1 justify-center">Closed</Badge>
              </div>

              {/* Lead Source */}
              <div>
                <label className="text-sm font-medium text-gray-500">Lead source</label>
                <p className="text-sm text-black mt-1">{leadDetails.leadSource}</p>
                <p className="text-sm text-gray-500 mt-1">Last activity: {leadDetails.lastActivity}</p>
              </div>

              <Separator />

              {/* Upcoming Activity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-black">Upcoming Activity</h3>
                  <Button variant="link" size="sm" className="text-crm-primary">
                    View all activity
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{leadDetails.upcomingActivity.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{leadDetails.upcomingActivity.description}</p>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Reminder</label>
                      <p className="text-gray-900">{leadDetails.upcomingActivity.reminder}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-gray-500">Task Priority</label>
                      <Badge className="bg-crm-badge-high text-white w-fit">{leadDetails.upcomingActivity.priority}</Badge>
                    </div>
                    <div>
                      <label className="text-gray-500">Assigned to</label>
                      <p className="text-gray-900">{leadDetails.upcomingActivity.assignedTo}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Notes</h3>
                  <Button variant="link" size="sm" className="text-crm-primary">
                    Add note
                  </Button>
                </div>

                <div className="space-y-4">
                  {leadDetails.notes.map((note) => (
                    <div key={note.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{note.author}</span>
                        <span className="text-sm text-gray-500">{note.time}</span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </DndProvider>
  )
}

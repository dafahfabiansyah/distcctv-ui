"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Clock, Plus, MoreHorizontal, Eye, ArrowRight } from "lucide-react"

// Sample data
const stages = [
  { id: "new", name: "New", count: 6, color: "bg-crm-stage-new" },
  { id: "open", name: "Open", count: 4, color: "bg-crm-stage-open" },
  { id: "progress", name: "In Progress", count: 3, color: "bg-crm-stage-progress" },
  { id: "closed", name: "Closed", count: 2, color: "bg-crm-stage-closed" },
]

const leads = {
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
  progress: [],
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

export default function PipelinePage() {
  const [, setSelectedLead] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleLeadClick = (lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">567 Leads</h1>
          <Button className="bg-crm-primary hover:bg-crm-primary-hover text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Button variant="outline" className="text-gray-600 bg-transparent">
            All leads
          </Button>
          <Button variant="outline" className="text-gray-600 bg-transparent">
            Create date
          </Button>
          <Button variant="outline" className="text-gray-600 bg-transparent">
            Contact Owner
          </Button>
          <Button variant="outline" className="text-gray-600 bg-transparent">
            More filters
          </Button>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-4 gap-6">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-lg p-4">
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <h3 className="font-medium text-gray-900">{stage.name}</h3>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  {stage.count} Leads
                </Badge>
              </div>
            </div>

            {/* Lead Cards */}
            <div className="space-y-3">
              {leads[stage.id]?.map((lead) => (
                <Card
                  key={lead.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleLeadClick(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={lead.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
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
              ))}
            </div>
          </div>
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
                <AvatarImage src={leadDetails.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {leadDetails.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{leadDetails.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {leadDetails.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {leadDetails.phone}
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
                <p className="text-sm text-gray-900 mt-1">{leadDetails.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Job Title</label>
                <p className="text-sm text-gray-900 mt-1">{leadDetails.jobTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Annual revenue</label>
                <p className="text-sm text-gray-900 mt-1">{leadDetails.annualRevenue}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ New</Badge>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ Open</Badge>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">In Progress</Badge>
              <Badge variant="outline" className="text-gray-600">Open deals</Badge>
              <Badge variant="outline" className="text-gray-600">Closed</Badge>
            </div>

            {/* Lead Source */}
            <div>
              <label className="text-sm font-medium text-gray-500">Lead source</label>
              <p className="text-sm text-gray-900 mt-1">{leadDetails.leadSource}</p>
              <p className="text-sm text-gray-500 mt-1">Last activity: {leadDetails.lastActivity}</p>
            </div>

            <Separator />

            {/* Upcoming Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Upcoming Activity</h3>
                <Button variant="link" size="sm" className="text-crm-primary-text">
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
                  <div>
                    <label className="text-gray-500">Task Priority</label>
                    <Badge className="bg-crm-badge-high text-white mt-1">{leadDetails.upcomingActivity.priority}</Badge>
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
                <Button variant="link" size="sm" className="text-crm-primary-text">
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
  )
}

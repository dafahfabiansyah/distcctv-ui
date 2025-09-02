"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Phone, Clock, Plus, MoreHorizontal, Eye, ArrowRight, GripVertical, Filter, MessageSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ChatInterface from "@/components/ChatInterface"
import QuotationModal from "./components/QuotationModal"
import pipelineService from "@/services/pipeline"


// Lead Card Component dengan Drag
function LeadCard({ lead, onLeadClick, onUpdateLead }) {
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
function StageColumn({ stage, leads, onLeadClick, onMoveLead, onUpdateLead }) {
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
    <div 
      ref={drop}
      className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm min-h-[500px] transition-colors ${
        isOver ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
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

      {/* Cards Area */}
      <div className="space-y-3">
        {leads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onLeadClick={onLeadClick}
            onUpdateLead={onUpdateLead}
          />
        ))}
        
        {/* Empty state dengan visual indicator */}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            <div className="text-center">
              <div className="text-sm">Drop leads here</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { pipelineId } = useParams()
  const [activeTab, setActiveTab] = useState("leads")
  const [leadsData, setLeadsData] = useState([])
  const [stages, setStages] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [accordionValue, setAccordionValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Function to get default date range (7 days back)
  const getDefaultDateRange = () => {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    
    return {
      from: sevenDaysAgo.toISOString().split('T')[0], // Format: YYYY-MM-DD
      to: today.toISOString().split('T')[0]
    }
  }

  // Debug: log pipelineId
  console.log('PipelinePage - pipelineId:', pipelineId)
  console.log('PipelinePage - leadsData length:', leadsData.length)
  console.log('PipelinePage - stages length:', stages.length)
  
  const defaultDates = getDefaultDateRange()
  const [filters, setFilters] = useState({
    dateFrom: defaultDates.from,
    dateTo: defaultDates.to,
    sales: "",
    search: "",
    sort: "newest"
  })

  // Fetch stages dari API
  const fetchStages = async () => {
    try {
      console.log('Fetching stages for pipeline:', pipelineId)
      const response = await pipelineService.getStages(pipelineId)
      console.log('Stages API Response:', response)
      
      if (response && response.success && response.data) {
        const stagesFromAPI = response.data.map(stage => ({
          id: stage.id,
          name: stage.name,
          position: stage.position,
          count: 0, // Will be updated when leads are loaded
          color: `bg-crm-stage-${stage.name.toLowerCase().replace(/\s+/g, '-')}`
        }))
        
        stagesFromAPI.sort((a, b) => a.position - b.position)
        console.log('Stages from API:', stagesFromAPI)
        return stagesFromAPI
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
    }
    
    // Return empty array if no stages found
    console.log('No stages found, returning empty array')
    return []
  }

  // Fetch data leads dari API
  const fetchLeads = async () => {
    console.log('fetchLeads called with pipelineId:', pipelineId)
    console.log('fetchLeads called with filters:', filters)
    
    if (!pipelineId) {
      console.log('No pipelineId provided')
      setError('Pipeline ID is required')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Fetch stages first
      const stagesData = await fetchStages()
      setStages(stagesData)
      
      // Prepare query parameters for API call
      const queryParams = {
        date_from: filters.dateFrom || '',
        date_to: filters.dateTo || '',
        sales: filters.sales || '',
        search: filters.search || ''
      }
      
      console.log('API call with query params:', queryParams)
      
      const response = await pipelineService.getLeads(pipelineId, queryParams)
      
      // Debug: log response untuk melihat struktur data
      console.log('API Response:', response)
      
      // Transform data sesuai struktur yang diharapkan komponen
      if (response && Array.isArray(response)) {
        const transformedLeads = []
        
        console.log('Found leads array in response:', response.length, 'leads')
        
        // Transform leads data
        response.forEach(lead => {
          // Transform lead data
          transformedLeads.push({
            id: lead.id,
            name: lead.name,
            company: lead.company || '',
            email: lead.email || '',
            phone: lead.phone,
            stage: lead.lead_on_stage ? lead.lead_on_stage.stage_id : stagesData[0]?.id || null,
            value: lead.amount || 0,
            source: lead.source_name || 'Unknown',
            lastActivity: lead.updated_at,
            priority: 'medium',
            tags: [],
            notes: lead.note || '',
            created_at: lead.created_at,
            updated_at: lead.updated_at,
            time: lead.updated_at,
            avatar: '/diverse-woman-portrait.png', // Default avatar
            // Additional fields for lead information
            keyword: lead.keyword || '',
            city: lead.city?.name || lead.city_name || '',
            automation_reason: lead.sales_assign_reason || '',
            supervisor_advice: lead.supervisor_ai_advice || '',
            chat_score: lead.lead_opportunity_score || '',
            score_reason: lead.lead_opportunity_reason || ''
          })
        })
        
        console.log('Transformed leads:', transformedLeads)
        
        // Update stage counts
        const updatedStages = stagesData.map(stage => ({
          ...stage,
          count: transformedLeads.filter(lead => lead.stage === stage.id).length
        }))
        
        console.log('Updated stages with counts:', updatedStages)
        
        setLeadsData(transformedLeads)
        setStages(updatedStages)
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError('Failed to fetch leads data')
    } finally {
      setLoading(false)
    }
  }

  // Effect untuk fetch data ketika component mount atau pipelineId berubah
  useEffect(() => {
    fetchLeads()
  }, [pipelineId])

  // Effect untuk fetch data ketika filter berubah
  useEffect(() => {
    if (pipelineId) {
      fetchLeads()
    }
  }, [filters.dateFrom, filters.dateTo, filters.sales, filters.search])

  const handleLeadClick = (lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const handleMoveLead = async (lead, targetStageId) => {
    // Jika sudah di stage yang sama, tidak perlu pindah
    if (lead.stage === targetStageId) return

    console.log('Moving lead:', lead.id, 'to stage:', targetStageId)

    try {
      // Update UI dulu untuk responsiveness (optimistic update)
      setLeadsData(prev => {
        return prev.map(l => {
          if (l.id === lead.id) {
            return { ...l, stage: targetStageId }
          }
          return l
        })
      })

      // Update counts di stages
      setStages(prev => {
        return prev.map(stage => {
          if (stage.id === targetStageId) {
            return { ...stage, count: stage.count + 1 }
          }
          if (stage.id === lead.stage) {
            return { ...stage, count: Math.max(0, stage.count - 1) }
          }
          return stage
        })
      })

      // Kirim update ke backend
      const response = await pipelineService.updateLeadStage(lead.id, targetStageId)
      console.log('Lead stage updated successfully:', response)
      
    } catch (error) {
      console.error('Error updating lead stage:', error)
      
      // Rollback UI changes jika API gagal
      setLeadsData(prev => {
        return prev.map(l => {
          if (l.id === lead.id) {
            return { ...l, stage: lead.stage } // Kembalikan ke stage sebelumnya
          }
          return l
        })
      })

      // Rollback stage counts
      setStages(prev => {
        return prev.map(stage => {
          if (stage.id === targetStageId) {
            return { ...stage, count: Math.max(0, stage.count - 1) }
          }
          if (stage.id === lead.stage) {
            return { ...stage, count: stage.count + 1 }
          }
          return stage
        })
      })
      
      // Show error message to user
      alert('Failed to move lead. Please try again.')
    }
  }

  // Fungsi baru untuk update lead lengkap
  const handleUpdateLead = async (leadId, leadData) => {
    console.log('Updating lead:', leadId, 'with data:', leadData)

    try {
      const response = await pipelineService.updateLead(leadId, leadData)
      console.log('Lead updated successfully:', response)
      
      // Update lead data di state jika berhasil
      setLeadsData(prev => {
        return prev.map(l => {
          if (l.id === leadId) {
            return { ...l, ...leadData }
          }
          return l
        })
      })

      return response
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Failed to update lead. Please try again.')
      throw error
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplyFilters = () => {
    // Filters akan otomatis diterapkan melalui useEffect
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    const defaultDates = getDefaultDateRange()
    setFilters({
      dateFrom: defaultDates.from,
      dateTo: defaultDates.to,
      sales: "",
      search: "",
      sort: "newest"
    })
  }

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-white p-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-black">{leadsData.length} Leads</h1>
            <Button className="bg-crm-primary hover:bg-crm-primary-hover text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search leads..."
              className="max-w-sm"
              value={filters.search}
              onChange={handleSearchChange}
            />
            <Button variant="outline" className="text-black bg-transparent">
              All leads
            </Button>
             <Button variant="outline" className="text-black bg-transparent">
              Export Report
            </Button>
             <Button variant="outline" className="text-black bg-transparent">
              Export Recap
            </Button>
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
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
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
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
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
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading pipeline data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchLeads} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4" style={{minWidth: `${stages.length * 300}px`}}>
               {stages.map((stage) => (
                 <div key={stage.id} className="flex-shrink-0" style={{width: '280px'}}>
                   <StageColumn
                     stage={stage}
                     leads={leadsData.filter((lead) => lead.stage === stage.id)}
                     onLeadClick={handleLeadClick}
                     onMoveLead={handleMoveLead}
                     onUpdateLead={handleUpdateLead}
                   />
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* Lead Details Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
          <DrawerContent className="!w-[60vw] !max-w-[99vw] p-0">
            <DrawerHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle className="flex items-center gap-2 text-lg font-medium">
                  <Eye className="h-5 w-5" />
                  Lead Preview
                </DrawerTitle>
              </div>
              
              <div className="flex w-full mt-4">
                  <Button 
                    variant={activeTab === 'help'} 
                    size="sm"
                    onClick={() => setActiveTab('help')}
                    className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-r-none"
                  >
                    Help
                  </Button>
                  <Button 
                    variant={activeTab === 'note'} 
                    size="sm"
                    onClick={() => setActiveTab('note')}
                    className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-none"
                  >
                    Note
                  </Button>
                  <Button 
                    variant={activeTab === 'whatsapp'} 
                    size="sm"
                    onClick={() => setActiveTab('whatsapp')}
                    className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-none"
                  >
                    WhatsApp
                  </Button>
                  <Button 
                  variant={activeTab === 'email'} 
                  size="sm"
                  onClick={() => setActiveTab('email')}
                  className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-none"
                >
                  Email
                </Button>
                <Button 
                  variant={activeTab === 'create-email'} 
                  size="sm"
                  onClick={() => setActiveTab('create-email')}
                  className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-none"
                >
                  Create Email
                </Button>
                <Button 
                  variant={activeTab === 'activity'} 
                  size="sm"
                  onClick={() => setActiveTab('activity')}
                  className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-none"
                >
                  Activity
                </Button>
                <Button 
                  variant={activeTab === 'quotation'} 
                  size="sm"
                  onClick={() => setActiveTab('quotation')}
                  className="flex-1 bg-crm-primary hover:bg-crm-primary-hover text-white rounded-l-none"
                >
                  Quotation
                </Button>
              </div>
            </DrawerHeader>
          
            <div className="flex-1 overflow-hidden">
              {activeTab === 'help' && (
                 <div className="px-6 py-6">
                  <h2 className="text-xl font-semibold mb-4">Help</h2>
                  <p className="text-gray-600">Help integration will be implemented here.</p>
                </div>
              )}
              
              {/* Tab content untuk tab lainnya */}
              {activeTab === 'note' && (
              <div className="px-6 py-6">
                <h2 className="text-xl font-semibold mb-6">Notes</h2>
                
                <form className="space-y-6">
                  {/* Catatan Kebutuhan */}
                  <div className="space-y-2">
                    <label htmlFor="requirements" className="text-sm font-medium text-gray-700">
                      Catatan Kebutuhan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="requirements"
                      rows={4}
                      placeholder="Tulis catatan kebutuhan lead di sini..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      required
                    />
                  </div>

                  {/* Catatan Kendala */}
                  <div className="space-y-2">
                    <label htmlFor="obstacles" className="text-sm font-medium text-gray-700">
                      Catatan Kendala
                    </label>
                    <textarea
                      id="obstacles"
                      rows={4}
                      placeholder="Tulis catatan kendala atau masalah yang dihadapi..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    />
                  </div>

                  {/* @Tag Select */}
                  <div className="space-y-2">
                    <label htmlFor="assignee" className="text-sm font-medium text-gray-700">
                      @Tag
                    </label>
                    <select
                      name="assignee"
                      className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih nama untuk di-tag</option>
                      <option value="1">Admin</option>
                      <option value="2">Sales 1</option>
                      <option value="3">Sales 2</option>
                      <option value="4">Manager</option>
                      {/* TODO: Load users from API */}
                    </select>
                    <p className="text-xs text-gray-500">
                      Pilih nama untuk memberikan notifikasi dan assignment
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Reset form logic
                        document.querySelector('form').reset()
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={async (e) => {
                        e.preventDefault()
                        
                        if (!selectedLead?.id) {
                          alert('No lead selected')
                          return
                        }

                        try {
                          // Ambil data dari form
                          const requirements = document.getElementById('requirements').value
                          const obstacles = document.getElementById('obstacles').value
                          const assigneeSelect = document.querySelector('select[name="assignee"]')
                          const assignee = assigneeSelect?.value

                          // Gabungkan notes menjadi satu string
                          let noteText = ''
                          if (requirements) {
                            noteText += `Kebutuhan: ${requirements}\n\n`
                          }
                          if (obstacles) {
                            noteText += `Kendala: ${obstacles}\n\n`
                          }
                          if (assignee) {
                            noteText += `Tagged: ${assignee}\n\n`
                          }
                          noteText += `Last updated: ${new Date().toLocaleString()}`

                          // Update lead dengan notes baru
                          const updateData = {
                            note: noteText
                          }
                          
                          // Jika ada assignee, tambahkan ke update data
                          if (assignee && assignee !== 'none') {
                            updateData.user_id = parseInt(assignee)
                            updateData.tag = parseInt(assignee) // Untuk tagging
                          }

                          console.log('Saving note for lead:', selectedLead.id, updateData)

                          const response = await handleUpdateLead(selectedLead.id, updateData)
                          
                          // Update selectedLead dengan data baru
                          setSelectedLead(prev => ({
                            ...prev,
                            notes: noteText
                          }))

                          alert('Note berhasil disimpan!')
                          
                          // Reset form
                          document.querySelector('form').reset()
                          
                        } catch (error) {
                          console.error('Error saving note:', error)
                          alert('Failed to save note. Please try again.')
                        }
                      }}
                    >
                      Save Note
                    </Button>
                  </div>
                </form>

              </div>
            )}
              
              {activeTab === 'whatsapp' && (
                <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
                  {/* Lead Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedLead?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedLead?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedLead?.name || 'No Name'}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedLead?.email || 'No Email'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedLead?.phone || 'No Phone'}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status Badges - Menampilkan stages sebenarnya */}
                  <div className="space-y-3">
                    <div className="flex flex-row w-full">
                      {stages.map((stage, index) => {
                        const isCurrentStage = selectedLead?.stage === stage.id
                        const isCompletedStage = selectedLead?.stage && stages.findIndex(s => s.id === selectedLead.stage) > index
                        const isFirstStage = index === 0
                        const isLastStage = index === stages.length - 1
                        
                        // Determine badge styling
                        let badgeClasses = "flex-1 justify-center border-r-0 "
                        
                        // Rounded corners
                        if (isFirstStage) {
                          badgeClasses += "rounded-r-none "
                        } else if (isLastStage) {
                          badgeClasses += "rounded-l-none "
                        } else {
                          badgeClasses += "rounded-none "
                        }
                        
                        // Colors based on stage status
                        if (isCurrentStage) {
                          // Current stage - highlighted in blue
                          badgeClasses += "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 font-medium"
                        } else if (isCompletedStage) {
                          // Completed stages - green with checkmark
                          badgeClasses += "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                        } else {
                          // Future stages - gray
                          badgeClasses += "bg-gray-50 text-gray-600 hover:bg-gray-50 border-gray-200"
                        }
                        
                        return (
                          <Badge
                            key={stage.id}
                            variant="outline"
                            className={badgeClasses}
                            title={`Stage: ${stage.name}${isCurrentStage ? ' (Current)' : ''}`}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              {(isCurrentStage || isCompletedStage) && (
                                <span className="text-xs">
                                  {isCurrentStage ? '●' : '✓'}
                                </span>
                              )}
                              <span className="truncate text-xs">
                                {stage.name}
                              </span>
                            </div>
                          </Badge>
                        )
                      })}
                    </div>

                    {/* Progress Bar */}
                    {/* {selectedLead?.stage && stages.length > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((stages.findIndex(s => s.id === selectedLead.stage) + 1) / stages.length) * 100}%`
                          }}
                        />
                      </div>
                    )} */}

                    {/* Current Stage Info */}
                    {selectedLead?.stage && (
                      <div className="text-center text-sm text-gray-600">
                        Stage {stages.findIndex(s => s.id === selectedLead.stage) + 1} dari {stages.length}: 
                        <span className="font-medium text-blue-600 ml-1">
                          {stages.find(s => s.id === selectedLead.stage)?.name || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Layout dengan Accordion dan Chat Preview */}
                  <div className="flex gap-6 h-full">
                    {/* Accordion Section */}
                    <div className="flex-1">
                      <Accordion 
                        type="multiple" 
                        value={accordionValue} 
                        onValueChange={setAccordionValue}
                        className="w-full"
                      >
                        {/* Lead Details */}
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-base font-medium">Lead Details</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Company</label>
                                <p className="text-sm text-black mt-1">{selectedLead?.company || 'No Company'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Value</label>
                                <p className="text-sm text-black mt-1">${selectedLead?.value || 0}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Priority</label>
                                <p className="text-sm text-black mt-1">{selectedLead?.priority || 'Medium'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Created</label>
                                <p className="text-sm text-black mt-1">{selectedLead?.created_at || 'Unknown'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-500">Lead source</label>
                              <p className="text-sm text-black mt-1">{selectedLead?.source || 'Unknown'}</p>
                              <p className="text-sm text-gray-500 mt-1">Last activity: {selectedLead?.lastActivity || 'Unknown'}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Lead Details Extended */}
                        <AccordionItem value="notes">
                          <AccordionTrigger className="text-base font-medium">
                            <div className="flex items-center justify-between w-full mr-4">
                              <span>Lead Information</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {/* Basic Info Grid */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Name</label>
                                  <p className="text-sm text-black mt-1">{selectedLead?.name || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Phone</label>
                                  <p className="text-sm text-black mt-1">{selectedLead?.phone || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Source</label>
                                  <p className="text-sm text-blue-600 mt-1">{selectedLead?.source || 'Unknown'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Track ID</label>
                                  <p className="text-sm text-black mt-1">{selectedLead?.id || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Keyword</label>
                                  <p className="text-sm text-black mt-1">{selectedLead?.keyword || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Amount</label>
                                  <p className="text-sm text-black mt-1">Rp {selectedLead?.value?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-gray-500">City</label>
                                  <p className="text-sm text-black mt-1">{selectedLead?.city || '-'}</p>
                                </div>
                              </div>

                              <hr className="my-4" />

                              {/* Responsible Section */}
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Responsible</label>
                                  <select 
                                    name="responsible"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={selectedLead?.responsible || ''}
                                  >
                                    <option value="">Select Responsible</option>
                                    <option value="kosong">Kosong</option>
                                    <option value="1">Admin</option>
                                    <option value="2">Sales 1</option>
                                    <option value="3">Sales 2</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-500">Automation Reason Assigning</label>
                                  <textarea 
                                    name="automation_reason"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="2"
                                    placeholder="Enter automation reason..."
                                    defaultValue={selectedLead?.automation_reason || ''}
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-500">Automation Supervisor Advice</label>
                                  <textarea 
                                    name="supervisor_advice"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="2" 
                                    placeholder="Enter supervisor advice..."
                                    defaultValue={selectedLead?.supervisor_advice || ''}
                                  />
                                </div>
                              </div>

                              <hr className="my-4" />

                              {/* Chat Score Opportunity */}
                              <div>
                                <label className="text-sm font-medium text-gray-500 block mb-2">Chat Score Opportunity</label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-gray-400">Score</label>
                                    <input 
                                      type="number"
                                      name="chat_score"
                                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="0-100"
                                      min="0"
                                      max="100"
                                      defaultValue={selectedLead?.chat_score || ''}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-400">Reason</label>
                                    <input 
                                      type="text"
                                      name="score_reason"
                                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Enter reason..."
                                      defaultValue={selectedLead?.score_reason || ''}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Save Button */}
                              <div className="pt-4 border-t">
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                  onClick={async () => {
                                    if (!selectedLead?.id) {
                                      alert('No lead selected')
                                      return
                                    }

                                    try {
                                      // Ambil data dari form
                                      const responsible = document.querySelector('select[name="responsible"]')?.value
                                      const automationReason = document.querySelector('textarea[name="automation_reason"]')?.value
                                      const supervisorAdvice = document.querySelector('textarea[name="supervisor_advice"]')?.value
                                      const chatScore = document.querySelector('input[name="chat_score"]')?.value
                                      const scoreReason = document.querySelector('input[name="score_reason"]')?.value

                                      const updateData = {}
                                      
                                      // Update hanya field yang diubah
                                      if (responsible !== undefined && responsible !== selectedLead.responsible) {
                                        updateData.user_id = responsible === '' ? null : parseInt(responsible)
                                      }
                                      if (automationReason !== selectedLead.automation_reason) {
                                        updateData.sales_assign_reason = automationReason
                                      }
                                      if (supervisorAdvice !== selectedLead.supervisor_advice) {
                                        updateData.supervisor_ai_advice = supervisorAdvice
                                      }
                                      if (chatScore !== selectedLead.chat_score) {
                                        updateData.lead_opportunity_score = chatScore
                                      }
                                      if (scoreReason !== selectedLead.score_reason) {
                                        updateData.lead_opportunity_reason = scoreReason
                                      }

                                      if (Object.keys(updateData).length === 0) {
                                        alert('No changes to save')
                                        return
                                      }

                                      console.log('Saving lead information:', selectedLead.id, updateData)
                                      
                                      const response = await handleUpdateLead(selectedLead.id, updateData)
                                      
                                      // Update selectedLead dengan data baru
                                      setSelectedLead(prev => ({
                                        ...prev,
                                        ...updateData,
                                        responsible: responsible || prev.responsible,
                                        automation_reason: automationReason || prev.automation_reason,
                                        supervisor_advice: supervisorAdvice || prev.supervisor_advice,
                                        chat_score: chatScore || prev.chat_score,
                                        score_reason: scoreReason || prev.score_reason
                                      }))

                                      alert('Lead information saved successfully!')
                                      
                                    } catch (error) {
                                      console.error('Error saving lead information:', error)
                                      alert('Failed to save lead information. Please try again.')
                                    }
                                  }}
                                >
                                  Save Information
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Chat Preview - Selalu muncul di samping accordion */}
                    <div className="flex-1 border-l pl-6">
                      <div className="h-full">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Chat Preview
                        </h3>
                        <ChatInterface lead={selectedLead} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'email' && (
                <div className="px-6 py-6">
                  <h2 className="text-xl font-semibold mb-4">Email</h2>
                  <p className="text-gray-600">Email functionality will be implemented here.</p>
                </div>
              )}
              
              {activeTab === 'create-email' && (
                  <div className="px-6 py-6">
                  <h2 className="text-xl font-semibold mb-6">Create Email</h2>
                  
                  <form className="space-y-6">
                    {/* Kepada Field */}
                    <div className="space-y-2">
                      <label htmlFor="to" className="text-sm font-medium text-gray-700">
                        Kepada <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="to"
                        type="email"
                        placeholder="Masukkan alamat email penerima"
                        className="w-full"
                        required
                      />
                    </div>
                  
                    {/* CC Field */}
                    <div className="space-y-2">
                      <label htmlFor="cc" className="text-sm font-medium text-gray-700">
                        CC
                      </label>
                      <Input
                        id="cc"
                        type="email"
                        placeholder="Masukkan alamat email CC (opsional)"
                        className="w-full"
                      />
                    </div>
                  
                    {/* Subjek Field */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                        Subjek <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Masukkan subjek email"
                        className="w-full"
                        required
                      />
                    </div>
                  
                    {/* Pesan Field */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Pesan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={8}
                        placeholder="Tulis pesan email Anda di sini..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                        required
                      />
                    </div>
                  
                    {/* File Uploader */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Lampiran
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            // Handle file upload logic here
                            console.log('Files selected:', e.target.files)
                          }}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                              Klik untuk upload file
                            </span>
                            {' '}atau drag and drop
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF, DOC hingga 10MB
                          </p>
                        </label>
                      </div>
                      
                      {/* File List Preview (akan muncul setelah file dipilih) */}
                      <div id="file-list" className="space-y-2 mt-3">
                        {/* File items akan ditampilkan di sini setelah upload */}
                      </div>
                    </div>
                  
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Reset form logic
                          document.querySelector('form').reset()
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Save as draft logic
                          console.log('Save as draft')
                        }}
                      >
                        Simpan Draft
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                          e.preventDefault()
                          // Send email logic
                          console.log('Send email')
                        }}
                      >
                        Kirim Email
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="px-6 py-6">
                  <h2 className="text-xl font-semibold mb-4">Activity</h2>
                  <p className="text-gray-600">Activity timeline will be implemented here.</p>
                </div>
              )}
              
              {activeTab === 'quotation' && (
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Quotation</h2>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setShowQuotationModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Quotation
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada quotation</h3>
                    <p className="text-gray-600 mb-4">Mulai buat quotation pertama untuk lead ini</p>
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
        
        {/* Custom Quotation Modal */}
        {showQuotationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black opacity-20" 
              onClick={() => setShowQuotationModal(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Buat Quotation Baru</h2>
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto h-[calc(90vh-80px)]">
                <QuotationModal selectedLead={selectedLead} />
              </div>
            </div>
          </div>
        )}
        </div>
      </DndProvider>
  )
}

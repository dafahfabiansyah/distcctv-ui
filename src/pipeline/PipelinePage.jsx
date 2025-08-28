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
          <LeadCard key={lead.id} lead={lead} onLeadClick={onLeadClick} />
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

  // Debug: log pipelineId
  console.log('PipelinePage - pipelineId:', pipelineId)
  console.log('PipelinePage - leadsData length:', leadsData.length)
  console.log('PipelinePage - stages length:', stages.length)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    sales: "",
    search: "",
    sort: "newest"
  })

  // Fetch stages dari API
  const fetchStages = async () => {
    try {
      console.time('fetchStages')
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
        console.timeEnd('fetchStages')
        return stagesFromAPI
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
      console.timeEnd('fetchStages')
    }
    
    // Return empty array if no stages found
    console.log('No stages found, returning empty array')
    console.timeEnd('fetchStages')
    return []
  }

  // Fetch data leads dari API (tanpa fetch stages)
  const fetchLeads = async (currentStages = stages) => {
    console.log('fetchLeads called with pipelineId:', pipelineId)
    
    if (!pipelineId) {
      console.log('No pipelineId provided')
      setError('Pipeline ID is required')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.time('fetchLeads')
      console.log('Fetching leads data...')
      const response = await pipelineService.getLeads(pipelineId, filters)
      
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
            stage: lead.lead_on_stage ? lead.lead_on_stage.stage_id : currentStages[0]?.id || null,
            value: lead.amount || 0,
            source: lead.source_name || 'Unknown',
            lastActivity: lead.updated_at,
            priority: 'medium',
            tags: [],
            notes: lead.note || '',
            created_at: lead.created_at,
            updated_at: lead.updated_at,
            time: lead.updated_at,
            avatar: '/diverse-woman-portrait.png' // Default avatar
          })
        })
        
        console.log('Transformed leads:', transformedLeads)
        
        // Update stage counts
        const updatedStages = currentStages.map(stage => ({
          ...stage,
          count: transformedLeads.filter(lead => lead.stage === stage.id).length
        }))
        
        console.log('Updated stages with counts:', updatedStages)
        
        setLeadsData(transformedLeads)
        setStages(updatedStages)
        console.timeEnd('fetchLeads')
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      console.timeEnd('fetchLeads')
      setError('Failed to fetch leads data')
    } finally {
      setLoading(false)
    }
  }

  // Effect untuk fetch stages ketika pipelineId berubah
  useEffect(() => {
    const initializeStages = async () => {
      if (pipelineId) {
        console.log('Initializing stages for pipeline:', pipelineId)
        const stagesData = await fetchStages()
        setStages(stagesData)
        // Setelah stages loaded, fetch leads
        if (stagesData.length > 0) {
          fetchLeads(stagesData)
        }
      }
    }
    
    initializeStages()
  }, [pipelineId])

  // Effect untuk fetch data ketika filter berubah dengan debouncing
  useEffect(() => {
    if (pipelineId && !loading && stages.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchLeads(stages)
      }, 300) // 300ms debounce
      
      return () => clearTimeout(timeoutId)
    }
  }, [filters.dateFrom, filters.dateTo, filters.sales, filters.search])

  const handleLeadClick = (lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const handleMoveLead = async (lead, targetStageId) => {
    // Jika sudah di stage yang sama, tidak perlu pindah
    if (lead.stage === targetStageId) return
    
    // Prevent multiple concurrent operations
    if (loading) {
      console.log('Another operation is in progress, skipping drag operation')
      return
    }

    const originalStageId = lead.stage
    console.log(`Moving lead ${lead.id} from stage ${originalStageId} to stage ${targetStageId}`)

    // Update leads data - ubah stage dari lead yang dipindah
    setLeadsData(prev => {
      return prev.map(l => {
        if (l.id === lead.id) {
          return { ...l, stage: targetStageId }
        }
        return l
      })
    })

    // Update stage counts
    setStages(prev => {
      return prev.map(stage => {
        if (stage.id === originalStageId) {
          // Kurangi count dari stage lama
          return { ...stage, count: Math.max(0, stage.count - 1) }
        } else if (stage.id === targetStageId) {
          // Tambah count ke stage baru
          return { ...stage, count: stage.count + 1 }
        }
        return stage
      })
    })

    try {
      // Kirim update ke backend
      await pipelineService.updateLeadStage(lead.id, targetStageId)
      console.log('Lead stage updated successfully:', lead.id, 'to stage:', targetStageId)
    } catch (error) {
      console.error('Error updating lead stage:', error)
      
      // Rollback jika gagal
      setLeadsData(prev => {
        return prev.map(l => {
          if (l.id === lead.id) {
            return { ...l, stage: originalStageId } // kembalikan ke stage semula
          }
          return l
        })
      })
      
      // Rollback stage counts
      setStages(prev => {
        return prev.map(stage => {
          if (stage.id === originalStageId) {
            return { ...stage, count: stage.count + 1 }
          } else if (stage.id === targetStageId) {
            return { ...stage, count: Math.max(0, stage.count - 1) }
          }
          return stage
        })
      })
      
      // Tampilkan error message
      alert('Failed to update lead stage. Please try again.')
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
    setFilters({
      dateFrom: "",
      dateTo: "",
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading pipeline data...</p>
              <p className="mt-1 text-gray-400 text-sm">This may take a few seconds</p>
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
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih nama untuk di-tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="esther-howard">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              EH
                            </div>
                            <span>Esther Howard</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="jenny-wilson">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              JW
                            </div>
                            <span>Jenny Wilson</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="wade-warren">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              WW
                            </div>
                            <span>Wade Warren</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                      onClick={(e) => {
                        e.preventDefault()
                        // Save note logic
                        const formData = {
                          requirements: document.getElementById('requirements').value,
                          obstacles: document.getElementById('obstacles').value,
                          assignee: document.querySelector('[name="assignee"]')?.value,
                          priority: document.querySelector('[name="priority"]')?.value,
                          followupDate: document.getElementById('followup-date').value,
                          timestamp: new Date().toISOString(),
                          leadId: selectedLead?.id
                        }
                        console.log('Saving note:', formData)
                        // Here you would typically send this to your API
                        alert('Note berhasil disimpan!')
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

                  {/* Status Badges - Tetap di atas tanpa accordion */}
                  <div className="flex flex-row w-full">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-r-none border-r-0 flex-1 justify-center">✓ New</Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-none border-r-0 flex-1 justify-center">✓ Open</Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-none border-r-0 flex-1 justify-center">In Progress</Badge>
                    <Badge variant="outline" className="text-gray-600 bg-gray-50 rounded-none border-r-0 flex-1 justify-center">Open deals</Badge>
                    <Badge variant="outline" className="text-gray-600 bg-gray-50 rounded-l-none flex-1 justify-center">Closed</Badge>
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

                        {/* Notes */}
                        <AccordionItem value="notes">
                          <AccordionTrigger className="text-base font-medium">
                            <div className="flex items-center justify-between w-full mr-4">
                              <span>Notes</span>
                              <Button variant="link" size="sm" className="text-crm-primary p-0 h-auto">
                                Add note
                              </Button>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {selectedLead?.notes ? (
                                <div className="border-l-2 border-gray-200 pl-4">
                                  <p className="text-sm text-gray-600">{selectedLead.notes}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No notes available</p>
                              )}
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

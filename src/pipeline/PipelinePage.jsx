"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
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
import { Phone, Clock, Plus, MoreHorizontal, Eye, GripVertical, Filter, MessageSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ChatInterface from "@/components/ChatInterface"
import pipelineService from "@/services/pipeline"
import { useBatchChatStatus, useLeadChatStatus } from "@/hooks/useChatStatus"
import "./PipelinePage.css"


const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  
  // Format: "3 Sep 2025, 14:30"
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


// Lead Card Component dengan Drag
function LeadCard({ lead, onLeadClick, onUpdateLead, batchChatStatus }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'lead',
    item: { id: lead.id, lead },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Ambil chat status dari batch data (tidak perlu individual fetch lagi)
  const chatStatus = batchChatStatus?.[lead.phone] || null
  const latestChatMessage = chatStatus?.latest_chat?.body || ''

  const handleClick = (e) => {
    // Jangan trigger click jika sedang drag
    if (!isDragging) {
      onLeadClick(lead)
    }
  }

  // Helper untuk menentukan apakah lead ada di stage closing (11 atau 12)
  const isDontCreateBadge = () => {
    return lead.lead_on_stage && (lead.lead_on_stage.stage_id === 11 || lead.lead_on_stage.stage_id === 12)
  }

  // Helper untuk menentukan posisi Call Count badge
  const getCallCountBadgePosition = () => {
    // Check if Follow Up badge exists
    const hasFollowUpBadge = chatStatus && chatStatus.latest_chat && chatStatus.latest_chat.need_follow_up === true && !isDontCreateBadge()
    
    if (hasFollowUpBadge) {
      // If Follow Up exists, position Call Count right below it
      return '28px' // 28px below Follow Up badge
    } else {
      // If no Follow Up, check for HOT badge
      const hasHotBadge = chatStatus && chatStatus.chat_hot && chatStatus.chat_hot.intense === true && !isDontCreateBadge()
      if (hasHotBadge) {
        return '52px' // Position below HOT badge (which is at 24px + 28px)
      } else {
        return '0px' // Position at top if no other badges
      }
    }
  }

  // Helper untuk menentukan apakah HOT badge harus ditampilkan
  const shouldShowHotBadge = () => {
    const hasFollowUpBadge = chatStatus && chatStatus.latest_chat && chatStatus.latest_chat.need_follow_up === true && !isDontCreateBadge()
    const hasHotBadge = chatStatus && chatStatus.chat_hot && chatStatus.chat_hot.intense === true && !isDontCreateBadge()
    
    // Jika ada Follow Up badge, jangan tampilkan HOT badge
    return hasHotBadge && !hasFollowUpBadge
  }

  // Format Rupiah
  const formatRupiah = (amount) => {
    if (!amount || amount === 0) return ''
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card
      ref={drag}
      className={`cursor-pointer hover:shadow-md transition-all relative ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      }`}
    >
      {/* Badge Container - positioned absolutely */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        {/* No Quotation Badge */}
        {lead.quotation && lead.quotation.length === 0 && lead.amount === 0 && !isDontCreateBadge() && (
          <div className="absolute top-0 left-0 bg-yellow-500 text-white px-2 py-1 rounded-br text-xs font-bold">
            NO QUOTE
          </div>
        )}

        {/* Follow Up Badge */}
        {chatStatus && chatStatus.latest_chat && chatStatus.latest_chat.need_follow_up === true && !isDontCreateBadge() && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-bl text-xs font-bold">
            FOLLOW UP
          </div>
        )}

        {/* HOT Badge - hanya tampil jika tidak ada Follow Up badge */}
        {shouldShowHotBadge() && (
          <div className="absolute top-6 right-0 bg-red-500 text-white px-2 py-1 rounded-bl text-xs font-bold">
            HOT
          </div>
        )}

        {/* Call Count Badge - positioned dynamically below other badges */}
        {!isDontCreateBadge() && lead.call_count && lead.call_count > 0 && (
          <div 
            className="absolute right-0 bg-green-500 text-white px-2 py-1 rounded-bl text-xs font-bold flex items-center"
            style={{ top: getCallCountBadgePosition() }}
          >
            <Phone className="h-3 w-3 mr-1" />
            {lead.call_count}
          </div>
        )}
      </div>

      <CardContent className="p-4 pt-6" onClick={handleClick}>
        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Lead Info */}
            <div className="flex justify-between items-start mb-2">
              <h4 className={`font-medium truncate ${lead.name ? 'text-black' : 'text-red-500'}`}>
                {lead.name || `No Name (${lead.source_name || 'Unknown'})`}
              </h4>
              <span className="text-sm text-blue-600 font-semibold ml-2">
                {formatRupiah(lead.amount)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <Phone className="h-3 w-3" />
              <span>{lead.phone || ''}</span>
            </div>

            {/* Latest Chat Message */}
            {latestChatMessage && (
              <div className="bg-red-50 border-2 border-red-200 p-2 rounded text-xs text-red-700 font-bold mb-2 max-h-15 overflow-hidden">
                {latestChatMessage}
              </div>
            )}

            <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
              <Clock className="h-3 w-3" />
              <span className="truncate">{formatDate(lead.created_at)}</span>
            </div>

            {/* Sales Info */}
            <div className="text-xs text-blue-600 font-semibold mt-1">
              {lead.user && lead.user.name}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stage Column Component dengan Drop
function StageColumn({ stage, leads, onLeadClick, onMoveLead, onUpdateLead, batchChatStatus }) {
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
      className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm h-[750px] transition-colors ${
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

      {/* Cards Area with fixed height and scrollable */}
      <div className="h-[680px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {leads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onLeadClick={onLeadClick}
            onUpdateLead={onUpdateLead}
            batchChatStatus={batchChatStatus}
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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("whatsapp")
  const [leadsData, setLeadsData] = useState([])
  const [stages, setStages] = useState([])
  const [salesData, setSalesData] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [accordionValue, setAccordionValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Horizontal drag states
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })
  const pipelineContainerRef = React.useRef(null)

  // Quotation states
  const [quotations, setQuotations] = useState([])
  const [showCreateQuotationModal, setShowCreateQuotationModal] = useState(false)
  const [showUpdateQuotationModal, setShowUpdateQuotationModal] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [quotationProducts, setQuotationProducts] = useState([])
  const [loadingQuotations, setLoadingQuotations] = useState(false)

  // Email states
  const [emails, setEmails] = useState([])
  const [loadingEmails, setLoadingEmails] = useState(false)

  // Activity states
  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [activityForm, setActivityForm] = useState({
    tag: '',
    comment: ''
  })

  // Help states
  const [helpMessage, setHelpMessage] = useState('')
  const [loadingHelp, setLoadingHelp] = useState(false)
  const [helpError, setHelpError] = useState(null)

  // Email form states
  const [emailForm, setEmailForm] = useState({
    to: '',
    cc: '',
    subject: '',
    message: ''
  })
  const [emailAttachments, setEmailAttachments] = useState([])
  const [sendingEmail, setSendingEmail] = useState(false)

  // Batch Chat Status - fetch semua chat status sekaligus
  const { data: batchChatStatus, isLoading: isLoadingChatStatus, error: chatStatusError } = useBatchChatStatus(leadsData)
  
  // Debug chat status
  useEffect(() => {
    if (batchChatStatus) {
      console.log('📊 Batch Chat Status loaded for', Object.keys(batchChatStatus).length, 'phones')
    }
  }, [batchChatStatus])

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

  // Fetch sales data dari API
  const fetchSales = async () => {
    try {
      console.log('Fetching sales data...')
      const response = await pipelineService.getSales()
      console.log('Sales API Response:', response)
      
      if (response && response.success && response.data) {
        setSalesData(response.data)
        console.log('Sales data loaded:', response.data)
      } else {
        console.log('Sales API response invalid:', response)
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    }
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
    fetchSales() // Load sales data on component mount
  }, [pipelineId])

  // Effect untuk fetch data ketika filter berubah
  useEffect(() => {
    if (pipelineId) {
      fetchLeads()
    }
  }, [filters.dateFrom, filters.dateTo, filters.sales, filters.search])

  // Effect untuk auto-fill email form ketika tab create-email dibuka
  useEffect(() => {
    if (activeTab === 'create-email' && selectedLead) {
      // Auto-fill recipient email if available
      if (selectedLead.email) {
        setEmailForm(prev => ({
          ...prev,
          to: selectedLead.email
        }))
      }
    }
  }, [activeTab, selectedLead])

  const handleLeadClick = (lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
    // Fetch quotations when lead is selected
    fetchQuotations(lead.id)
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

  // Quotation functions
  const fetchQuotations = async (leadId) => {
    if (!leadId) return
    
    try {
      setLoadingQuotations(true)
      const response = await pipelineService.getQuotations(leadId)
      setQuotations(response.quotations || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
      setQuotations([])
    } finally {
      setLoadingQuotations(false)
    }
  }

  // Email functions
  const fetchEmails = async (leadId) => {
    if (!leadId) return
    
    try {
      setLoadingEmails(true)
      const response = await pipelineService.getEmails(leadId)
      console.log('Email API response:', response) // Debug log
      setEmails(response.emails || [])
    } catch (error) {
      console.error('Error fetching emails:', error)
      setEmails([])
    } finally {
      setLoadingEmails(false)
    }
  }

  const handleEmailClick = (email) => {
    // Debug: log email object to see its structure
    console.log('Email clicked:', email)
    
    // Try different possible ID fields
    const emailId = email.mailId
    
    // Redirect to email detail page (Laravel route)
    if (emailId) {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000'
      const url = `${baseUrl}/inbox/email/show/${emailId}`
      console.log('Redirecting to:', url)
      window.location.href = url
    } else {
      console.warn('Email ID not found in any expected field:', email)
      alert('Cannot open email: ID not found')
    }
  }

  // Activity functions
  const fetchActivities = async (leadId) => {
    if (!leadId) return
    
    try {
      setLoadingActivities(true)
      const response = await pipelineService.getActivities(leadId)
      console.log('Activities API response:', response) // Debug log
      
      // Additional debug for activity structure
      if (response.activities && response.activities.length > 0) {
        console.log('First activity structure:', response.activities[0])
      }
      
      setActivities(response.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleActivityFormChange = (field, value) => {
    setActivityForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveComment = async () => {
    if (!selectedLead?.id) return
    
    if (!activityForm.comment.trim()) {
      alert('Please enter a comment')
      return
    }
    
    try {
      console.log('Saving comment:', {
        leadId: selectedLead.id,
        comment: activityForm.comment,
        tag: activityForm.tag
      })
      
      // Call API to save comment
      await pipelineService.saveComment(selectedLead.id, activityForm)
      
      // Reset form
      setActivityForm({ tag: '', comment: '' })
      
      // Refresh activities
      await fetchActivities(selectedLead.id)
      
      alert('Comment saved successfully!')
    } catch (error) {
      console.error('Error saving comment:', error)
      alert('Failed to save comment: ' + error.message)
    }
  }

  const handleLogCall = async () => {
    if (!selectedLead?.id) return
    
    try {
      console.log('Logging call:', {
        leadId: selectedLead.id,
        comment: activityForm.comment,
        tag: activityForm.tag
      })
      
      // TODO: Call API to log call
      // await pipelineService.logCall(selectedLead.id, activityForm)
      
      // Reset form
      setActivityForm({ tag: '', comment: '' })
      
      // Refresh activities
      fetchActivities(selectedLead.id)
      
      alert('Call logged successfully!')
    } catch (error) {
      console.error('Error logging call:', error)
      alert('Failed to log call')
    }
  }

  // Fetch AI Helper
  const fetchAiHelper = async (leadId) => {
    if (!leadId) return
    
    setLoadingHelp(true)
    setHelpError(null)
    
    try {
      const response = await pipelineService.getAiHelper(leadId)
      console.log('AI Helper response:', response)
      
      setHelpMessage(response.message || 'No help message available')
    } catch (error) {
      console.error('Error fetching AI helper:', error)
      setHelpError('Failed to load AI helper')
      setHelpMessage('')
    } finally {
      setLoadingHelp(false)
    }
  }

  // Email functions
  const handleEmailFormChange = (field, value) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setEmailAttachments(files)
  }

  const handleSendEmail = async () => {
    if (!selectedLead?.id) return
    
    // Validation
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      alert('Please fill in all required fields (To, Subject, Message)')
      return
    }

    setSendingEmail(true)
    
    try {
      // Create FormData for file uploads
      const formData = new FormData()
      formData.append('lead_id', selectedLead.id)
      formData.append('to', emailForm.to)
      formData.append('cc', emailForm.cc)
      formData.append('subject', emailForm.subject)
      formData.append('message', emailForm.message)
      
      // Add attachments if any
      emailAttachments.forEach((file, index) => {
        formData.append(`attachment[]`, file)
      })

      // Use the same endpoint as the Laravel version
      const token = localStorage.getItem('access_token')
      const response = await fetch('/inbox/email/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Email sent successfully:', result)

      // Reset form
      setEmailForm({
        to: '',
        cc: '',
        subject: '',
        message: ''
      })
      setEmailAttachments([])
      
      // Reset file input
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''

      // Refresh emails list
      fetchEmails(selectedLead.id)
      
      // Switch back to email list tab
      setActiveTab('email')
      
      alert('Email sent successfully!')
      
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const resetEmailForm = () => {
    setEmailForm({
      to: '',
      cc: '',
      subject: '',
      message: ''
    })
    setEmailAttachments([])
    
    // Reset file input
    const fileInput = document.getElementById('file-upload')
    if (fileInput) fileInput.value = ''
  }

  const handleCreateQuotation = async (quotationData) => {
    if (!selectedLead?.id) return

    try {
      // Validate that there's at least one product
      if (quotationProducts.length === 0) {
        alert('Please add at least one product to the quotation.')
        return
      }

      // Validate products data
      const invalidProduct = quotationProducts.find(product => 
        !product.product_name.trim() || 
        !product.unit.trim() || 
        product.qty <= 0 || 
        product.price <= 0
      )

      if (invalidProduct) {
        alert('Please fill in all required fields for each product (Product Name, Qty > 0, Unit, Price > 0).')
        return
      }


      // Convert FormData to match backend expectations with [] notation
      const data = new FormData()
      data.append('lead_id', String(selectedLead.id))
      data.append('duedate', String(quotationData.get('duedate') || ''))

      // Ensure we always send arrays, even if empty
      const productNames = []
      const quantities = []
      const units = []
      const prices = []
      const ppns = []
      const discounts = []

      // Collect all product data
      quotationProducts.forEach((product, index) => {
        productNames.push(String(product.product_name || ''))
        quantities.push(String(product.qty || 0))
        units.push(String(product.unit || ''))
        prices.push(String(product.price || 0))
        ppns.push(String(product.ppn || 0))
        discounts.push(String(product.discount || 0))
      })

      // If no products, add empty arrays
      if (productNames.length === 0) {
        productNames.push('')
        quantities.push('0')
        units.push('')
        prices.push('0')
        ppns.push('0')
        discounts.push('0')
      }

      // Add all products to FormData
      productNames.forEach((name, index) => {
        data.append('product_name[]', name)
        data.append('qty[]', quantities[index])
        data.append('unit[]', units[index])
        data.append('price[]', prices[index])
        data.append('ppn[]', ppns[index])
        data.append('discount[]', discounts[index])
      })

      console.log('Creating quotation with FormData:')
      console.log('Products data:', quotationProducts)
      console.log('FormData entries:')
      for (let pair of data.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      const response = await pipelineService.createQuotation(selectedLead.id, data)
      await fetchQuotations(selectedLead.id) // Reload quotations
      setShowCreateQuotationModal(false)
      setQuotationProducts([]) // Reset products
      alert('Quotation created successfully!')
      return response
    } catch (error) {
      console.error('Error creating quotation:', error)
      alert('Failed to create quotation. Please try again.')
      throw error
    }
  }

  const handleUpdateQuotation = async (quotationData) => {
    if (!selectedQuotation?.id) return

    try {
      // Validate that there's at least one product
      if (quotationProducts.length === 0) {
        alert('Please add at least one product to the quotation.')
        return
      }

      // Validate products data
      const invalidProduct = quotationProducts.find(product => 
        !product.product_name.trim() || 
        !product.unit.trim() || 
        product.qty <= 0 || 
        product.price <= 0
      )

      if (invalidProduct) {
        alert('Please fill in all required fields for each product (Product Name, Qty > 0, Unit, Price > 0).')
        return
      }


      // Convert FormData to JSON object for Sanctum API
      // Backend expects form data format with [] notation, not JSON arrays
      const data = new FormData()
      data.append('quotation_id', String(selectedQuotation.id))
      data.append('lead_id', String(selectedLead.id))
      data.append('duedate', String(quotationData.get('duedate') || ''))

      // Ensure we always send arrays, even if empty
      const productNames = []
      const quantities = []
      const units = []
      const prices = []
      const ppns = []
      const discounts = []

      // Collect all product data
      quotationProducts.forEach((product, index) => {
        productNames.push(String(product.product_name || ''))
        quantities.push(String(product.qty || 0))
        units.push(String(product.unit || ''))
        prices.push(String(product.price || 0))
        ppns.push(String(product.ppn || 0))
        discounts.push(String(product.discount || 0))
      })

      // If no products, add empty arrays
      if (productNames.length === 0) {
        productNames.push('')
        quantities.push('0')
        units.push('')
        prices.push('0')
        ppns.push('0')
        discounts.push('0')
      }

      // Add all products to FormData
      productNames.forEach((name, index) => {
        data.append('product_name[]', name)
        data.append('qty[]', quantities[index])
        data.append('unit[]', units[index])
        data.append('price[]', prices[index])
        data.append('ppn[]', ppns[index])
        data.append('discount[]', discounts[index])
      })

      console.log('Updating quotation with FormData:')
      console.log('Products data:', quotationProducts)
      console.log('FormData entries:')
      for (let pair of data.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      const response = await pipelineService.updateQuotation(selectedQuotation.id, data)
      await fetchQuotations(selectedLead.id) // Reload quotations
      setShowUpdateQuotationModal(false)
      setSelectedQuotation(null)
      setQuotationProducts([]) // Reset products
      alert('Quotation updated successfully!')
      return response
    } catch (error) {
      console.error('Error updating quotation:', error)
      alert('Failed to update quotation. Please try again.')
      throw error
    }
  }

  const handleDeleteQuotation = async (quotationId) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return

    try {
      await pipelineService.deleteQuotation(quotationId)
      await fetchQuotations(selectedLead.id) // Reload quotations
      alert('Quotation deleted successfully!')
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('Failed to delete quotation. Please try again.')
    }
  }

  const handlePoolToMain = async (quotationId) => {
    try {
      const response = await pipelineService.poolToMain(quotationId)
      
      // Update lead amount in the UI
      if (selectedLead) {
        setSelectedLead(prev => ({
          ...prev,
          amount: response.amount || 0
        }))
      }

      // Update lead in the leads data
      setLeadsData(prev => {
        return prev.map(lead => {
          if (lead.id === selectedLead?.id) {
            return { ...lead, amount: response.amount || 0 }
          }
          return lead
        })
      })

      alert('Amount pooled to main successfully!')
    } catch (error) {
      console.error('Error pooling to main:', error)
      alert('Failed to pool amount to main. Please try again.')
    }
  }

  const handleEditQuotation = async (quotationId) => {
    try {
      const response = await pipelineService.getQuotationDetail(quotationId)
      setSelectedQuotation(response)
      setQuotationProducts(response.products || [])
      setShowUpdateQuotationModal(true)
    } catch (error) {
      console.error('Error fetching quotation detail:', error)
      alert('Failed to load quotation details. Please try again.')
    }
  }

  const addQuotationProduct = () => {
    const newProduct = {
      id: Date.now(), // temporary ID for new products
      product_name: '',
      qty: 1,
      unit: 'pcs',
      price: 0,
      ppn: 11,
      discount: 0
    }
    setQuotationProducts(prev => [...prev, newProduct])
  }

  const removeQuotationProduct = (index) => {
    setQuotationProducts(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuotationProduct = (index, field, value) => {
    setQuotationProducts(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const calculateRowTotal = (product) => {
    const qty = parseFloat(product.qty) || 0
    const price = parseFloat(product.price) || 0
    const ppn = parseFloat(product.ppn) || 0
    const discount = parseFloat(product.discount) || 0

    const subtotal = qty * price
    const ppnAmount = subtotal * (ppn / 100)
    const totalWithPPN = subtotal + ppnAmount
    const discountAmount = totalWithPPN * (discount / 100)
    const total = totalWithPPN - discountAmount

    return total
  }

  const calculateGrandTotal = () => {
    return quotationProducts.reduce((total, product) => {
      return total + calculateRowTotal(product)
    }, 0)
  }

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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

  // Horizontal drag handlers
  const handleMouseDown = (e) => {
    // Only start dragging on right mouse button
    if (e.button !== 2) return
    
    setIsDragging(true)
    setDragStart({
      x: e.pageX,
      scrollLeft: pipelineContainerRef.current?.scrollLeft || 0
    })
  }

  const handleMouseMove = React.useCallback((e) => {
    if (!isDragging || !pipelineContainerRef.current) return
    
    e.preventDefault()
    const dragDistance = e.pageX - dragStart.x
    pipelineContainerRef.current.scrollLeft = dragStart.scrollLeft - dragDistance
  }, [isDragging, dragStart])

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleContextMenu = (e) => {
    // Prevent context menu when right-clicking for drag
    e.preventDefault()
  }

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.cursor = 'default'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'default'
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-white p-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-black">{leadsData.length} Leads</h1>
              {isLoadingChatStatus && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Loading chat status...</span>
                </div>
              )}
            </div>
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
                        {salesData.map((sales) => (
                          <SelectItem key={sales.id} value={sales.id.toString()}>
                            {sales.name}
                          </SelectItem>
                        ))}
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
          <div 
            ref={pipelineContainerRef}
            className={`overflow-x-auto select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            <div className="flex gap-6 pb-4" style={{minWidth: `${stages.length * 300}px`}}>
               {stages.map((stage) => (
                 <div key={stage.id} className="flex-shrink-0" style={{width: '280px'}}>
                   <StageColumn
                     stage={stage}
                     leads={leadsData.filter((lead) => lead.stage === stage.id)}
                     onLeadClick={handleLeadClick}
                     onMoveLead={handleMoveLead}
                     onUpdateLead={handleUpdateLead}
                     batchChatStatus={batchChatStatus}
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
                    onClick={() => {
                      setActiveTab('help');
                      if (selectedLead?.id) {
                        fetchAiHelper(selectedLead.id);
                      }
                    }}
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
                  onClick={() => {
                    setActiveTab('email');
                    if (selectedLead?.id) {
                      fetchEmails(selectedLead.id);
                    }
                  }}
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
                  onClick={() => {
                    setActiveTab('activity');
                    if (selectedLead?.id) {
                      fetchActivities(selectedLead.id);
                    }
                  }}
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
                  <h2 className="text-xl font-semibold mb-4">Automation Helper</h2>
                  
                  {loadingHelp ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-gray-600">Loading AI helper...</p>
                    </div>
                  ) : helpError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700">{helpError}</p>
                      </div>
                    </div>
                  ) : helpMessage ? (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                        <h3 className="text-sm font-medium text-gray-900">Automation Helper</h3>
                      </div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
{helpMessage}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No help available</h3>
                      <p className="text-gray-600">AI Helper will provide assistance when you select a lead</p>
                    </div>
                  )}
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
                      {salesData.map((sales) => (
                        <option key={sales.id} value={sales.id}>
                          {sales.name}
                        </option>
                      ))}
                    </select>
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

                          // Siapkan payload sesuai format yang benar
                          const updateData = {}
                          
                          // Format note sesuai kebutuhan API
                          if (requirements.trim()) {
                            updateData.note = requirements.trim()
                          }
                          
                          // Format constraint_note untuk kendala
                          if (obstacles.trim()) {
                            updateData.constraint_note = obstacles.trim()
                          }
                          
                          // Format tag sesuai kebutuhan API
                          if (assignee && assignee !== '') {
                            updateData.tag = parseInt(assignee)
                          }

                          // Validasi minimal ada satu data yang diisi
                          if (Object.keys(updateData).length === 0) {
                            alert('Please fill at least one field (requirements, obstacles, or tag)')
                            return
                          }

                          console.log('Saving note for lead:', selectedLead.id, updateData)

                          const response = await handleUpdateLead(selectedLead.id, updateData)
                          
                          // Update selectedLead dengan data baru
                          setSelectedLead(prev => ({
                            ...prev,
                            note: requirements || prev.note,
                            constraint_note: obstacles || prev.constraint_note,
                            tag: assignee ? parseInt(assignee) : prev.tag
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
                                <p className="text-sm text-black mt-1">Rp. {selectedLead?.value || 0}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Priority</label>
                                <p className="text-sm text-black mt-1">{selectedLead?.priority || 'Medium'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Created</label>
                                <p className="text-sm text-black mt-1">{formatDate(selectedLead?.created_at)}</p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-500">Lead source</label>
                              <p className="text-sm text-black mt-1">{selectedLead?.source || 'Unknown'}</p>
                              <p className="text-sm text-gray-500 mt-1">Last activity: {formatDate(selectedLead?.lastActivity)}</p>
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
                                  <input 
                                    type="text"
                                    name="lead_name"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter name..."
                                    defaultValue={selectedLead?.name || ''}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Phone</label>
                                  <input 
                                    type="text"
                                    name="lead_phone"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter phone..."
                                    defaultValue={selectedLead?.phone || ''}
                                  />
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
                                  <input 
                                    type="number"
                                    name="lead_amount"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount..."
                                    defaultValue={selectedLead?.value || ''}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-gray-500">City</label>
                                  <input 
                                    type="text"
                                    name="lead_city"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter city..."
                                    defaultValue={selectedLead?.city || ''}
                                  />
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
                                    {salesData.map((sales) => (
                                      <option key={sales.id} value={sales.id}>
                                        {sales.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-500">Automation Reason Assigning</label>
                                  <textarea 
                                    name="automation_reason"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 resize-none"
                                    rows="2"
                                    placeholder="Automation reason will be displayed here..."
                                    value={selectedLead?.automation_reason || ''}
                                    readOnly
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Automation Supervisor Advice
                                  </label>
                                  <div className="w-full mt-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-700 min-h-[80px] whitespace-pre-wrap break-words">
                                    {selectedLead?.supervisor_advice || 'Belum ada data'}
                                  </div>
                                  <input 
                                    type="hidden"
                                    name="supervisor_advice"
                                    value={selectedLead?.supervisor_advice || ''}
                                  />
                                </div>
                              </div>

                              <hr className="my-4" />

                              {/* Chat Score Opportunity - Auto-filled from API */}
                              <div>
                                <label className="text-sm font-medium text-gray-500 block mb-2">
                                  Chat Score Opportunity 
                                  {/* <span className="text-xs text-blue-500 ml-1">(Auto-generated from API)</span> */}
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-medium text-gray-400">Score</label>
                                    <div className="w-full mt-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-700">
                                      {selectedLead?.chat_score || '-'}
                                    </div>
                                    <input 
                                      type="hidden"
                                      name="chat_score"
                                      value={selectedLead?.chat_score || ''}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-400">Reason</label>
                                    <div className="w-full mt-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-700 min-h-[38px] flex items-center">
                                      {selectedLead?.score_reason || '-'}
                                    </div>
                                    <input 
                                      type="hidden"
                                      name="score_reason"
                                      value={selectedLead?.score_reason || ''}
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
                                      const leadName = document.querySelector('input[name="lead_name"]')?.value
                                      const leadPhone = document.querySelector('input[name="lead_phone"]')?.value
                                      const leadAmount = document.querySelector('input[name="lead_amount"]')?.value
                                      const leadCity = document.querySelector('input[name="lead_city"]')?.value
                                      const responsible = document.querySelector('select[name="responsible"]')?.value
                                      const automationReason = document.querySelector('textarea[name="automation_reason"]')?.value
                                      // Supervisor advice diambil dari hidden input (read-only data dari API)
                                      const supervisorAdvice = document.querySelector('input[name="supervisor_advice"]')?.value
                                      // Chat score dan reason diambil dari hidden input (read-only data dari API)
                                      const chatScore = document.querySelector('input[name="chat_score"]')?.value
                                      const scoreReason = document.querySelector('input[name="score_reason"]')?.value

                                      const updateData = {}
                                      
                                      // Update hanya field yang diubah - hanya yang diperlukan untuk endpoint
                                      if (leadName !== selectedLead.name) {
                                        updateData.name = leadName
                                      }
                                      if (leadPhone !== selectedLead.phone) {
                                        updateData.phone = leadPhone
                                      }
                                      if (leadCity !== selectedLead.city) {
                                        updateData.city = leadCity
                                      }
                                      // Enable amount/value update - with proper comparison
                                      const currentValue = selectedLead.value?.toString() || ''
                                      if (leadAmount !== currentValue) {
                                        updateData.value = parseFloat(leadAmount) || 0
                                      }
                                      // Tidak mengirim user_id karena tidak diperlukan oleh endpoint
                                      // if (responsible !== undefined && responsible !== selectedLead.responsible) {
                                      //   updateData.user_id = responsible === '' ? null : parseInt(responsible)
                                      // }
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
                                        name: leadName || prev.name,
                                        phone: leadPhone || prev.phone,
                                        city: leadCity || prev.city,
                                        // Update field amount dan responsible hanya di local state, tidak dikirim ke API
                                        value: parseFloat(leadAmount) || prev.value,
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
                        {/* <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Chat Preview
                        </h3> */}
                        <ChatInterface lead={selectedLead} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'email' && (
                <div className="px-6 py-6">
                  <h2 className="text-xl font-semibold mb-4">Email</h2>
                  
                  {loadingEmails ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-gray-600">Loading emails...</p>
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada email</h3>
                      <p className="text-gray-600">Email untuk lead ini akan muncul di sini</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emails.map((email, index) => (
                        <div 
                          key={index} 
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEmailClick(email)
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-medium hover:text-blue-600 transition-colors ${email.is_read === false ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                    {email.subject || 'No Subject'}
                                  </h4>
                                  {email.is_read === false && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  From: {email.from || 'Unknown'} 
                                </p>
                                {/* Email preview */}
                                {email.content && (
                                  <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                                    {email.content.substring(0, 100)}{email.content.length > 100 ? '...' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              {email.created_at ? new Date(email.created_at).toLocaleDateString() : 'No Date'}
                            </div>
                          </div>
                          
                          {email.attachments && email.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-2">Attachments:</p>
                              <div className="flex flex-wrap gap-2">
                                {email.attachments.map((attachment, attIndex) => (
                                  <span key={attIndex} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                    📎 {attachment.name || attachment}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Click indicator */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Click to view email details
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'create-email' && (
                  <div className="px-6 py-6">
                  <h2 className="text-xl font-semibold mb-6">Create Email</h2>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                        value={emailForm.to}
                        onChange={(e) => handleEmailFormChange('to', e.target.value)}
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
                        value={emailForm.cc}
                        onChange={(e) => handleEmailFormChange('cc', e.target.value)}
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
                        value={emailForm.subject}
                        onChange={(e) => handleEmailFormChange('subject', e.target.value)}
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
                        value={emailForm.message}
                        onChange={(e) => handleEmailFormChange('message', e.target.value)}
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
                          onChange={handleFileUpload}
                          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt"
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
                      
                      {/* File List Preview */}
                      {emailAttachments.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-sm font-medium text-gray-700">File terpilih:</p>
                          {emailAttachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-600">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = emailAttachments.filter((_, i) => i !== index)
                                  setEmailAttachments(newFiles)
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetEmailForm()
                          setActiveTab('email')
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Save as draft logic - for future implementation
                          console.log('Save as draft - not implemented yet')
                        }}
                      >
                        Simpan Draft
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSendEmail}
                        disabled={sendingEmail || !emailForm.to || !emailForm.subject || !emailForm.message}
                      >
                        {sendingEmail ? 'Mengirim...' : 'Kirim Email'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="px-6 py-6">
                  {/* Activity Form */}
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Activity</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* @Tag Field */}
                        <div>
                          <label htmlFor="activity-tag" className="block text-sm font-medium text-gray-700 mb-1">
                            @Tag
                          </label>
                          <select
                            id="activity-tag"
                            name="activity-tag"
                            value={activityForm.tag}
                            onChange={(e) => handleActivityFormChange('tag', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select person to tag</option>
                            {salesData.map((sales) => (
                              <option key={sales.id} value={sales.id}>
                                {sales.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Empty div for spacing */}
                        <div></div>
                      </div>
                      
                      {/* Comment Field */}
                      <div>
                        <label htmlFor="activity-comment" className="block text-sm font-medium text-gray-700 mb-1">
                          Comment
                        </label>
                        <textarea
                          id="activity-comment"
                          name="activity-comment"
                          rows={3}
                          placeholder="Write your activity comment here..."
                          value={activityForm.comment}
                          onChange={(e) => handleActivityFormChange('comment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-vertical"
                        />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={handleSaveComment}
                          disabled={!activityForm.comment.trim()}
                        >
                          Simpan
                        </Button>
                        <Button
                          type="button"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleLogCall}
                          // disabled={!activityForm.comment.trim()}
                        >
                          Log Call
                        </Button>
                      </div>
                    </form>
                  </div>

                  <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
                  
                  {loadingActivities ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-gray-600">Loading activities...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas</h3>
                      <p className="text-gray-600">Aktivitas untuk lead ini akan muncul di sini</p>
                    </div>
                  ) : (
                    <div className="flow-root max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      <ul className="-mb-8">
                        {activities.map((activity, index) => (
                          <li key={index}>
                            <div className="relative pb-8">
                              {index !== activities.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  {/* Activity icon based on type */}
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    activity.activity_type === 'call' || activity.activity_type?.includes('call') ? 'bg-blue-500' :
                                    activity.activity_type === 'email' || activity.activity_type?.includes('email') ? 'bg-green-500' :
                                    activity.is_note || activity.activity_type === 'note' || activity.note ? 'bg-yellow-500' :
                                    activity.activity_type === 'stage_change' || activity.activity_type?.includes('stage') ? 'bg-purple-500' :
                                    'bg-gray-500'
                                  }`}>
                                    {(activity.activity_type === 'call' || activity.activity_type?.includes('call')) && (
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                    )}
                                    {(activity.activity_type === 'email' || activity.activity_type?.includes('email')) && (
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                    {(activity.is_note || activity.activity_type === 'note' || activity.note) && (
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    )}
                                    {(activity.activity_type === 'stage_change' || activity.activity_type?.includes('stage')) && (
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                      </svg>
                                    )}
                                    {!['call', 'email', 'note', 'stage_change'].some(type => 
                                      activity.activity_type?.includes(type) || 
                                      (type === 'note' && (activity.is_note || activity.note))
                                    ) && (
                                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {activity.data.note|| 'Unknown Activity'}
                                    </p>
                                   
                                    {/* {activity.data.tag_to && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Tagged: {typeof activity.data.tag_to === 'object' ? JSON.stringify(activity.tag_to) : activity.tag_to}
                                      </p>
                                    )} */}
                                    {activity.user_id && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        User ID: {activity.user_id}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    {activity.created_at ? new Date(activity.created_at).toLocaleString() : 'No Date'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'quotation' && (
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Quotation</h2>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // Reset any existing state
                        setShowUpdateQuotationModal(false)
                        setSelectedQuotation(null)
                        setQuotationProducts([])
                        
                        // Add default empty product
                        addQuotationProduct()
                        
                        // Open create modal
                        setShowCreateQuotationModal(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Quotation
                    </Button>
                  </div>
                  
                  {loadingQuotations ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-gray-600">Loading quotations...</p>
                    </div>
                  ) : quotations.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada quotation</h3>
                      <p className="text-gray-600 mb-4">Mulai buat quotation pertama untuk lead ini</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotations.map((quotation) => (
                        <div key={quotation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuotation(quotation.id)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Q{quotation.id}
                              </Button>
                              <div>
                                <p className="font-medium text-gray-900">{quotation.lead?.name || 'Unknown Lead'}</p>
                                <p className="text-sm text-gray-500">Due: {new Date(quotation.due_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg text-green-600">
                                {formatRupiah(quotation.amount || 0)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                              {quotation.products?.length || 0} product(s)
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/crm2/quotation/invoice/${quotation.id}`, '_blank')}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                Invoice PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePoolToMain(quotation.id)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Pull To Main
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteQuotation(quotation.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
        
        {/* Create Quotation Modal */}
        {showCreateQuotationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {console.log('Rendering CREATE modal')}
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black opacity-20" 
              onClick={() => setShowCreateQuotationModal(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Buat Quotation Baru</h2>
                <button
                  onClick={() => setShowCreateQuotationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 p-6 overflow-auto">
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  
                  // Add products data
                  quotationProducts.forEach((product, index) => {
                    formData.append(`product_name[${index}]`, product.product_name)
                    formData.append(`qty[${index}]`, product.qty)
                    formData.append(`unit[${index}]`, product.unit)
                    formData.append(`price[${index}]`, product.price)
                    formData.append(`ppn[${index}]`, product.ppn)
                    formData.append(`discount[${index}]`, product.discount)
                  })
                  
                  await handleCreateQuotation(formData)
                }}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date:
                    </label>
                    <input 
                      type="date" 
                      name="duedate" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Products</h3>
                      <Button
                        type="button"
                        onClick={addQuotationProduct}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Product Name</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Qty</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Unit</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Price</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">PPN(%)</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Discount(%)</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Total</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotationProducts.map((product, index) => (
                            <tr key={index}>
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={product.product_name}
                                  onChange={(e) => updateQuotationProduct(index, 'product_name', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Product Name"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.qty}
                                  onChange={(e) => updateQuotationProduct(index, 'qty', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Qty"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={product.unit}
                                  onChange={(e) => updateQuotationProduct(index, 'unit', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Unit"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => updateQuotationProduct(index, 'price', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Price"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.ppn}
                                  onChange={(e) => updateQuotationProduct(index, 'ppn', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="PPN"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.discount}
                                  onChange={(e) => updateQuotationProduct(index, 'discount', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Discount"
                                />
                              </td>
                              <td className="border p-2 text-right font-medium">
                                {formatRupiah(calculateRowTotal(product))}
                              </td>
                              <td className="border p-2 text-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuotationProduct(index)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {quotationProducts.length === 0 && (
                            <tr>
                              <td colSpan={8} className="text-center py-8 text-gray-500">
                                No products added yet. Click "Add Product" to start.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-3 py-2 text-right font-semibold border">Grand Total:</td>
                            <td className="px-3 py-2 text-right font-semibold border text-green-600">
                              {formatRupiah(calculateGrandTotal())}
                            </td>
                            <td className="border"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateQuotationModal(false)
                        setQuotationProducts([])
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Quotation
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Update Quotation Modal */}
        {showUpdateQuotationModal && selectedQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {console.log('Rendering UPDATE modal for quotation:', selectedQuotation.id)}
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black opacity-20" 
              onClick={() => {
                setShowUpdateQuotationModal(false)
                setSelectedQuotation(null)
                setQuotationProducts([])
              }}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Update Quotation Q{selectedQuotation.id}</h2>
                <button
                  onClick={() => {
                    setShowUpdateQuotationModal(false)
                    setSelectedQuotation(null)
                    setQuotationProducts([])
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 p-6 overflow-auto">
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  
                  // Add products data
                  quotationProducts.forEach((product, index) => {
                    formData.append(`product_name[${index}]`, product.product_name)
                    formData.append(`qty[${index}]`, product.qty)
                    formData.append(`unit[${index}]`, product.unit)
                    formData.append(`price[${index}]`, product.price)
                    formData.append(`ppn[${index}]`, product.ppn)
                    formData.append(`discount[${index}]`, product.discount)
                  })
                  
                  await handleUpdateQuotation(formData)
                }}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date:
                    </label>
                    <input 
                      type="date" 
                      name="duedate" 
                      defaultValue={selectedQuotation.due_date}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Products</h3>
                      <Button
                        type="button"
                        onClick={addQuotationProduct}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Product Name</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Qty</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Unit</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Price</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">PPN(%)</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Discount(%)</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Total</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotationProducts.map((product, index) => (
                            <tr key={index}>
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={product.product_name}
                                  onChange={(e) => updateQuotationProduct(index, 'product_name', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Product Name"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.qty}
                                  onChange={(e) => updateQuotationProduct(index, 'qty', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Qty"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={product.unit}
                                  onChange={(e) => updateQuotationProduct(index, 'unit', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Unit"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => updateQuotationProduct(index, 'price', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Price"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.ppn}
                                  onChange={(e) => updateQuotationProduct(index, 'ppn', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="PPN"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  value={product.discount}
                                  onChange={(e) => updateQuotationProduct(index, 'discount', e.target.value)}
                                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Discount"
                                />
                              </td>
                              <td className="border p-2 text-right font-medium">
                                {formatRupiah(calculateRowTotal(product))}
                              </td>
                              <td className="border p-2 text-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuotationProduct(index)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {quotationProducts.length === 0 && (
                            <tr>
                              <td colSpan={8} className="text-center py-8 text-gray-500">
                                No products added yet. Click "Add Product" to start.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-3 py-2 text-right font-semibold border">Grand Total:</td>
                            <td className="px-3 py-2 text-right font-semibold border text-green-600">
                              {formatRupiah(calculateGrandTotal())}
                            </td>
                            <td className="border"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowUpdateQuotationModal(false)
                        setSelectedQuotation(null)
                        setQuotationProducts([])
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Update Quotation
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>
      </DndProvider>
  )
}

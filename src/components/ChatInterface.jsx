import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Phone, Video } from "lucide-react"
import pipelineService from "@/services/pipeline"

function ChatInterface({ lead }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Fetch chats when lead changes
  useEffect(() => {
    if (lead?.id) {
      fetchChats(lead.id)
    } else {
      setChats([])
    }
  }, [lead?.id])

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Auto scroll when chats change
  useEffect(() => {
    if (chats.length > 0) {
      scrollToBottom()
    }
  }, [chats])

  const fetchChats = async (leadId) => {
    if (!leadId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await pipelineService.getChats(leadId)
      console.log('Chat response:', response)
      
      // Set chats data - assuming the response structure has a chats array
      setChats(response.chats || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
      setError('Failed to load chat messages')
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Function to determine if message is from agent or customer
  const isFromAgent = (chat) => {
    // Debug: Let's log the chat data to understand the structure
    console.log('Chat data for sender detection:', {
      from: chat.from,
      leadPhone: lead?.phone,
      chatId: chat.id,
      data: chat.data
    })
    
    // Logic based on common WhatsApp integration patterns:
    // 1. If 'from' is 'visitor' = customer message (left)
    // 2. If 'from' equals lead phone = customer message (left) 
    // 3. If 'from' is 'agent' or 'system' = agent message (right)
    // 4. If 'from' is a different phone number (not lead's phone) = agent message (right)
    
    if (chat.from === 'visitor') {
      return false // Customer message - left side
    }
    
    if (chat.from === 'agent' || chat.from === 'system') {
      return true // Agent message - right side
    }
    
    // If from is a phone number, check if it's the lead's phone
    if (chat.from && lead?.phone) {
      // Remove any formatting and compare
      const cleanChatFrom = chat.from.replace(/\D/g, '') // Remove non-digits
      const cleanLeadPhone = lead.phone.replace(/\D/g, '') // Remove non-digits
      
      if (cleanChatFrom === cleanLeadPhone) {
        return false // Customer message - left side
      } else {
        return true // Agent message (different phone number) - right side
      }
    }
    
    // Default: assume customer message
    return false
  }

  // Function to process message content (handle media, etc.)
  const processMessageContent = (chat) => {
    if (chat.media) {
      if (chat.type_content === 'video') {
        return (
          <video className="rounded-lg max-w-full" controls>
            <source src={chat.media} type="video/mp4" />
            Your browser does not support video.
          </video>
        )
      } else if (chat.type_content === 'file' || chat.type_content === 'document') {
        return (
          <div className="file-preview">
            <a href={chat.media} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              📄 Document
            </a>
          </div>
        )
      } else {
        // Assume it's an image
        return (
          <div>
            <img src={chat.media} alt="Chat media" className="rounded-lg max-w-full" />
            {chat.caption && <p className="mt-2 text-sm">{chat.caption}</p>}
          </div>
        )
      }
    } else if (chat.data) {
      // Handle text messages
      return <p className="text-sm whitespace-pre-wrap">{chat.data}</p>
    } else if (chat.type_content === 'incoming call') {
      return <p className="text-sm italic">📞 Incoming Call</p>
    } else if (chat.type_content === 'missed call') {
      return <p className="text-sm italic text-red-500">📞 Missed Call</p>
    }
    
    return <p className="text-sm italic">(No content)</p>
  }

  return (
    <div className="flex flex-col h-[650px] w-full"> {/* Fixed height, full width */}
      {/* Chat Header dengan Lead Info */}
      <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-medium">{lead?.name}</h3>
            <p className="text-sm text-gray-500">{lead?.phone}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading chat messages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️ {error}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchChats(lead?.id)}
            >
              Retry
            </Button>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p>No chat messages found</p>
          </div>
        ) : (
          chats.map((chat, index) => (
            <div key={chat.id || index} className={`flex ${isFromAgent(chat) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isFromAgent(chat)
                  ? 'bg-crm-primary text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="mb-2">
                  {processMessageContent(chat)}
                </div>
                <p className={`text-xs ${
                  isFromAgent(chat) ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {formatTimestamp(chat.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t flex-shrink-0">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input 
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" className="bg-crm-primary hover:bg-crm-primary-hover">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
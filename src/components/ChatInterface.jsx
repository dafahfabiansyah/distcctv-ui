import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Phone, Video, Reply } from "lucide-react"
import pipelineService from "@/services/pipeline"

function ChatInterface({ lead }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoggingCall, setIsLoggingCall] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [targetReply, setTargetReply] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

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

  // Function to handle log call
  const handleLogCall = async () => {
    if (!lead?.id || isLoggingCall) return
    
    setIsLoggingCall(true)
    
    try {
      const response = await pipelineService.logCall(lead.id)
      console.log('Log call response:', response)
      
      // Optional: Show success message or update UI
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Error logging call:', error)
      // Optional: Show error message
    } finally {
      setIsLoggingCall(false)
    }
  }

  // Function to handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      console.log('File selected:', file.name, file.size)
    }
  }

  // Function to clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Function to send WhatsApp message
  const handleSendMessage = async () => {
    if (!lead?.phone) {
      alert('No phone number available for this lead')
      return
    }

    // Validate input - either message or file is required
    if (!newMessage.trim() && !selectedFile) {
      alert('Please enter a message or select a file')
      return
    }

    setIsSending(true)

    try {
      const response = await pipelineService.sendWhatsappMessage(
        lead.id,
        newMessage.trim(),
        selectedFile,
        targetReply
      )

      console.log('WhatsApp message sent:', response)

      // Reset form
      setNewMessage('')
      clearSelectedFile()
      setTargetReply('')

      // Refresh chat messages to show the new message
      // Add a small delay to allow server to process
      setTimeout(async () => {
        await fetchChats(lead.id)
      }, 1000)

      // Optional: Show success message in a more user-friendly way
      console.log('Message sent successfully!')

    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      alert('Failed to send message: ' + error.message)
    } finally {
      setIsSending(false)
    }
  }

  // Function to handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
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

  // Function to process quoted message (reply)
  const processQuotedMessage = (chat) => {
    if (!chat.quoted_chat_id) return null
    
    // Find the original message being quoted
    const quotedMessage = chats.find(c => c.id === chat.quoted_chat_id)
    
    return (
      <div className="mb-2 pl-3 border-l-2 border-gray-300 bg-gray-50 p-2 rounded text-xs">
        <div className="text-gray-600">
          {quotedMessage ? (
            <div>
              {quotedMessage.media ? (
                <div>
                  {quotedMessage.type_content === 'image' ? '🖼️ Image' : 
                   quotedMessage.type_content === 'video' ? '🎥 Video' :
                   quotedMessage.type_content === 'document' || quotedMessage.type_content === 'file' ? '📎 Document' : '📎 File'}
                  {quotedMessage.caption && <p className="mt-1">{quotedMessage.caption}</p>}
                </div>
              ) : (
                <p className="truncate">{quotedMessage.data || '(No content)'}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">Original message not found</p>
          )}
        </div>
      </div>
    )
  }

  // Function to handle reply to message
  const handleReplyMessage = (chat) => {
    setTargetReply(chat.id || '')
    console.log('Replying to message:', chat.id)
    // Focus on input for better UX
    document.querySelector('input[placeholder="Type a message..."]')?.focus()
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogCall}
              disabled={isLoggingCall || !lead?.id}
              title="Log Call"
            >
              <Phone className={`h-4 w-4 ${isLoggingCall ? 'animate-pulse' : ''}`} />
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
                {/* Quoted Message */}
                {processQuotedMessage(chat)}
                
                {/* Main Message Content */}
                <div className="mb-2">
                  {processMessageContent(chat)}
                </div>
                
                {/* Message Footer */}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    isFromAgent(chat) ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(chat.created_at)}
                  </p>
                  
                  {/* Reply Button - only show for customer messages */}
                  {!isFromAgent(chat) && (
                    <button
                      onClick={() => handleReplyMessage(chat)}
                      className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                      title="Reply to this message"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t flex-shrink-0">
        {/* Reply Preview */}
        {targetReply && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 mb-1">Replying to:</p>
                <div className="text-sm text-blue-600">
                  {(() => {
                    const replyChat = chats.find(c => c.id === targetReply)
                    if (!replyChat) return 'Message not found'
                    
                    if (replyChat.media) {
                      return replyChat.type_content === 'image' ? '🖼️ Image' : '📎 File'
                    }
                    return replyChat.data || '(No content)'
                  })()}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTargetReply('')}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSelectedFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Input Row */}
        <div className="flex gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />
          
          {/* File Upload Button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            title="Attach File"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {/* Message Input */}
          <Input 
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isSending}
          />
          
          {/* Send Button */}
          <Button 
            size="sm" 
            className="bg-crm-primary hover:bg-crm-primary-hover"
            onClick={handleSendMessage}
            disabled={isSending || (!newMessage.trim() && !selectedFile)}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Send Status */}
        {isSending && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
            Sending message...
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
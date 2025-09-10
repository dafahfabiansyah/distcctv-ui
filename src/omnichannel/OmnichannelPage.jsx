"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  MessageSquare,
  Filter,
  Archive,
  Loader2,
  FileText
} from "lucide-react"
import { 
  getChatList, 
  loadConversation, 
  sendMessage, 
  formatTimestamp, 
  formatFileSize, 
  getMessageTypeIcon, 
  getMessagePreview 
} from "@/services/omnichannel"

// Chat contacts will be loaded from API

// Messages will be loaded from API based on selected conversation

function MessageBubble({ message }) {
  // Determine if message is from agent based on the 'to' field (agent's number)
  const isAgent = message.from === '6285119746973' // Agent's number
  
  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
        isAgent 
          ? 'bg-blue-500 text-white' 
          : 'bg-white text-gray-900 border'
      }`}>
        {message.type_content === 'chat' || !message.type_content ? (
          <p className="text-sm leading-relaxed">{message.data}</p>
        ) : message.type_content === 'image' ? (
          <div>
            <img src={message.media} alt="Shared image" className="rounded max-w-full h-auto" />
            {message.data && <p className="text-sm mt-2">{message.data}</p>}
          </div>
        ) : message.type_content === 'document' || message.type_content === 'file' ? (
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{message.data || 'Document'}</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{message.data}</p>
        )}
        
        <p className={`text-xs mt-1 ${
          isAgent ? 'text-white/70' : 'text-gray-500'
        }`}>
          {formatTimestamp(message.created_at || message.timestamp)}
        </p>
      </div>
    </div>
  )
}

function ContactItem({ contact, isSelected, onClick }) {
  const getSourceIcon = (source) => {
    if (source === 'whatsapp') {
      return (
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-2.5 h-2.5 text-white" />
        </div>
      )
    } else {
      return (
        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-2.5 h-2.5 text-white" />
        </div>
      )
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div 
      className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
        isSelected ? 'bg-blue-50 border-r-2 border-r-crm-primary' : ''
      }`}
      onClick={() => onClick(contact)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact.avatar} alt={contact.name || contact.phone} />
            <AvatarFallback>{(contact.name || contact.phone).charAt(0)}</AvatarFallback>
          </Avatar>
          {/* Status indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(contact.is_online ? 'online' : 'offline')} rounded-full border-2 border-white`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{contact.name || contact.phone}</h3>
              {getSourceIcon('whatsapp')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {contact.created_at}
              </span>

             
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate">{getMessagePreview(contact.last_message)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {contact.phone}
            </span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              WhatsApp
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatArea({ messagesEndRef  ,selectedContact, messages, loadingMessages, sendingMessage, handleSendMessage, newMessage, setNewMessage }) {
  const getSourceBadge = (source) => {
    if (source === 'whatsapp') {
      return (
        <Badge className="bg-green-500 text-white text-xs px-2 py-1">
          <MessageSquare className="w-3 h-3 mr-1" />
          WhatsApp
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
          <MessageSquare className="w-3 h-3 mr-1" />
          Tawk.to
        </Badge>
      )
    }
  }

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Pilih Percakapan</h3>
          <p className="text-gray-400">Pilih kontak dari daftar untuk memulai atau melanjutkan percakapan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                selectedContact.status === 'online' ? 'bg-green-500' : 
                selectedContact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
              } rounded-full border-2 border-white`}></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                {getSourceBadge(selectedContact.source)}
              </div>
              <div className="flex items-center gap-2">
                {/* <span className="text-sm text-gray-500 capitalize">{selectedContact.status}</span> */}
                {/* <span className="text-sm text-gray-400">•</span> */}
                <span className="text-sm text-gray-500">
                  {selectedContact.source === 'whatsapp' ? selectedContact.phone : selectedContact.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            {/* <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button> */}
            {/* <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
        {!selectedContact ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-8 h-8 mr-2" />
            <span>Pilih kontak untuk melihat percakapan</span>
          </div>
        ) : loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading messages...</span>
          </div>
        ) : messages.length > 0 ? (
           <>
             {messages.map((message, index) => (
               <MessageBubble key={`${message.timestamp}-${index}`} message={message} />
             ))}
             <div ref={messagesEndRef} />
           </>
        ) : (
           <div className="flex items-center justify-center h-full text-gray-500">
             <MessageSquare className="w-8 h-8 mr-2" />
             <span>Belum ada pesan dalam percakapan ini</span>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input 
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={sendingMessage || !selectedContact}
            className="flex-1 border-gray-200 focus:border-crm-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button 
            size="sm" 
            className="bg-crm-primary hover:bg-crm-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={sendingMessage || (!newMessage.trim()) || !selectedContact}
          >
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OmnichannelPage() {
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [chatContacts, setChatContacts] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef(null)

  // Load chat list on component mount
  useEffect(() => {
    loadChatList()
  }, [])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatList = async () => {
    try {
      setLoading(true)
      const response = await getChatList()
      if (response.success) {
        console.log('Chat list response:', response.data)
        setChatContacts(Array.isArray(response.data) ? response.data : [])
      } else {
        setChatContacts([])
      }
    } catch (error) {
      console.error('Error loading chat list:', error)
      setChatContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleContactSelect = async (contact) => {
    try {
      console.log('Selected contact data:', contact)
      setSelectedContact(contact)
      setLoadingMessages(true)
      console.log('Using conversation ID:', contact.conversation_id)
      const response = await loadConversation(contact.conversation_id)
      if (response.success) {
        setMessages(response.data.chats || [])
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return
    if (!selectedContact) return

    try {
      setSendingMessage(true)
      const response = await sendMessage({
        message: newMessage,
        phone: selectedContact.phone,
        file: selectedFile
      })

      if (response.success) {
        // Add message to current conversation
        const newMsg = {
          id: Date.now(),
          sender: 'agent',
          content: newMessage,
          timestamp: formatTimestamp(new Date()),
          type: selectedFile ? 'file' : 'text'
        }
        setMessages(prev => [...prev, newMsg])
        
        // Clear input
        setNewMessage('')
        setSelectedFile(null)
        setFilePreview(null)
        
        // Refresh chat list to update last message
        loadChatList()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Gagal mengirim pesan')
    } finally {
      setSendingMessage(false)
    }
  }

  // Filter contacts berdasarkan search dan source
  const filteredContacts = (Array.isArray(chatContacts) ? chatContacts : []).filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getMessagePreview(contact.last_message)?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalUnread = (Array.isArray(chatContacts) ? chatContacts : []).reduce((sum, contact) => sum + (contact.unread_count || 0), 0)

  return (
    <div className="h-full flex bg-white">
      {/* Left Panel - Contact List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Omnichannel Chat</h2>
            <Badge className="bg-crm-primary text-white">
              {totalUnread} unread
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Cari kontak atau pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 focus:border-crm-primary"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <Button 
              variant={filterSource === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilterSource('all')}
              className={filterSource === 'all' ? 'bg-crm-primary hover:bg-crm-primary-hover' : ''}
            >
              Semua
            </Button>
            <Button 
              variant={filterSource === 'whatsapp' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilterSource('whatsapp')}
              className={filterSource === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              WhatsApp
            </Button>
            <Button 
              variant={filterSource === 'tawkto' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilterSource('tawkto')}
              className={filterSource === 'tawkto' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              Tawk.to
            </Button>
            <Button 
              variant={filterSource === 'email' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilterSource('email')}
              className={filterSource === 'email' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Email
            </Button>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading chats...</span>
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onClick={() => handleContactSelect(contact)}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{searchQuery ? 'No chats found' : 'No chats available'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <ChatArea 
        selectedContact={selectedContact} 
        messages={messages} 
        loadingMessages={loadingMessages}
        sendingMessage={sendingMessage}
        handleSendMessage={handleSendMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  )
}
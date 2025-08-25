"use client"

import { useState } from "react"
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
  Archive
} from "lucide-react"

// Sample chat data dengan berbagai sumber
const chatContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    lastMessage: "Terima kasih atas informasinya, saya tertarik dengan produk CCTV outdoor",
    timestamp: "2 min ago",
    unreadCount: 2,
    avatar: "/diverse-woman-portrait.png",
    source: "whatsapp",
    status: "online",
    phone: "+62 812-3456-7890"
  },
  {
    id: 2,
    name: "Michael Chen",
    lastMessage: "Apakah ada paket bundling untuk sistem keamanan lengkap?",
    timestamp: "5 min ago",
    unreadCount: 0,
    avatar: "/thoughtful-man.png",
    source: "tawkto",
    status: "online",
    email: "michael.chen@email.com"
  },
  {
    id: 3,
    name: "Lisa Wong",
    lastMessage: "Saya butuh konsultasi untuk instalasi CCTV di kantor",
    timestamp: "15 min ago",
    unreadCount: 1,
    avatar: "/diverse-woman-portrait.png",
    source: "whatsapp",
    status: "away",
    phone: "+62 821-9876-5432"
  },
  {
    id: 4,
    name: "David Kumar",
    lastMessage: "Halo, saya ingin tanya harga kamera IP terbaru",
    timestamp: "1 hour ago",
    unreadCount: 0,
    avatar: "/thoughtful-man.png",
    source: "tawkto",
    status: "offline",
    email: "david.kumar@company.com"
  },
  {
    id: 5,
    name: "Amanda Silva",
    lastMessage: "Kapan bisa jadwal survey lokasi?",
    timestamp: "2 hours ago",
    unreadCount: 3,
    avatar: "/diverse-woman-portrait.png",
    source: "whatsapp",
    status: "online",
    phone: "+62 813-2468-1357"
  },
  {
    id: 6,
    name: "Robert Taylor",
    lastMessage: "Mohon info detail spesifikasi DVR 16 channel",
    timestamp: "3 hours ago",
    unreadCount: 0,
    avatar: "/thoughtful-man.png",
    source: "tawkto",
    status: "away",
    email: "robert.taylor@business.com"
  }
]

// Sample messages untuk chat yang dipilih
const sampleMessages = {
  1: [
    {
      id: 1,
      sender: 'contact',
      content: 'Halo, saya tertarik dengan produk CCTV untuk rumah',
      timestamp: '14:20',
      type: 'text'
    },
    {
      id: 2,
      sender: 'agent',
      content: 'Halo! Terima kasih sudah menghubungi kami. Saya akan bantu Anda memilih CCTV yang tepat untuk rumah.',
      timestamp: '14:22',
      type: 'text'
    },
    {
      id: 3,
      sender: 'contact',
      content: 'Saya butuh yang bisa akses dari HP dan kualitas gambar bagus',
      timestamp: '14:25',
      type: 'text'
    },
    {
      id: 4,
      sender: 'agent',
      content: 'Untuk kebutuhan tersebut, saya rekomendasikan paket IP Camera dengan fitur mobile viewing. Apakah lokasi indoor atau outdoor?',
      timestamp: '14:27',
      type: 'text'
    },
    {
      id: 5,
      sender: 'contact',
      content: 'Terima kasih atas informasinya, saya tertarik dengan produk CCTV outdoor',
      timestamp: '14:30',
      type: 'text'
    }
  ],
  2: [
    {
      id: 1,
      sender: 'contact',
      content: 'Good afternoon, I need information about your security camera packages',
      timestamp: '13:45',
      type: 'text'
    },
    {
      id: 2,
      sender: 'agent',
      content: 'Good afternoon! I\'d be happy to help you with our security camera packages. What type of property are you looking to secure?',
      timestamp: '13:47',
      type: 'text'
    },
    {
      id: 3,
      sender: 'contact',
      content: 'It\'s for a small office building. We need about 8-10 cameras.',
      timestamp: '13:50',
      type: 'text'
    },
    {
      id: 4,
      sender: 'agent',
      content: 'Perfect! For a small office, I recommend our Professional Package with IP cameras and NVR system. Would you like me to prepare a detailed quote?',
      timestamp: '13:52',
      type: 'text'
    },
    {
      id: 5,
      sender: 'contact',
      content: 'Apakah ada paket bundling untuk sistem keamanan lengkap?',
      timestamp: '13:55',
      type: 'text'
    }
  ]
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
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* Status indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(contact.status)} rounded-full border-2 border-white`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
              {getSourceIcon(contact.source)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{contact.timestamp}</span>
              {contact.unreadCount > 0 && (
                <Badge className="bg-crm-primary text-white text-xs px-2 py-0.5 min-w-0 h-5">
                  {contact.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {contact.source === 'whatsapp' ? contact.phone : contact.email}
            </span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {contact.source === 'whatsapp' ? 'WhatsApp' : 'Tawk.to'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatArea({ selectedContact }) {
  const [messages, setMessages] = useState(sampleMessages[selectedContact?.id] || [])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'agent',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

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
                <span className="text-sm text-gray-500 capitalize">{selectedContact.status}</span>
                <span className="text-sm text-gray-400">•</span>
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
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
              message.sender === 'agent' 
                ? 'bg-crm-primary text-white' 
                : 'bg-white text-gray-900 border'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'agent' ? 'text-white/70' : 'text-gray-500'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 border-gray-200 focus:border-crm-primary"
          />
          <Button 
            size="sm" 
            className="bg-crm-primary hover:bg-crm-primary-hover text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
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

  // Filter contacts berdasarkan search dan source
  const filteredContacts = chatContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSource = filterSource === 'all' || contact.source === filterSource
    return matchesSearch && matchesSource
  })

  const totalUnread = chatContacts.reduce((sum, contact) => sum + contact.unreadCount, 0)

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
          <div className="flex gap-2">
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
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onClick={setSelectedContact}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada kontak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <ChatArea selectedContact={selectedContact} />
    </div>
  )
}
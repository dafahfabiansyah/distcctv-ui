import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, Phone, Video } from "lucide-react"

function ChatInterface({ lead }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'lead',
      content: 'Hi, I\'m interested in your new product line. Can you provide more details?',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: 2,
      sender: 'agent',
      content: 'Hello! I\'d be happy to help. Let me prepare a detailed quote for you.',
      timestamp: '10:32 AM',
      type: 'text'
    }
  ])
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header dengan Lead Info */}
      <div className="px-6 py-4 border-b bg-gray-50">
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.sender === 'agent' 
                ? 'bg-crm-primary text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm">{message.content}</p>
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
      <div className="px-6 py-4 border-t">
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
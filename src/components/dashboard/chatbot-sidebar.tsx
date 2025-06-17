"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Plus, MessageCircle, Calendar, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface Chatbot {
  id: string
  user_id: string
  name: string
  description?: string
  collection_name: string
  source_url?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

interface ChatbotSidebarProps {
  userId: string
  onCreateNew: () => void
  onSelectChatbot: (chatbot: Chatbot) => void
  selectedChatbot?: Chatbot | null
}

export default function ChatbotSidebar({ userId, onCreateNew, onSelectChatbot, selectedChatbot }: ChatbotSidebarProps) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserChatbots()
  }, [userId])

  const fetchUserChatbots = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${API_BASE_URL}/user/chatbots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChatbots(data.chatbots)
      } else {
        toast.error("Error", "Failed to fetch chatbots")
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error)
      toast.error("Error", "Failed to fetch chatbots")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const testChatbot = (chatbot: Chatbot) => {
    const baseUrl = window.location.origin
    const chatbotUrl = `${baseUrl}/chatbot?collection_name=${chatbot.collection_name}`
    window.open(chatbotUrl, "_blank")
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Chatbots</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
            {chatbots.length}
          </span>
        </div>

        <button
          onClick={onCreateNew}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Bot</span>
        </button>
      </div>

      {/* Chatbots List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No chatbots yet</p>
            <p className="text-sm text-gray-400">Create your first AI chatbot!</p>
          </div>
        ) : (
          chatbots.map((chatbot) => (
            <motion.div
              key={chatbot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedChatbot?.id === chatbot.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => onSelectChatbot(chatbot)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{chatbot.name}</h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(chatbot.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {chatbot.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{chatbot.description}</p>}

              {chatbot.source_url && <div className="text-xs text-blue-600 mb-3 truncate">🌐 {chatbot.source_url}</div>}

              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    testChatbot(chatbot)
                  }}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Test</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <div className="text-xs text-gray-400">ID: {chatbot.collection_name.split("_").pop()}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

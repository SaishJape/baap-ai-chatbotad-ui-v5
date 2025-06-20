"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Plus, MessageCircle, Calendar, ExternalLink, Trash2, AlertTriangle } from "lucide-react"
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

interface DeleteConfirmationProps {
  chatbot: Chatbot
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function DeleteConfirmation({ chatbot, onConfirm, onCancel, isDeleting }: DeleteConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Chatbot</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete <span className="font-semibold">"{chatbot.name}"</span>?
          </p>
          <p className="text-sm text-gray-500">This will permanently remove the chatbot and all its associated data.</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ChatbotSidebar({ userId, onCreateNew, onSelectChatbot, selectedChatbot }: ChatbotSidebarProps) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const deleteChatbot = async (chatbotId: string) => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${API_BASE_URL}/chatbots/${chatbotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the deleted chatbot from the list
        setChatbots((prev) => prev.filter((bot) => bot.id !== chatbotId))

        // If the deleted chatbot was selected, clear the selection
        if (selectedChatbot?.id === chatbotId) {
          onSelectChatbot(null as any)
        }

        toast.success("Chatbot Deleted", `"${data.chatbot_name}" has been successfully deleted`)
      } else {
        throw new Error(data.message || "Failed to delete chatbot")
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete chatbot"
      toast.error("Delete Failed", errorMessage)
    } finally {
      setIsDeleting(false)
      setChatbotToDelete(null)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, chatbot: Chatbot) => {
    e.stopPropagation()
    setChatbotToDelete(chatbot)
  }

  const handleDeleteConfirm = () => {
    if (chatbotToDelete) {
      deleteChatbot(chatbotToDelete.id)
    }
  }

  const handleDeleteCancel = () => {
    setChatbotToDelete(null)
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
    <>
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
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                  selectedChatbot?.id === chatbot.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => onSelectChatbot(chatbot)}
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate max-w-[140px]">{chatbot.name}</h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(chatbot.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteClick(e, chatbot)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200 rounded flex-shrink-0"
                  title="Delete chatbot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

                {chatbot.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{chatbot.description}</p>
                )}

                {chatbot.source_url && (
                  <a
                    href={chatbot.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent triggering the chatbot selection
                    className="text-xs text-blue-600 mb-3 truncate hover:text-blue-800 transition-colors cursor-pointer block"
                  >
                    🌐 {chatbot.source_url}
                  </a>
                )}

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

                  {/* <div className="text-xs text-gray-400">ID: {chatbot.collection_name.split("_").pop()}</div> */}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {chatbotToDelete && (
          <DeleteConfirmation
            chatbot={chatbotToDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </>
  )
}

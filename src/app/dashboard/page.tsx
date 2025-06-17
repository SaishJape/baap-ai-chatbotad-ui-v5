"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import InputSection from "@/components/dashboard/input-section"
import SimpleLoader from "@/components/dashboard/simple-loader"
import ChatbotSidebar from "@/components/dashboard/chatbot-sidebar"
import ChatbotDetails from "@/components/dashboard/chatbot-details"
import FileEnhancementModal from "@/components/dashboard/file-enhancement-modal"
import { useAuth } from "@/hooks/use-auth"
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [showLoader, setShowLoader] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEnhanceModal, setShowEnhanceModal] = useState(false)
  const [enhanceCollectionName, setEnhanceCollectionName] = useState("")
  const [enhanceChatbotName, setEnhanceChatbotName] = useState("")
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Progress tracking function
  useEffect(() => {
    let interval: NodeJS.Timeout
    const token = localStorage.getItem("authToken")

    if (currentTaskId && showLoader) {
      const checkProgress = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/scraping-progress/${currentTaskId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const data = await response.json()
            console.log("Progress data:", data)

            if (data.status === "completed" || data.is_completed) {
              clearInterval(interval)
              setShowLoader(false)
              setShowCreateForm(false)

              // Only show toast if we haven't shown it already
              // if (!hasShownSuccessToast) {
              //   toast.success("Chatbot Created!", "Your AI chatbot is ready to use!")
              //   setHasShownSuccessToast(true)
              // }

              // Refresh sidebar to show new chatbot
              window.location.reload()
            } else if (data.status === "error" || data.error) {
              clearInterval(interval)
              setShowLoader(false)
              toast.error("Processing Failed", data.error || "An error occurred during processing")
            }
          }
        } catch (error) {
          console.error("Error checking progress:", error)
        }
      }

      checkProgress()
      interval = setInterval(checkProgress, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [currentTaskId, showLoader])

  const handleCreateNew = () => {
    setSelectedChatbot(null)
    setShowCreateForm(true)
  }

  const handleSelectChatbot = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot)
    setShowCreateForm(false)
  }

  const handleStartProcessing = (taskId: string, collectionName: string, chatbotName: string) => {
    setCurrentTaskId(taskId)
    setShowLoader(true)
    setShowCreateForm(false)
    setHasShownSuccessToast(false) // Reset the flag for new chatbot creation
  }

  const handleEnhanceWithFiles = (collectionName: string) => {
    setEnhanceCollectionName(collectionName)
    setEnhanceChatbotName(selectedChatbot?.name || "")
    setShowEnhanceModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-afacad-flux">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-afacad-flux">
      <DashboardHeader user={user} />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <ChatbotSidebar
          userId={user.id}
          onCreateNew={handleCreateNew}
          onSelectChatbot={handleSelectChatbot}
          selectedChatbot={selectedChatbot}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {showLoader ? (
            <div className="h-full flex items-center justify-center p-8">
              <SimpleLoader />
            </div>
          ) : showCreateForm ? (
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Chatbot</h1>
                  <p className="text-gray-600">Transform any website into an intelligent AI assistant</p>
                </motion.div>

                <InputSection onStartProcessing={handleStartProcessing} userId={user.id} />
              </div>
            </div>
          ) : selectedChatbot ? (
            <ChatbotDetails chatbot={selectedChatbot} onEnhanceWithFiles={handleEnhanceWithFiles} />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to BAAP AI</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Select a chatbot from the sidebar to view details, or create a new one to get started.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Create Your First Chatbot
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* File Enhancement Modal */}
      <FileEnhancementModal
        isOpen={showEnhanceModal}
        onClose={() => setShowEnhanceModal(false)}
        collectionName={enhanceCollectionName}
        chatbotName={enhanceChatbotName}
      />
    </div>
  )
}

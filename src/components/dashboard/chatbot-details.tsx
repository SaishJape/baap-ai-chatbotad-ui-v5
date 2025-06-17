"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Code, MessageCircle, Copy, Check, ExternalLink, Upload } from "lucide-react"
import { toast } from "@/components/ui/toast"

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

interface ChatbotDetailsProps {
  chatbot: Chatbot
  onEnhanceWithFiles: (collectionName: string) => void
}

export default function ChatbotDetails({ chatbot, onEnhanceWithFiles }: ChatbotDetailsProps) {
  const [copied, setCopied] = useState(false)

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    return "http://localhost:3000"
  }

  const baseUrl = getBaseUrl()
  const iframeCode = `<iframe
  src="${baseUrl}/chatbot?collection_name=${chatbot.collection_name}"
  width="400"
  height="600"
  style="background: transparent !important; border: none; position: fixed; bottom: 20px; right: 20px; z-index: 9999; border-radius: 12px; overflow: hidden;"
  allowtransparency="true"
  frameborder="0"
  title="AI Chatbot">
</iframe>`

  const copyCode = () => {
    navigator.clipboard.writeText(iframeCode)
    setCopied(true)
    toast.success("Code Copied!", "Embed code has been copied to your clipboard")
    setTimeout(() => setCopied(false), 3000)
  }

  const testChatbot = () => {
    const chatbotUrl = `${baseUrl}/chatbot?collection_name=${chatbot.collection_name}`
    window.open(chatbotUrl, "_blank")
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8 pb-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{chatbot.name}</h1>
              <p className="text-blue-100">Created on {new Date(chatbot.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {chatbot.description && <p className="text-blue-100 mb-4">{chatbot.description}</p>}

          {chatbot.source_url && (
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-blue-100 mb-1">Source Website:</p>
              <a
                href={chatbot.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-200 transition-colors flex items-center space-x-1"
              >
                <span className="truncate">{chatbot.source_url}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testChatbot}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Test Chatbot</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEnhanceWithFiles(chatbot.collection_name)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            <Upload className="w-5 h-5" />
            <span>Enhance with Files</span>
          </button>
        </div>

        {/* Embed Code Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Embed Code</span>
          </h2>

          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
              <span className="text-gray-300 font-medium">HTML Embed Code</span>
              <button
                onClick={copyCode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <div className="p-6">
              <pre className="text-green-400 text-sm overflow-x-auto leading-relaxed">
                <code>{iframeCode}</code>
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">How to embed:</h3>
            <ol className="text-blue-700 space-y-1 text-sm">
              <li>1. Copy the embed code above</li>
              <li>2. Paste it into your website's HTML before the closing &lt;/body&gt; tag</li>
              <li>3. Your chatbot will appear as a floating widget on your site</li>
              <li>4. Visitors can click to chat and get instant AI-powered responses</li>
            </ol>
          </div>
        </div>

        {/* Chatbot Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Chatbot Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* <div>
                <label className="text-sm font-medium text-gray-500">Collection Name</label>
                <p className="text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded">{chatbot.collection_name}</p>
              </div> */}

              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-800">{new Date(chatbot.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-800">{new Date(chatbot.updated_at).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status: </label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

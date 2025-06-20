"use client"

import type React from "react"
import { useState } from "react"
import { Globe, Upload, Play, X, Bot } from 'lucide-react'
import { motion } from "framer-motion"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface InputSectionProps {
  onStartProcessing: (taskId: string, collectionName: string, chatbotName: string) => void
  userId: string
}

export default function InputSection({ onStartProcessing, userId }: InputSectionProps) {
  const [url, setUrl] = useState("")
  const [chatbotName, setChatbotName] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [urlError, setUrlError] = useState("")

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setUrlError("URL is required")
      return false
    }
    
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError("URL must start with http:// or https://")
        return false
      }
      setUrlError("")
      return true
    } catch {
      setUrlError("Please enter a valid URL (e.g., https://example.com)")
      return false
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const generateCollectionName = (name: string, userId: string) => {
    // Generate unique collection name: userId_chatbotName_timestamp
    const timestamp = Date.now()
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "_")
    return `${userId}_${cleanName}_${timestamp}`
  }

  const createChatbotRecord = async (token: string | null, collectionName: string, taskId: string) => {
    try {
      const chatbotResponse = await fetch(`${API_BASE_URL}/chatbots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: chatbotName,
          collection_name: collectionName,
          source_url: url,
          description: `Chatbot created from ${url}`,
          task_id: taskId, // Include task_id if needed
        }),
      })

      if (!chatbotResponse.ok) {
        throw new Error("Failed to create chatbot record")
      }

      return await chatbotResponse.json()
    } catch (error) {
      console.error("Error creating chatbot record:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    if (!validateUrl(url)) {
      return
    }

    if (!chatbotName.trim()) {
      alert("Please enter a chatbot name")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      const collectionName = generateCollectionName(chatbotName, userId)

      // First, process the website URL
      const response = await fetch(`${API_BASE_URL}/scrape-and-ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          collection_name: collectionName,
          chatbot_name: chatbotName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || "Failed to start processing")
        setIsLoading(false)
        return
      }

      // If scrape-and-ingest is successful, process uploaded files (if any)
      let allFilesProcessed = true
      if (files.length > 0) {
        allFilesProcessed = await processUploadedFiles(token, collectionName)
      }

      // Only create chatbot record if URL processing was successful 
      // and all files were processed successfully (or no files were uploaded)
      if (allFilesProcessed) {
        try {
          await createChatbotRecord(token, collectionName, data.task_id)
          onStartProcessing(data.task_id, collectionName, chatbotName)
        } catch (error) {
          alert("Processing completed but failed to save chatbot record. Please try again.")
          setIsLoading(false)
        }
      } else {
        alert("URL processing succeeded but some files failed to upload. Chatbot was not created.")
        setIsLoading(false)
      }
    } catch (error) {
      alert("Network error. Please try again.")
      setIsLoading(false)
    }
  }

  const processUploadedFiles = async (token: string | null, collectionName: string): Promise<boolean> => {
    let allSuccessful = true

    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("collection_name", collectionName)

      try {
        const response = await fetch(`${API_BASE_URL}/upload-and-process`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("File upload error:", errorData)
          allSuccessful = false
          alert(`Failed to process ${file.name}: ${errorData.detail || 'Unknown error'}`)
          // Continue processing other files even if one fails
        }
      } catch (error) {
        console.error("Error uploading file:", file.name, error)
        allSuccessful = false
        alert(`Network error while uploading ${file.name}`)
        // Continue processing other files even if one fails
      }
    }

    return allSuccessful
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="space-y-6">
        {/* Chatbot Name Input */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-gray-700 font-medium">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>Chatbot Name</span>
          </label>
          <input
            type="text"
            value={chatbotName}
            onChange={(e) => setChatbotName(e.target.value)}
            placeholder="Enter a name for your chatbot"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-gray-700 font-medium">
            <Globe className="w-5 h-5 text-blue-600" />
            <span>Website URL</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (e.target.value.trim()) {
                validateUrl(e.target.value)
              } else {
                setUrlError("")
              }
            }}
            placeholder="https://example.com"
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              urlError 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {urlError && (
            <p className="text-red-500 text-sm mt-1">{urlError}</p>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-gray-700 font-medium">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Upload Additional Files (Optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx,.svg"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to upload or drag files here</p>
              <p className="text-sm text-gray-400 mt-1">Supported: PDF, TXT, DOC, DOCX, SVG</p>
            </label>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url.trim() || !chatbotName.trim() || !!urlError}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Chatbot...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Create Chatbot</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
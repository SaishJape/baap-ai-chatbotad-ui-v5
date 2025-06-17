"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, FileText, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface FileEnhancementModalProps {
  isOpen: boolean
  onClose: () => void
  collectionName: string
  chatbotName: string
}

export default function FileEnhancementModal({
  isOpen,
  onClose,
  collectionName,
  chatbotName,
}: FileEnhancementModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.warning("No Files Selected", "Please upload at least one file to enhance your chatbot.")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      let successCount = 0

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

          if (response.ok) {
            successCount++
          } else {
            const errorData = await response.json()
            console.error("File upload error:", errorData)
            toast.error(`Failed to process ${file.name}`, errorData.detail || "Unknown error")
          }
        } catch (error) {
          console.error("Error uploading file:", file.name, error)
          toast.error(`Error uploading ${file.name}`, "Network or server error")
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} ${successCount === 1 ? "File" : "Files"} Processed`,
          `${chatbotName} has been enhanced with new information!`,
        )
        setFiles([])
        onClose()
      }
    } catch (error) {
      console.error("Processing error:", error)
      toast.error("Processing Failed", "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Enhance Chatbot</h2>
                  <p className="text-sm text-gray-600">{chatbotName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Add More Knowledge</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Upload additional files to make your chatbot smarter and more helpful.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx,.svg"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="enhance-file-upload"
                />
                <label
                  htmlFor="enhance-file-upload"
                  className={`cursor-pointer ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag files here</p>
                  <p className="text-sm text-gray-400 mt-1">Supported: PDF, TXT, DOC, DOCX, SVG</p>
                </label>
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || files.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Enhance Chatbot</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

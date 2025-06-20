"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Sparkles, X, AlertTriangle, Save, Trash2 } from "lucide-react"

interface SimpleLoaderProps {
  onCancel?: () => void
  onStopAndStore?: () => void
  taskId?: string
  isCancelling?: boolean
}

export default function SimpleLoader({ onCancel, onStopAndStore, taskId, isCancelling }: SimpleLoaderProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleCancelClick = () => {
    setShowConfirmation(true)
  }

  const handleStopAndStore = () => {
    setShowConfirmation(false)
    onStopAndStore?.()
  }

  const handleDiscardAll = () => {
    setShowConfirmation(false)
    onCancel?.()
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center relative"
      >
        {/* Cancel Button */}
        {(onCancel || onStopAndStore) && !isCancelling && (
          <motion.button
            onClick={handleCancelClick}
            className="absolute top-4 right-4 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Cancel or save partial progress"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}

        {/* Cancelling Indicator */}
        {isCancelling && (
          <motion.div
            className="absolute top-4 right-4 w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
          </motion.div>
        )}

        {/* Animated Bot Icon */}
        <motion.div
          className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Bot className="w-12 h-12 text-white" />
        </motion.div>

        {/* Loading Text */}
        <motion.h2
          className="text-3xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isCancelling ? "Stopping Process..." : "Creating Your AI Chatbot"}
        </motion.h2>

        <motion.p
          className="text-xl text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isCancelling 
            ? "Please wait while we save your progress..." 
            : "Please wait while we process your website and train your AI assistant..."
          }
        </motion.p>

        {/* Animated Progress Dots */}
        {!isCancelling && (
          <div className="flex justify-center space-x-2 mb-8">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        )}

        {/* Cancelling Progress */}
        {isCancelling && (
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
        )}

        {/* Fun Facts */}
        {!isCancelling && (
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Did you know?</span>
            </div>
            <p className="text-blue-700 text-sm">
              Your AI chatbot will be able to understand context, remember conversations, and provide intelligent responses
              based on your website content!
            </p>
          </motion.div>
        )}

        {/* Processing Steps Indicator */}
        {!isCancelling && (
          <motion.div
            className="mt-8 flex justify-center space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {["Crawling Website", "Processing Content", "Training AI", "Finalizing"].map((step, index) => (
              <motion.div
                key={step}
                className="text-center"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.5,
                }}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <span className="text-xs text-gray-500">{step}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cancel/Save Information */}
        {(onCancel || onStopAndStore) && !isCancelling && (
          <motion.p
            className="text-xs text-gray-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            You can stop and save partial progress or cancel completely at any time
          </motion.p>
        )}
      </motion.div>

      {/* Modern Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCancelConfirmation}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-0 max-w-md w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  What would you like to do?
                </h3>
                <p className="text-blue-100 text-sm">
                  Choose your preferred action below
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-3">
                  {/* Save Progress Option */}
                  {onStopAndStore && (
                    <motion.button
                      onClick={handleStopAndStore}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 flex items-center space-x-4 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Save className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">Save Progress</div>
                        <div className="text-sm text-green-100">Create chatbot with current data</div>
                      </div>
                    </motion.button>
                  )}

                  {/* Cancel Option */}
                  {onCancel && (
                    <motion.button
                      onClick={handleDiscardAll}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 flex items-center space-x-4 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">Discard All</div>
                        <div className="text-sm text-red-100">Cancel and lose all progress</div>
                      </div>
                    </motion.button>
                  )}

                  {/* Continue Option */}
                  <motion.button
                    onClick={handleCancelConfirmation}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Continue Creating</span>
                  </motion.button>
                </div>

                {/* Tip */}
                {onStopAndStore && (
                  <motion.div
                    className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <p className="text-xs text-blue-600">
                        <strong>Tip:</strong> Saved progress can be enhanced later with more content
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
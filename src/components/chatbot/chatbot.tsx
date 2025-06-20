"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, Bot, User, Palette, Mail, Linkedin, Phone, Globe } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
  buttons?: boolean
  buttonType?: string[]
  buttonData?: string[]
}

interface ChatBotProps {
  collectionName?: string
  apiUrl?: string
}

const ChatBot: React.FC<ChatBotProps> = ({
  collectionName = "baapcompany",
  apiUrl = `${API_BASE_URL}/ask-question`,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm here to help you. Ask me anything about this website or any topic you'd like to know about.",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState("greenish")
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const themes = {
    greenish: {
      primary: "from-emerald-500 via-teal-500 to-green-600",
      secondary: "from-emerald-50 to-teal-50",
      button: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
      userBubble: "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-200",
      accent: "text-emerald-600",
      dots: ["bg-emerald-400", "bg-teal-400", "bg-green-400"],
      focusRing: "focus:ring-emerald-500 focus:border-emerald-500",
      themeButton: "bg-gradient-to-r from-emerald-500 to-teal-600",
      scrollbar: {
        track: "#f0fdf4", // emerald-50
        thumb: "#10b981", // emerald-500
        thumbHover: "#059669" // emerald-600
      }
    },
    ocean: {
      primary: "from-blue-500 via-cyan-500 to-teal-600",
      secondary: "from-blue-50 to-cyan-50",
      button: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700",
      userBubble: "bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-200",
      accent: "text-blue-600",
      dots: ["bg-blue-400", "bg-cyan-400", "bg-teal-400"],
      focusRing: "focus:ring-blue-500 focus:border-blue-500",
      themeButton: "bg-gradient-to-r from-blue-500 to-cyan-600",
      scrollbar: {
        track: "#eff6ff", // blue-50
        thumb: "#3b82f6", // blue-500
        thumbHover: "#2563eb" // blue-600
      }
    },
    sunset: {
      primary: "from-orange-500 via-pink-500 to-purple-600",
      secondary: "from-orange-50 to-pink-50",
      button: "bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700",
      userBubble: "bg-gradient-to-br from-orange-500 to-pink-600 border-orange-200",
      accent: "text-orange-600",
      dots: ["bg-orange-400", "bg-pink-400", "bg-purple-400"],
      focusRing: "focus:ring-orange-500 focus:border-orange-500",
      themeButton: "bg-gradient-to-r from-orange-500 to-pink-600",
      scrollbar: {
        track: "#fff7ed", // orange-50
        thumb: "#f97316", // orange-500
        thumbHover: "#ea580c" // orange-600
      }
    },
    royal: {
      primary: "from-purple-500 via-indigo-500 to-blue-600",
      secondary: "from-purple-50 to-indigo-50",
      button: "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
      userBubble: "bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-200",
      accent: "text-purple-600",
      dots: ["bg-purple-400", "bg-indigo-400", "bg-blue-400"],
      focusRing: "focus:ring-purple-500 focus:border-purple-500",
      themeButton: "bg-gradient-to-r from-purple-500 to-indigo-600",
      scrollbar: {
        track: "#faf5ff", // purple-50
        thumb: "#a855f7", // purple-500
        thumbHover: "#9333ea" // purple-600
      }
    },
    crimson: {
      primary: "from-red-500 via-rose-500 to-pink-600",
      secondary: "from-red-50 to-rose-50",
      button: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      userBubble: "bg-gradient-to-br from-red-500 to-rose-600 border-red-200",
      accent: "text-red-600",
      dots: ["bg-red-400", "bg-rose-400", "bg-pink-400"],
      focusRing: "focus:ring-red-500 focus:border-red-500",
      themeButton: "bg-gradient-to-r from-red-500 to-rose-600",
      scrollbar: {
        track: "#fef2f2", // red-50
        thumb: "#ef4444", // red-500
        thumbHover: "#dc2626" // red-600
      }
    },
    midnight: {
      primary: "from-slate-700 via-gray-800 to-slate-900",
      secondary: "from-slate-100 to-gray-100",
      button: "bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900",
      userBubble: "bg-gradient-to-br from-slate-700 to-gray-800 border-slate-200",
      accent: "text-slate-700",
      dots: ["bg-slate-500", "bg-gray-500", "bg-slate-600"],
      focusRing: "focus:ring-slate-500 focus:border-slate-500",
      themeButton: "bg-gradient-to-r from-slate-700 to-gray-800",
      scrollbar: {
        track: "#f8fafc", // slate-50
        thumb: "#64748b", // slate-500
        thumbHover: "#475569" // slate-600
      }
    },
    forest: {
      primary: "from-green-600 via-lime-500 to-emerald-600",
      secondary: "from-green-50 to-lime-50",
      button: "bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700",
      userBubble: "bg-gradient-to-br from-green-600 to-lime-600 border-green-200",
      accent: "text-green-600",
      dots: ["bg-green-400", "bg-lime-400", "bg-emerald-400"],
      focusRing: "focus:ring-green-500 focus:border-green-500",
      themeButton: "bg-gradient-to-r from-green-600 to-lime-600",
      scrollbar: {
        track: "#f0fdf4", // green-50
        thumb: "#16a34a", // green-600
        thumbHover: "#15803d" // green-700
      }
    },
    golden: {
      primary: "from-yellow-500 via-amber-500 to-orange-500",
      secondary: "from-yellow-50 to-amber-50",
      button: "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700",
      userBubble: "bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-200",
      accent: "text-yellow-600",
      dots: ["bg-yellow-400", "bg-amber-400", "bg-orange-400"],
      focusRing: "focus:ring-yellow-500 focus:border-yellow-500",
      themeButton: "bg-gradient-to-r from-yellow-500 to-amber-600",
      scrollbar: {
        track: "#fffbeb", // amber-50
        thumb: "#f59e0b", // amber-500
        thumbHover: "#d97706" // amber-600
      }
    },
    coral: {
      primary: "from-pink-500 via-coral-500 to-red-500",
      secondary: "from-pink-50 to-rose-50",
      button: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
      userBubble: "bg-gradient-to-br from-pink-500 to-rose-500 border-pink-200",
      accent: "text-pink-600",
      dots: ["bg-pink-400", "bg-rose-400", "bg-red-400"],
      focusRing: "focus:ring-pink-500 focus:border-pink-500",
      themeButton: "bg-gradient-to-r from-pink-500 to-rose-500",
      scrollbar: {
        track: "#fdf2f8", // pink-50
        thumb: "#ec4899", // pink-500
        thumbHover: "#db2777" // pink-600
      }
    },
    arctic: {
      primary: "from-slate-400 via-blue-300 to-cyan-400",
      secondary: "from-slate-50 to-blue-50",
      button: "bg-gradient-to-r from-slate-400 to-blue-400 hover:from-slate-500 hover:to-blue-500",
      userBubble: "bg-gradient-to-br from-slate-400 to-blue-400 border-slate-200",
      accent: "text-slate-600",
      dots: ["bg-slate-300", "bg-blue-300", "bg-cyan-300"],
      focusRing: "focus:ring-slate-400 focus:border-slate-400",
      themeButton: "bg-gradient-to-r from-slate-400 to-blue-400",
      scrollbar: {
        track: "#f8fafc", // slate-50
        thumb: "#94a3b8", // slate-400
        thumbHover: "#64748b" // slate-500
      }
    },
    neon: {
      primary: "from-lime-400 via-green-400 to-emerald-400",
      secondary: "from-lime-50 to-green-50",
      button: "bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600",
      userBubble: "bg-gradient-to-br from-lime-400 to-green-500 border-lime-200",
      accent: "text-lime-600",
      dots: ["bg-lime-300", "bg-green-300", "bg-emerald-300"],
      focusRing: "focus:ring-lime-400 focus:border-lime-400",
      themeButton: "bg-gradient-to-r from-lime-400 to-green-500",
      scrollbar: {
        track: "#f7fee7", // lime-50
        thumb: "#a3e635", // lime-400
        thumbHover: "#84cc16" // lime-500
      }
    },
    cosmos: {
      primary: "from-indigo-600 via-purple-600 to-pink-600",
      secondary: "from-indigo-50 to-purple-50",
      button: "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800",
      userBubble: "bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-200",
      accent: "text-indigo-600",
      dots: ["bg-indigo-400", "bg-purple-400", "bg-pink-400"],
      focusRing: "focus:ring-indigo-500 focus:border-indigo-500",
      themeButton: "bg-gradient-to-r from-indigo-600 to-purple-700",
      scrollbar: {
        track: "#eef2ff", // indigo-50
        thumb: "#4f46e5", // indigo-600
        thumbHover: "#4338ca" // indigo-700
      }
    },
  }

  const currentTheme = themes[theme as keyof typeof themes] || themes.greenish

  // Dynamic CSS for scrollbar styling
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'chatbot-scrollbar-style'
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById('chatbot-scrollbar-style')
    if (existingStyle) {
      existingStyle.remove()
    }

    style.innerHTML = `
      .chatbot-messages::-webkit-scrollbar {
        width: 6px;
      }
      
      .chatbot-messages::-webkit-scrollbar-track {
        background: ${currentTheme.scrollbar.track};
        border-radius: 3px;
      }
      
      .chatbot-messages::-webkit-scrollbar-thumb {
        background: ${currentTheme.scrollbar.thumb};
        border-radius: 3px;
        transition: background-color 0.2s ease;
      }
      
      .chatbot-messages::-webkit-scrollbar-thumb:hover {
        background: ${currentTheme.scrollbar.thumbHover};
      }

      .chatbot-settings::-webkit-scrollbar {
        width: 4px;
      }
      
      .chatbot-settings::-webkit-scrollbar-track {
        background: ${currentTheme.scrollbar.track};
        border-radius: 2px;
      }
      
      .chatbot-settings::-webkit-scrollbar-thumb {
        background: ${currentTheme.scrollbar.thumb};
        border-radius: 2px;
      }
      
      .chatbot-settings::-webkit-scrollbar-thumb:hover {
        background: ${currentTheme.scrollbar.thumbHover};
      }
    `
    
    document.head.appendChild(style)

    // Cleanup function to remove style when component unmounts
    return () => {
      const styleToRemove = document.getElementById('chatbot-scrollbar-style')
      if (styleToRemove) {
        styleToRemove.remove()
      }
    }
  }, [theme, currentTheme])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatTextWithBold = (text: string) => {
    const parts = text.split("**")
    return parts.map((part, partIndex) => {
      if (partIndex % 2 === 1) {
        return (
          <strong key={partIndex} className="font-bold">
            {part}
          </strong>
        )
      }
      return part
    })
  }

  const formatMessage = (text: string) => {
    const paragraphs = text.split("\n\n")

    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split("\n")

      return (
        <div key={pIndex} className={pIndex > 0 ? "mt-3" : ""}>
          {lines.map((line, lIndex) => {
            if (!line.trim()) return null

            const isBulletPoint = line.trim().startsWith("- ") || line.trim().startsWith("* ")

            if (isBulletPoint) {
              const bulletText = line.trim().substring(2)
              return (
                <div key={lIndex} className="flex items-start space-x-2 ml-4">
                  <span className={`${currentTheme.accent} font-bold mt-0.5`}>•</span>
                  <span>{formatTextWithBold(bulletText)}</span>
                </div>
              )
            }

            const numberedMatch = line.trim().match(/^(\d+)\.\s*(.+)/)
            if (numberedMatch) {
              const [, number, content] = numberedMatch
              return (
                <div key={lIndex} className="flex items-start space-x-2 ml-4">
                  <span className={`${currentTheme.accent} font-semibold min-w-[20px] mt-0.5`}>{number}.</span>
                  <span>{formatTextWithBold(content)}</span>
                </div>
              )
            }

            return (
              <div key={lIndex} className={lIndex > 0 ? "mt-1" : ""}>
                {formatTextWithBold(line)}
              </div>
            )
          })}
        </div>
      )
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getButtonIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "linkedin":
        return <Linkedin className="w-4 h-4" />
      case "phone":
        return <Phone className="w-4 h-4" />
      case "website":
      case "url":
        return <Globe className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const handleButtonClick = (type: string, data: string) => {
    switch (type.toLowerCase()) {
      case "email":
        window.open(`mailto:${data}`, "_blank")
        break
      case "linkedin":
        window.open(data, "_blank")
        break
      case "phone":
        window.open(`tel:${data}`, "_blank")
        break
      case "website":
      case "url":
        window.open(data, "_blank")
        break
      default:
        window.open(data, "_blank")
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          question: inputValue,
          collection_name: collectionName,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const botResponse = data.response || data.answer || "I'm sorry, I couldn't process your request."
      const buttons = data.buttons || false
      const buttonType = data.button_type || null
      const buttonData = data.button_data || null

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        buttons,
        buttonType,
        buttonData,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chatbot API Error:", error)
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error while processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button - Smaller Size */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br ${currentTheme.primary} rounded-full shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 ${isOpen ? "hidden" : "block"} ring-2 ring-white/20`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window - Smaller Size */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <div className={`bg-gradient-to-r ${currentTheme.primary} text-white p-3 flex justify-between items-center`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">BAAP AI</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          {showSettings && (
            <div className="p-3 border-b border-gray-100 bg-gray-50 max-h-32 overflow-y-auto chatbot-settings">
              <p className="text-xs font-medium text-gray-700 mb-2">Choose Theme:</p>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(themes).map((themeName) => {
                  const themeData = themes[themeName as keyof typeof themes]
                  return (
                    <button
                      key={themeName}
                      onClick={() => setTheme(themeName)}
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize transition-colors text-white ${
                        theme === themeName
                          ? `${themeData.themeButton} ring-1 ring-gray-400`
                          : `${themeData.themeButton} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {themeName}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b ${currentTheme.secondary} chatbot-messages`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col space-y-1 ${message.isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-start space-x-2 ${message.isUser ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser
                        ? currentTheme.userBubble.replace("bg-gradient-to-br", "bg-gradient-to-br")
                        : `bg-gradient-to-br ${currentTheme.primary}`
                    }`}
                  >
                    {message.isUser ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
                  </div>

                  <div className={`flex flex-col max-w-[85%] ${message.isUser ? "items-end" : "items-start"}`}>
                    {/* Message Bubble */}
                    <div
                      className={`px-3 py-2 rounded-xl shadow-sm border text-sm ${
                        message.isUser
                          ? `${currentTheme.userBubble} text-white`
                          : "bg-white text-gray-800 border-gray-200 shadow-md"
                      }`}
                    >
                      <div className=" leading-relaxed font-medium">
                        {message.isUser ? message.text : formatMessage(message.text)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!message.isUser && message.buttons && message.buttonType && message.buttonData && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.buttonType.map((type, index) => (
                          <button
                            key={index}
                            onClick={() => handleButtonClick(type, message.buttonData![index])}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${currentTheme.button} text-white hover:scale-105 transform`}
                          >
                            {getButtonIcon(type)}
                            <span className="capitalize">{type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Time below message */}
                <div className={`text-[10px] text-gray-400 ${message.isUser ? "mr-8" : "ml-8"}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col space-y-1 items-start">
                <div className="flex items-start space-x-2">
                  <div
                    className={`w-6 h-6 bg-gradient-to-br ${currentTheme.primary} rounded-full flex items-center justify-center`}
                  >
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <div className="bg-white border border-gray-200 shadow-md px-3 py-2 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className={`w-1.5 h-1.5 ${currentTheme.dots[0]} rounded-full animate-bounce`}></div>
                          <div
                            className={`w-1.5 h-1.5 ${currentTheme.dots[1]} rounded-full animate-bounce`}
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className={`w-1.5 h-1.5 ${currentTheme.dots[2]} rounded-full animate-bounce`}
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 ml-8">{formatTime(new Date())}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className={`flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${currentTheme.focusRing} text-sm font-medium placeholder-gray-400 shadow-sm`}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`${currentTheme.button} text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
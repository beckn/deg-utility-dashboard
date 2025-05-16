"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AgentMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  charts?: AgentChartData[]
}

interface AgentChartData {
  id: string
  title: string
  value: number
  color: string
  data: Array<{ name: string; value: number; color: string }>
}

interface UtilityAgentProps {
  onClose: () => void
}

export function UtilityAgent({ onClose }: UtilityAgentProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "1",
      text: "Good morning! Based on your past 12 months of usage and roof geometry, you're an excellent candidate for rooftop solar + battery.\n\nWould you like me to prepare a personalized plan and begin coordination?",
      isUser: false,
      timestamp: new Date(),
      charts: [],
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMessage: AgentMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInputText("")

    setTimeout(() => {
      const agentResponse: AgentMessage = {
        id: (Date.now() + 1).toString(),
        text: "I understand. Let me process that for you.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentResponse])
    }, 1000)
  }

  const renderChart = (chart: AgentChartData) => {
    return (
      <Card key={chart.id} className="bg-white shadow-sm w-32">
        <CardContent className="p-3">
          <h4 className="text-xs font-medium text-gray-600 mb-2">{chart.title}</h4>
          <div className="text-center text-lg font-bold">{chart.value}%</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={`fixed bottom-20 right-6 bg-gray-700 rounded-lg shadow-xl transition-all duration-300 z-50 ${
        isMinimized ? "w-64 h-12" : "w-[350px] md:w-[600px] h-[500px]"
      }`}
    >
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">AI</span>
          </div>
          <span className="text-white font-medium">Utility Agent</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-gray-500 h-8 w-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="sr-only">Minimize</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-500 h-8 w-8 p-0">
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-3 bg-gray-50" style={{ height: "calc(100% - 100px)" }}>
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.isUser ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block p-3 rounded-lg max-w-[90%] ${
                    message.isUser ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.charts && message.charts.length > 0 && (
                    <div className="mt-3 flex space-x-3 overflow-x-auto">{message.charts.map(renderChart)}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-3 bg-white border-t rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Message"
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="bg-blue-600 text-white hover:bg-blue-700">
                <Send className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

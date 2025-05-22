"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2, BarChart3 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  charts?: ChartData[];
}

interface ChartData {
  id: string;
  title: string;
  value: number;
  color: string;
  data: Array<{ name: string; value: number; color: string }>;
}

interface UtilityAgentProps {
  onClose?: () => void;
  initialMessage?: string;
}

const UtilityAgent: React.FC<UtilityAgentProps> = ({
  onClose,
  initialMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text:
        initialMessage ||
        "Good morning! Based on your past 12 months of usage and roof geometry, you're an excellent candidate for rooftop solar + battery.\n\nWould you like me to prepare a personalized plan and begin coordination?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText("");

    // Call chat API
    try {
      const chatResponse = await fetch(
        "https://api-deg-agents.becknprotocol.io/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: inputText,
            client_id: "test_123",
            is_utility: true,
          }),
        }
      );

      const chatData = await chatResponse.json();

      // Add agent response
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          chatData.message ||
          chatData.response.message ||
          "I apologize, but I'm having trouble understanding. Could you please rephrase that?",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentResponse]);
    } catch (error) {
      console.error("Error getting chat response:", error);

      // Add error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderChart = (chart: ChartData) => {
    return (
      <div key={chart.id} className="bg-white p-3 rounded-lg shadow-sm w-32">
        <h4 className="text-xs font-medium text-gray-600 mb-2">
          {chart.title}
        </h4>
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke={chart.color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${chart.value * 2.2} 220`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-800">
              {chart.value}%
            </span>
          </div>
        </div>
        <div className="space-y-1 text-xs">
          {chart.data.map((item) => (
            <div key={item.name} className="flex justify-between">
              <div className="flex items-center space-x-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-medium">{item.value}K</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-card text-foreground rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Agent Chat</span>
            </div>
            <span className="ml-3 text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>{" "}
              Online
            </span>
        </div>
      </div>
      {/* Messages */}
      <div
        className="flex-1 px-6 py-4 overflow-y-auto flex flex-col gap-1 bg-card"
        style={{ minHeight: 0 }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.isUser ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs ${
                  message.isUser
                    ? "text-blue-400"
                    : "text-blue-300 font-semibold"
                }`}
              >
                {message.isUser ? "You" : "Grid Agent"}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
            {/* <span
              className={
                message.isUser ? "text-blue-400" : "text-blue-300 font-semibold"
              }
            >
              {message.isUser ? "You" : "Grid Agent"}
            </span> */}
            <div
              className={`mt-1 inline-block px-3 py-2 rounded-lg ${
                message.isUser
                  ? "bg-primary text-primary-foreground"
                  : "chat-input-message text-foreground"
              }`}
            >
              {message.text}
              {message.charts && (
                <div className="mt-3 flex space-x-3 overflow-x-auto">
                  {message.charts.map(renderChart)}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg px-3 py-2 chat-input-message border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type a Message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UtilityAgent;

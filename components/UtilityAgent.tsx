// components/UtilityAgent.tsx (Updated with more detailed UI)
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
  onClose: () => void;
}

const UtilityAgent: React.FC<UtilityAgentProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Good morning! Based on your past 12 months of usage and roof geometry, you're an excellent candidate for rooftop solar + battery.\n\nWould you like me to prepare a personalized plan and begin coordination?",
      isUser: false,
      timestamp: new Date(),
      charts: [
        {
          id: "chart1",
          title: "March 2023",
          value: 50,
          color: "#3b82f6",
          data: [
            { name: "Option A", value: 2.3, color: "#3b82f6" },
            { name: "Option B", value: 19.2, color: "#ef4444" },
            { name: "Option C", value: 5.5, color: "#f59e0b" },
            { name: "Option D", value: 53, color: "#eab308" },
          ],
        },
        {
          id: "chart2",
          title: "March 2023",
          value: 50,
          color: "#3b82f6",
          data: [
            { name: "Option A", value: 2.3, color: "#3b82f6" },
            { name: "Option B", value: 19.2, color: "#ef4444" },
            { name: "Option C", value: 5.5, color: "#f59e0b" },
            { name: "Option D", value: 53, color: "#eab308" },
          ],
        },
        {
          id: "chart3",
          title: "March 2023",
          value: 50,
          color: "#3b82f6",
          data: [
            { name: "Option A", value: 2.3, color: "#3b82f6" },
            { name: "Option B", value: 19.2, color: "#ef4444" },
            { name: "Option C", value: 5.5, color: "#f59e0b" },
            { name: "Option D", value: 53, color: "#eab308" },
          ],
        },
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand your interest. Let me analyze your current energy usage patterns and local solar potential to create a customized recommendation.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
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
    <div
      className={`fixed bottom-20 right-6 bg-gray-700 rounded-lg shadow-xl transition-all duration-300 ${
        isMinimized ? "w-64 h-12" : "w-[600px] h-[500px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">AI</span>
          </div>
          <span className="text-white font-medium">Utility Agent</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-gray-500 p-1 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-gray-500 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            className="flex-1 p-3 overflow-y-auto bg-gray-50"
            style={{ height: "400px" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.isUser ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[90%] ${
                    message.isUser
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
          <div className="p-3 bg-white border-t rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UtilityAgent;

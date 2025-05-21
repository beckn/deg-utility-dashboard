"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2, BarChart3 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
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
  // Generate a stable ID for the initial message
  const initialMessageId = useRef(`initial-${Math.random().toString(36).substring(2, 11)}`).current;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: initialMessageId,
      text:
        initialMessage ||
        "Good morning! Based on your past 12 months of usage and roof geometry, you're an excellent candidate for rooftop solar + battery.\n\nWould you like me to prepare a personalized plan and begin coordination?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const messageIdCounter = useRef(1);

  // Generate stable IDs for messages
  const generateMessageId = () => {
    return `msg-${messageIdCounter.current++}`;
  };

  // Initialize WebSocket connection
  useEffect(() => {
    // Try to get stored client ID
    clientIdRef.current = localStorage.getItem('grid_utility_client_id');
    
    // Connect to WebSocket
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    // Create WebSocket connection using environment variable
    const wsUrl = process.env.NEXT_PUBLIC_GRID_UTILITY_WS_URL || 'wss://api-deg-agents.becknprotocol.io/grid-utility/ws';
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnecting(false);
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log("WebSocket message received:", response);

        // Store client ID if provided
        if (response.client_id) {
          clientIdRef.current = response.client_id;
          localStorage.setItem('grid_utility_client_id', response.client_id);
        }

        // Handle different response types
        switch (response.status) {
          case 'connected':
            console.log('Connected to grid-utility AI');
            break;
          case 'processing':
            // Could add a typing indicator here
            break;
          case 'success':
            // Add AI response to messages
            if (response.message) {
              const agentResponse: Message = {
                id: generateMessageId(),
                text: response.message,
                isUser: false,
                timestamp: new Date().toISOString(),
              };
              setMessages(prev => [...prev, agentResponse]);
            }
            break;
          case 'error':
            console.error('WebSocket error:', response.message);
            const errorResponse: Message = {
              id: generateMessageId(),
              text: `Error: ${response.message || 'Something went wrong'}`,
              isUser: false,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorResponse]);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionError("Failed to connect to the utility agent");
      setIsConnecting(false);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      
      // Attempt to reconnect if closed unexpectedly
      if (event.code !== 1000) {
        setTimeout(() => {
          if (socketRef.current?.readyState !== WebSocket.OPEN) {
            connectWebSocket();
          }
        }, 3000);
      }
    };
  };

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
      id: generateMessageId(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInputText("");

    // Send message via WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        query: inputText,
        client_id: clientIdRef.current
      };
      socketRef.current.send(JSON.stringify(message));
    } else {
      // WebSocket not connected, try to reconnect
      connectWebSocket();
      
      // Add error message
      const errorResponse: Message = {
        id: generateMessageId(),
        text: "Connection to the utility agent was lost. Attempting to reconnect...",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorResponse]);
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

  // Format timestamp string to display time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Render message content with or without markdown
  const renderMessageContent = (message: Message) => {
    if (message.isUser) {
      return message.text;
    }
    
    // For non-user messages, try to render markdown
    try {
      return (
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-1">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      );
    } catch (error) {
      console.error("Error rendering markdown:", error);
      return message.text;
    }
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
              {isConnecting ? "Connecting..." : "Online"}
            </span>
        </div>
      </div>
      {/* Messages */}
      <div
        className="flex-1 px-6 py-4 overflow-y-auto flex flex-col gap-1 bg-card"
        style={{ minHeight: 0 }}
      >
        {connectionError && (
          <div className="bg-red-50 text-red-500 p-2 rounded-md mb-2 text-sm">
            {connectionError}
          </div>
        )}
        
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
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div
              className={`mt-1 inline-block px-3 py-2 rounded-lg ${
                message.isUser
                  ? "bg-primary text-primary-foreground"
                  : "chat-input-message text-foreground"
              }`}
            >
              {renderMessageContent(message)}
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
          disabled={isConnecting}
        />
        <button
          onClick={handleSendMessage}
          className={`rounded-full p-2 transition ${
            isConnecting 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          disabled={isConnecting}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UtilityAgent;

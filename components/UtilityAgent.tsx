"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2, BarChart3, AlertTriangle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  charts?: ChartData[];
  isLoading?: boolean;
  type?: string;
  transformerData?: any;
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
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing
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
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    // Don't reconnect if already connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      setIsConnecting(false);
      return;
    }
    
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

        // Handle grid alerts
        if (response.status === 'alert' || (response.type === 'grid_alert' && response.status === 'success')) {
          const alertMessage: Message = {
            id: generateMessageId(),
            text: response.message,
            isUser: false,
            timestamp: new Date().toISOString(),
            type: 'grid_alert',
            transformerData: response.transformer_data
          };
          
          setMessages(prev => [...prev, alertMessage]);
          
          // If this is an alert with status 'success', we've already handled it
          if (response.status === 'success') {
            return;
          }
        }

        // Handle different response types
        switch (response.status) {
          case 'connected':
            console.log('Connected to grid-utility AI');
            break;
          case 'processing':
            // Set processing state to true
            setIsProcessing(true);
            break;
          case 'success':
            // Set processing state to false
            setIsProcessing(false);
            
            // Add AI response to messages (if not already handled as a grid alert)
            if (response.message && response.type !== 'grid_alert') {
              const agentResponse: Message = {
                id: generateMessageId(),
                text: response.message,
                isUser: false,
                timestamp: new Date().toISOString(),
                type: response.type
              };
              setMessages(prev => [...prev, agentResponse]);
            }
            break;
          case 'error':
            // Set processing state to false
            setIsProcessing(false);
            
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
        setIsProcessing(false);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionError("Failed to connect to the utility agent");
      setIsConnecting(false);
      setIsProcessing(false);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      setIsConnecting(false);
      setIsProcessing(false);
      
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

  const handleSendMessage = () => {
    if (!inputText.trim() || isConnecting) return;

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Ensure we scroll to the bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    // Send message to WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        query: inputText,
        client_id: clientIdRef.current
      };
      
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket not connected");
      
      // Attempt to reconnect
      connectWebSocket();
      
      // Add error message
      const errorResponse: Message = {
        id: generateMessageId(),
        text: "Connection to the utility agent was lost. Attempting to reconnect...",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorResponse]);
      
      // Queue the message to be sent once reconnected
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const message = {
            query: inputText,
            client_id: clientIdRef.current
          };
          socketRef.current.send(JSON.stringify(message));
        }
      }, 3000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderChart = (chart: ChartData) => {
    return (
      <div
        key={chart.id}
        className="min-w-[200px] p-3 rounded-lg bg-background border border-border"
      >
        <div className="text-sm font-medium mb-2">{chart.title}</div>
        <div className="text-2xl font-bold" style={{ color: chart.color }}>
          {chart.value}
        </div>
        <div className="mt-2 space-y-1">
          {chart.data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span>{item.name}</span>
              <span style={{ color: item.color }}>{item.value}</span>
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

  // Get message class based on type
  const getMessageClass = (message: Message) => {
    if (message.isUser) {
      return "bg-primary text-primary-foreground";
    }
    
    if (message.type === 'grid_alert') {
      return "bg-amber-50 border-l-4 border-amber-500 text-amber-800";
    }
    
    return "chat-input-message text-foreground";
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
              {message.type === 'grid_alert' && (
                <span className="text-xs text-amber-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Alert
                </span>
              )}
            </div>
            <div
              className={`mt-1 inline-block px-3 py-2 rounded-lg ${getMessageClass(message)}`}
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
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-start mt-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-300 font-semibold">
                  Grid Agent
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(new Date().toISOString())}
                </span>
              </div>
              <div className="mt-1 inline-block px-3 py-2 rounded-lg chat-input-message text-foreground">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
      
      {/* CSS for typing indicator */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: #8B5CF6;
          border-radius: 50%;
          display: inline-block;
          opacity: 0.4;
        }
        
        .typing-indicator span:nth-child(1) {
          animation: pulse 1s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(2) {
          animation: pulse 1s infinite ease-in-out 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation: pulse 1s infinite ease-in-out 0.4s;
        }
        
        @keyframes pulse {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          30% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UtilityAgent;

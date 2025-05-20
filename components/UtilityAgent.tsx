"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2, BarChart3 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  charts?: ChartData[];
  type?: string;
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

const conversationFlow = [
  { sender: 'agent', text: 'Alert: Grid Stress Detected – Capacity Breach Likely in 30 Minutes' },
  { sender: 'agent', text: `Feeder status summary:\n\nM12:\nRegion: Bernal Heights\nCapacity: 1.2 MW\nCurrent Load: 1.07 MW (89%)\n\nInner Richmond:\nRegion : Outer Sunset / Parkside\nCapacity: 1.4 MW\nCurrent Load: 1.22 MW (87%)\n\nS7:\nRegion : Outer Sunset / Parkside\nCapacity: 1.5 MW\nCurrent Load: 1.26vMW (84%)` },
  { sender: 'agent', text: 'Should mitigation options be displayed?' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: 'Mitigation Options – Feeder M12 Target newly onboarded DER homes in Bernal Heights Estimated Relief: 320 kW Risk Level: Low Filters: Auto-consent, low-latency devices Combine DER curtailment, battery dispatch, and pause EV charging Estimated Relief: 850 kW Risk Level: Moderate Filters: Fallback Tier 1-ready, aggregator-controlled Full curtailment: DERs, batteries, and smart thermostat pre-cooling Estimated Relief: 1.7 MW Risk Level: High Filters: Includes fallback Tier 2, comfort trade-offs' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: 'Exclusions Applied: • Battery B3 (Precita Park) is offline for diagnostics • Six DERs flagged as essential-use or medical are excluded Confirm Initiation for Option B?' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: 'Initiating Option 2 • Commands routed through aggregators A1, A4, and B6 Actions dispatched: • 47 DER-enabled homes triggered • Battery Units B1 and B2 activated • EV charging paused for 22 sessions • Smart thermostats raised by 2°F • Water heaters delayed by 15 minutes • Consent checks completed via Residential Energy Agents Live Device Response: • 38 households accepted • 5 are pending • 4 declined: • 2 due to air quality sensor limits • 1 inverter unresponsive • 1 consent expired Should fallback be activated?' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: 'Fallback Tier 1 Activated • 17 additional thermostats and legacy EV ports triggered • Fallback contracts verified with aggregators • Tier 2 fallback staged with 5-second delay threshold • Mean device response time: 2.3 seconds • No violations of policy or consent detected Ready to log and tag the event?' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: 'Event Logged – ID: M12-0508-E03 • Fallback success rate: 91% • Average household reduction: 850 watts • Inverter issue sent to DER maintenance • Event recorded on DEG network with hash: 0xf7e1...9a2c • Timestamp: 2025-05-08 18:04:32 PST Would you like to view a DER performance summary?' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: 'Feeder M12 – DER Performance Summary (Past 30 Days) • 93 DER homes onboarded • Asset mix: 64 solar, 22 batteries, 38 thermostats • Participation rate: 87% • Median response latency: 2.1 seconds • Aggregator compliance: 100% • Fallback Tier 1 success across last 7 events: 91% Share with planning?' },
  { sender: 'user', text: '' },
  { sender: 'agent', text: '• Summary sent to Planning • DER availability map updated • Prediction model retrained All logs archived for audit and compliance' },
];

const UtilityAgent: React.FC<UtilityAgentProps> = ({
  onClose,
  initialMessage,
}) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (step < 3) {
      setIsAgentTyping(true);
      const timer = setTimeout(() => {
        setIsAgentTyping(false);
        setMessages((prev) => [...prev, {
          id: Date.now().toString() + step,
          text: conversationFlow[step].text,
          isUser: false,
          timestamp: new Date(),
          type: "agent"
        }]);
        setStep((prev) => prev + 1);
        if (step === 2) setInputEnabled(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !inputEnabled) return;
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      type: "user"
    }]);
    setInputText("");
    setInputEnabled(false);

    let nextStep = step + 1;
    while (nextStep < conversationFlow.length && conversationFlow[nextStep].sender !== 'agent') {
      nextStep++;
    }
    if (nextStep < conversationFlow.length) {
      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
        setMessages((prev) => [...prev, {
          id: Date.now().toString() + nextStep,
          text: conversationFlow[nextStep].text,
          isUser: false,
          timestamp: new Date(),
          type: "agent"
        }]);
        setStep(nextStep);
        setInputEnabled(true);
      }, 1200);
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
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-base font-bold text-primary-foreground">
                  AI
                </span>
              </div>
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
        className="flex-1 px-6 py-4 overflow-y-auto flex flex-col-reverse gap-4 bg-card"
        style={{ minHeight: 0 }}
      >
        {[...messages].reverse().map((message, idx) => {
          const isFirstGridAgentMsg =
            messages.length - idx - 1 === 0 && !message.isUser;
          return (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.isUser ? "items-end" : "items-start"
              } animate-slide-in-up`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold ${
                    message.isUser
                      ? "text-green-400"
                      : "text-blue-300"
                  }`}
                >
                  {message.isUser ? "Operator" : "Grid Agent"}
                </span>
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={
                  isFirstGridAgentMsg
                    ? "mt-2 mb-2 inline-block px-4 py-3 rounded-lg bg-[#334155] text-white text-lg"
                    : `mt-1 inline-block px-3 py-2 rounded-lg ${
                        message.isUser
                          ? "bg-blue-500 text-white"
                          : "bg-[#334155] text-gray-100"
                      }`
                }
              >
                {message.text}
                {('charts' in message) && Array.isArray((message as any).charts) && (message as any).charts.length > 0 && (
                  <div className="mt-3 flex space-x-3 overflow-x-auto">
                    {(message as any).charts.map(renderChart)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isAgentTyping && (
          <div className="flex items-start mt-2">
            <div className="px-4 py-2 bg-[#334155] text-gray-100 rounded-lg">
              <span className="dot-typing">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-3 border-t border-border flex items-center gap-2 ">
        <input
          type="text"
          className="flex-1 rounded-lg px-3 py-2 bg-[#475569] border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type a Message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!inputEnabled}
        />
        <button
          onClick={handleSendMessage}
          className="w-10 h-10 bg-[#224694] rounded-sm flex items-center justify-center hover:bg-[#1b356b] transition"
          disabled={!inputEnabled}
        >
          <Send className="text-white rotate-40" />
        </button>
      </div>
    </div>
  );
};

export default UtilityAgent;
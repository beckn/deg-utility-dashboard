"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
  {
    sender: "agent",
    text: "Alert: Grid Stress Detected – Capacity Breach Likely in 30 Minutes",
  },
  {
    sender: "agent",
    text: `Feeder status summary:\n\nM12:\nRegion: Bernal Heights\nCapacity: 1.2 MW\nCurrent Load: 1.07 MW (89%)\n\nInner Richmond:\nRegion : Outer Sunset / Parkside\nCapacity: 1.4 MW\nCurrent Load: 1.22 MW (87%)\n\nS7:\nRegion : Outer Sunset / Parkside\nCapacity: 1.5 MW\nCurrent Load: 1.26vMW (84%)`,
  },
  { sender: "agent", text: "Should mitigation options be displayed?" },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "Mitigation Options – Feeder M12 Target newly onboarded DER homes in Bernal Heights Estimated Relief: 320 kW Risk Level: Low Filters: Auto-consent, low-latency devices Combine DER curtailment, battery dispatch, and pause EV charging Estimated Relief: 850 kW Risk Level: Moderate Filters: Fallback Tier 1-ready, aggregator-controlled Full curtailment: DERs, batteries, and smart thermostat pre-cooling Estimated Relief: 1.7 MW Risk Level: High Filters: Includes fallback Tier 2, comfort trade-offs",
  },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "Exclusions Applied: • Battery B3 (Precita Park) is offline for diagnostics • Six DERs flagged as essential-use or medical are excluded Confirm Initiation for Option B?",
  },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "Initiating Option 2 • Commands routed through aggregators A1, A4, and B6 Actions dispatched: • 47 DER-enabled homes triggered • Battery Units B1 and B2 activated • EV charging paused for 22 sessions • Smart thermostats raised by 2°F • Water heaters delayed by 15 minutes • Consent checks completed via Residential Energy Agents Live Device Response: • 38 households accepted • 5 are pending • 4 declined: • 2 due to air quality sensor limits • 1 inverter unresponsive • 1 consent expired Should fallback be activated?",
  },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "Fallback Tier 1 Activated • 17 additional thermostats and legacy EV ports triggered • Fallback contracts verified with aggregators • Tier 2 fallback staged with 5-second delay threshold • Mean device response time: 2.3 seconds • No violations of policy or consent detected Ready to log and tag the event?",
  },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "Event Logged – ID: M12-0508-E03 • Fallback success rate: 91% • Average household reduction: 850 watts • Inverter issue sent to DER maintenance • Event recorded on DEG network with hash: 0xf7e1...9a2c • Timestamp: 2025-05-08 18:04:32 PST Would you like to view a DER performance summary?",
  },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "Feeder M12 – DER Performance Summary (Past 30 Days) • 93 DER homes onboarded • Asset mix: 64 solar, 22 batteries, 38 thermostats • Participation rate: 87% • Median response latency: 2.1 seconds • Aggregator compliance: 100% • Fallback Tier 1 success across last 7 events: 91% Share with planning?",
  },
  { sender: "user", text: "" },
  {
    sender: "agent",
    text: "• Summary sent to Planning • DER availability map updated • Prediction model retrained All logs archived for audit and compliance",
  },
];

// Helper function to convert feeder status summary plain text to Markdown
function feederSummaryToMarkdown(plainText: string) {
  let text = plainText.trim();
  if (text.startsWith("Feeder status summary")) {
    text = text.replace(/^Feeder status summary[:\s]*/i, "");
  }
  // Split by feeder headers (e.g., "M12:", "Inner Richmond:", "S7:")
  const feederBlocks =
    text.match(/([A-Za-z0-9 ]+: [^]+?)(?=(?:[A-Za-z0-9 ]+:)|$)/g) || [];
  let markdown = "## Feeder status summary\n\n";
  feederBlocks.forEach((block) => {
    // Extract feeder name and details
    const [name, ...rest] = block.split(":");
    const details = rest.join(":").trim();
    // Split details into lines by key phrases
    const formattedDetails = details
      .replace(/(Region:|Capacity:|Current Load:)/g, "\n$1")
      .replace(/\n+/g, "\n")
      .trim();
    markdown += `**${name.trim()}:**\n${formattedDetails}\n\n`;
  });
  return markdown.trim();
}

// Helper function to convert mitigation options plain text to Markdown
function mitigationOptionsToMarkdown(plainText: string) {
  // Remove duplicate heading if already present
  let text = plainText.trim();
  if (text.startsWith("Mitigation Options – Feeder M12")) {
    text = text.replace(/^Mitigation Options – Feeder M12\s*/i, "");
  }
  // Split by each option
  const sections = text.split(
    /(?=Combine DER curtailment|Full curtailment|Target newly onboarded DER homes)/g
  );
  // Add bold to section headers and line breaks for details
  const formattedSections = sections.map((section: string) => {
    // Find the first sentence (header)
    const match = section
      .replace(/\n/g, " ")
      .match(/^(.*?)(Estimated Relief:.*)/);
    if (match) {
      const header = `**${match[1].trim()}**`;
      // Add double space at end of each line for Markdown line break
      const details = match[2]
        .replace(/(Estimated Relief:|Risk Level:|Filters:)/g, "\n$1")
        .replace(/\n+/g, "\n");
      return `${header}\n${details.trim()}`;
    }
    return section;
  });
  // Add the main heading only once
  return `## Mitigation Options – Feeder M12\n\n${formattedSections.join(
    "\n\n"
  )}`;
}

// Universal formatter for all agent messages
function formatAgentMessageToMarkdown(text: string) {
  let t = text.trim();
  // Convert '•' to Markdown bullets
  if (t.includes("•")) {
    const items = t
      .split("•")
      .map((item) => item.trim())
      .filter(Boolean);
    return items.map((item) => `- ${item}`).join("\n");
  }
  // Add line breaks after periods, semicolons, and colons (for clarity)
  t = t.replace(/([a-zA-Z0-9])([\.:;])\s+/g, "$1$2\n");
  // Bold section headers (lines ending with ':')
  t = t.replace(/^(.*:)/gm, "**$1**");
  return t;
}

function autoFormatSummaryToMarkdown(plainText: string) {
  let text = plainText.trim();
  if (text.includes("•")) {
    const items = text
      .split("•")
      .map((item) => item.trim())
      .filter(Boolean);
    // Make the first bullet bold, rest regular
    return [
      `- **${items[0]}**`,
      ...items.slice(1).map((item) => `- ${item}`),
    ].join("\n");
  }
  // Add line breaks after periods, semicolons, and colons (for clarity)
  text = text.replace(/([a-zA-Z0-9])([\.:;])\s+/g, "$1$2\n");
  return text;
}

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
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + step,
            text: conversationFlow[step].text,
            isUser: false,
            timestamp: new Date(),
            type: "agent",
          },
        ]);
        setStep((prev) => prev + 1);
        if (step === 2) setInputEnabled(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !inputEnabled) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
        type: "user",
      },
    ]);
    setInputText("");
    setInputEnabled(false);

    let nextStep = step + 1;
    while (
      nextStep < conversationFlow.length &&
      conversationFlow[nextStep].sender !== "agent"
    ) {
      nextStep++;
    }
    if (nextStep < conversationFlow.length) {
      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + nextStep,
            text: conversationFlow[nextStep].text,
            isUser: false,
            timestamp: new Date(),
            type: "agent",
          },
        ]);
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
                    message.isUser ? "text-green-400" : "text-blue-300"
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
                  message.isUser
                    ? "inline-block rounded-xl bg-[#232b45] text-white px-4 py-2 max-w-[70%] ml-auto mb-2"
                    : "rounded-2xl bg-[#334155] px-6 py-4 max-w-[90%] mb-4"
                }
              >
                <ReactMarkdown
                  components={{
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl font-bold text-white mb-1"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-white" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-base text-gray-300 mb-1" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-4 list-disc text-gray-300" {...props} />
                    ),
                  }}
                >
                  {message.isUser
                    ? message.text
                    : message.text.startsWith("Mitigation Options")
                    ? mitigationOptionsToMarkdown(message.text)
                    : message.text.startsWith("Feeder status summary")
                    ? feederSummaryToMarkdown(message.text)
                    : autoFormatSummaryToMarkdown(message.text)}
                </ReactMarkdown>
                {"charts" in message &&
                  Array.isArray((message as any).charts) &&
                  (message as any).charts.length > 0 && (
                    <div className="mt-3 flex space-x-3 overflow-x-auto">
                      {(message as any).charts.map(renderChart)}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {isAgentTyping && (
        <div className="w-full flex justify-start mb-4 ml-6">
          <div className="px-4 py-4 bg-[#334155] rounded-md flex items-center">
            <span className="flex gap-1">
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </div>
        </div>
      )}
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

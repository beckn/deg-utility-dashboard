"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
  showAuditTrailMessages?: boolean;
  onDDRComplete?: () => void;
}

const conversationFlow = [
  {
    sender: "agent",
    text: `⚠️ **CRITICAL ALERT**: Feeder TX005 (Emergency P2) Approaching Overload (+160 kWh) in
next 25 minutes.`,
  },
  {
    sender: "agent",
    text: `Based on real-time aggregated capacities and historical response analytics, here are the available Grid Flexibility Programs: 

**📗 Program 1: Dynamic Demand Response**  
- Aggregated Capacity Available: 350 kW  
- Asset Types: Residential (45%), Commercial and industrial (55%)  
- Historical Response Rate: 89% compliance (last 6 months)  
- Average Response Latency: 3.2 minutes  
- Historical Reward: $4.00 per kWh shifted  
- Bonus: 15% extra if monthly compliance >90%  
- Penalty: 15% reduction if compliance <75%  
- Category: Residential

**📕 Program 2: Emergency Demand Reduction (EDR)**  
- Aggregated Capacity Available: 220 kW  
- Asset Types: Residential Battery Storage (60%), EV Fleet Hubs (40%)  
- Historical Response Rate: 98% compliance (last 12 months, rare events)  
- Average Response Latency: 20 seconds  
- Availability Reward: $250/year per kW available  
- Event Reward: $10.00 per kWh curtailed  
- Penalty: 50% annual fee reduction per missed event  
- Category: Residential  
- Minimum Meter Capacity: 5 kW`
  },
  {
    sender: "agent",
    text: `🔍 Recommendation: To achieve immediate grid relief with minimal disruption and high
historical reliability, I recommend activating Program 1 – Dynamic Demand Response.\n
\nWould you like to proceed?`,
  },
  {
    sender: "user",
    text: `Yes, proceed.`,
  },
  {
    sender: "agent",
    text: `Activating Program 1 – **Dynamic Demand Response (DDR).**

Broadcasting flexibility requests to eligible meters. Please wait..`,
  },
  {
    sender: "agent",
    text: `**📊 Live Response Tracking**  
    **Response Status (Number of Meters):**
    
    - ✅ Accepted: 38  
    - ⏳ Pending: 5  
    - ❌ Declined: 4  
      - AQI Limits: 2  
      - Unresponsive: 1  
      - Consent Expired: 1`
  },
  {
    sender: "agent",
    text: `✅ Final Response Summary  

    - **Accepted**: 38 meters  
    - **Declined**: 4 meters  
    - **Pending (No Response)**: 5 meters (treated as declined)  
    **Effective Capacity Activated**: 310 kW (**89%** of DDR capacity)`
  },
  {
    sender: "agent",
    text: `✅ Emergency P2 Feeder Hub [TX005] load normalized. Grid returning to optimal conditions in
approximately 10 minutes'`,
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

const UtilityAgent = forwardRef<unknown, UtilityAgentProps>(({
  onClose,
  initialMessage,
  showAuditTrailMessages = false,
  onDDRComplete,
}, ref) => {
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
      // Delay showing typing animation until 55 seconds
      const typingTimer = setTimeout(
        () => {
          setIsAgentTyping(true);
        },
        step === 0 ? 55000 : 0
      );

      const messageTimer = setTimeout(
        () => {
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
        },
        step === 0 ? 50000 : 10000
      ); // 58 seconds for first message, 10 seconds for second

      return () => {
        clearTimeout(typingTimer);
        clearTimeout(messageTimer);
      };
    }
  }, [step]);

  useEffect(() => {
    // Only trigger if the last message is the 'Proceeding...' message and the DDR participation message is not yet shown
    const proceedingText =
      "✅ **Proceeding to Activate Demand Flexibility Option 1 – Dynamic Demand Response (DDR)**. Please wait…";
    const ddrParticipationText = conversationFlow[5].text;
    const loadNormalText = conversationFlow[6].text;

    const lastMsgIsProceeding =
      messages.length > 0 &&
      messages[messages.length - 1].text === proceedingText;
    const hasDDRParticipation = messages.some(
      (m) => m.text === ddrParticipationText
    );
    const hasLoadNormal = messages.some((m) => m.text === loadNormalText);

    if (
      showAuditTrailMessages &&
      lastMsgIsProceeding &&
      !hasDDRParticipation &&
      !hasLoadNormal
    ) {
      setIsAgentTyping(true);
      const timer1 = setTimeout(() => {
        setIsAgentTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "6",
            text: ddrParticipationText,
            isUser: false,
            timestamp: new Date(),
            type: "agent",
          },
        ]);
        setStep(6);
        // Call onDDRComplete when DDR participation message is shown
        if (typeof onDDRComplete === "function") {
          onDDRComplete();
        }
        setTimeout(() => {
          setIsAgentTyping(true);
          setTimeout(() => {
            setIsAgentTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + "7",
                text: loadNormalText,
                isUser: false,
                timestamp: new Date(),
                type: "agent",
              },
            ]);
            setStep(7);
          }, 1200); // Typing animation for second message
        }, 2000); // Wait 2 seconds before showing the second message
      }, 1200); // Typing animation for first message
      return () => {
        setIsAgentTyping(false);
      };
    }
  }, [showAuditTrailMessages, messages, onDDRComplete]);

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

  const handleAuditTrailFlow = () => {
    // Show Live Response Tracking immediately
    setIsAgentTyping(true);
    setTimeout(() => {
      setIsAgentTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "audit1",
          text: `**📊 Live Response Tracking**\nResponse Status (Number of Meters):\n\n✅ Accepted: 38\n⏳ Pending: 5\n❌ Declined: 4\nAQI Limits (2)\nUnresponsive (1)\nConsent Expired (1)`,
          isUser: false,
          timestamp: new Date(),
          type: "agent",
        },
      ]);
      // Wait 30 seconds before showing the next message
      setTimeout(() => {
        setIsAgentTyping(true);
        setTimeout(() => {
          setIsAgentTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "audit2",
              text: `✅ Final Response Summary\n\n- **Accepted**: 38 meters  \n- **Declined**: 4 meters  \n- **Pending (No Response)**: 5 meters (treated as declined)  \n- **Effective Capacity Activated**: 310 kW (**89%** of DDR capacity)`,
              isUser: false,
              timestamp: new Date(),
              type: "agent",
            },
          ]);
          // After a short delay, show the last message
          setIsAgentTyping(true);
          setTimeout(() => {
            setIsAgentTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + "audit3",
                text: `✅ Emergency P2 Feeder Hub [TX005] load normalized. Grid returning to optimal conditions in approximately 10 minutes'`,
                isUser: false,
                timestamp: new Date(),
                type: "agent",
              },
            ]);
          }, 1200); // 1.2s delay for last message
        }, 1200); // 1.2s typing for summary
      }, 30000); // 30s delay after audit trail message
    }, 1200); // 1.2s typing for audit trail
  };

  useImperativeHandle(ref, () => ({
    handleAuditTrailFlow,
  }));

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
                    ? "inline-block rounded-xl bg-[#2463EB] text-white px-4 py-2 max-w-[70%] ml-auto mb-2"
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
});

export default UtilityAgent;


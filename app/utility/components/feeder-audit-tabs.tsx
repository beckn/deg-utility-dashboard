import React, { useState, useEffect } from "react";
import { StatusBadge } from "./status-badge";

const AUDIT_DATA = [
  {
    id: 1,
    name: "Jason's Household",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: 10,
    accepted: true
  },
  {
    id: 6,
    name: "Anderson Villa",
    meterId: "987654321",
    orderId: "XYZ789",
    consumption: 120,
    percent: 15,
    accepted: true
  },
  {
    id: 7,
    name: "Monica's Duplex",
    meterId: "555555555",
    orderId: "LMN456",
    consumption: 90,
    percent: 12,
    accepted: true
  },
  {
    id: 8,
    name: "Ravi's Flat",
    meterId: "444444444",
    orderId: "QRS234",
    consumption: 80,
    percent: 11,
    accepted: true
  },
  {
    id: 4,
    name: "Jackson's Apartment",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: -10,
    accepted: false
  }
];


function getStatus(load: number) {
  if (load >= 90) return "Critical";
  if (load < 80) return load < 70 ? "Normal" : "Warning";
  return "Warning";
}

interface FeederAuditTabsProps {
  feeders: Array<{
    id: string;
    name: string;
    region?: string;
    margin?: number;
    load: number;
    capacity?: number;
    status?: string;
  }>;
  onAuditTrailClick?: () => void;
}

export function FeederAuditTabs({
  feeders,
  onAuditTrailClick,
}: FeederAuditTabsProps) {
  const [tab, setTab] = useState("feeder");
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (tab === "audit") {
      setVisibleCount(1);
      timer = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev < AUDIT_DATA.length) {
            return prev + 1;
          } else {
            if (timer) clearInterval(timer);
            return prev;
          }
        });
      }, 3000);
    } else {
      setVisibleCount(1);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [tab]);

  return (
    <div className="w-full max-w-md mx-auto bg-[#181A20] rounded-2xl p-0 shadow-lg">
      {/* Tabs */}
      <div className="flex  overflow-hidden bg-[#232B3E]">
        <button
          className={`flex-1 py-2 text-base font-semibold transition-colors duration-150 ${
            tab === "feeder"
              ? "bg-[#2563eb] text-white"
              : "bg-[#232B3E] text-white/70"
          }`}
          // style={{ borderTopLeftRadius: 16 }}
          onClick={() => setTab("feeder")}
        >
          Feeder Summary
        </button>
        <button
          className={`flex-1 py-2 text-base font-semibold transition-colors duration-150 ${
            tab === "audit"
              ? "bg-[#2563eb] text-white"
              : "bg-[#232B3E] text-white/70"
          }`}
          // style={{ borderTopRightRadius: 16 }}
          onClick={() => {
            setTab("audit");
            if (onAuditTrailClick) onAuditTrailClick();
          }}
        >
          Audit Trail
        </button>
      </div>
      {/* Card List */}
      <div className="bg-[#232B3E] rounded-b-2xl p-4">
        {tab === "feeder" ? (
          <div>
            {feeders.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-lg">
                      {item.name}
                    </span>
                    <StatusBadge status={getStatus(item.load)} size="sm" pill />
                  </div>
                  <div className="flex justify-between text-xs text-[#B0B6C3] mb-2">
                    <span>Region: {item.region}</span>
                    <span>Margin: {item.margin}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 rounded-full bg-[#3A4256] overflow-hidden">
                      <div
                        className={
                          getStatus(item.load) === "Critical"
                            ? "bg-[#983535]"
                            : getStatus(item.load) === "Warning"
                            ? "bg-[#D8A603]"
                            : "bg-[#4F9835]"
                        }
                        style={{
                          width: `${Math.min(item.load, 100)}%`,
                          height: "100%",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#B0B6C3]">
                    <span>{item.load}%</span>
                    <span>{item.capacity} 100 kW</span>
                  </div>
                </div>
                {idx !== feeders.length - 1 && (
                  <div className="border-b border-[#313A4E] mx-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {AUDIT_DATA.slice(0, visibleCount).map((item, index) => (
              <div
                key={item.id}
                className="bg-[#23243A] rounded-lg p-4 shadow border border-[#23243A] animate-fade-in"
                style={{
                  opacity: 0,
                  animation: 'fadeInUp 0.5s ease forwards',
                  animationDelay: '0ms',
                }}
              >
                <div className="font-semibold text-white text-base underline mb-1">
                  {item.name}
                </div>
                <div className="flex flex-wrap text-xs text-white/70 gap-x-4 gap-y-1 mb-1">
                  <span>Meter ID : {item.meterId}</span>
                  <span>Order ID : {item.orderId}</span>
                </div>
                <div className="flex flex-wrap text-xs text-white/70 gap-x-4 gap-y-1 mb-1">
                  <span>
                    Current Consumption (kWh):{" "}
                    <span className="text-white font-medium">
                      {item.consumption}
                    </span>
                  </span>
                  <span
                    className={
                      item.percent > 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {Math.abs(item.percent)}% {item.percent > 0 ? "↓" : "↑"}
                  </span>
                </div>
                <div className="flex flex-wrap text-xs text-white/70 gap-x-4 gap-y-1">
                  <span>
                    DFP Accepted:{" "}
                    <span
                      className={
                        item.accepted ? "text-green-400" : "text-red-400"
                      }
                    >
                      {item.accepted ? "True" : "False"}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

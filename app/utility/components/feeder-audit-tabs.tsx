import React, { useState } from "react";
import { StatusBadge } from "./status-badge";

const AUDIT_DATA = [
  {
    id: 1,
    name: "Jason's Household",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: 10,
    accepted: true,
  },
  {
    id: 2,
    name: "Jackson's Apartment",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: -10,
    accepted: false,
  },
  {
    id: 3,
    name: "Jason's Household",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: 10,
    accepted: true,
  },
  {
    id: 4,
    name: "Jackson's Apartment",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: -10,
    accepted: false,
  },
  {
    id: 5,
    name: "Jason's Household",
    meterId: "123456789",
    orderId: "ABC123",
    consumption: 100,
    percent: 10,
    accepted: true,
  },
];

function getStatus(load: number) {
  if (load > 100) return "Critical";
  if (load < 70) return load < 50 ? "Normal" : "Warning";
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
}

export function FeederAuditTabs({ feeders }: FeederAuditTabsProps) {
  const [tab, setTab] = useState("feeder");
  return (
    <div className="w-full max-w-md mx-auto bg-[#181A20] rounded-2xl p-0 shadow-lg">
      {/* Tabs */}
      <div className="flex rounded-t-2xl overflow-hidden bg-[#232B3E]">
        <button
          className={`flex-1 py-2 text-base font-semibold transition-colors duration-150 ${
            tab === "feeder"
              ? "bg-[#2563eb] text-white"
              : "bg-[#232B3E] text-white/70"
          }`}
          style={{ borderTopLeftRadius: 16 }}
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
          style={{ borderTopRightRadius: 16 }}
          onClick={() => setTab("audit")}
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
                    <span>{item.capacity} kW</span>
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
            {AUDIT_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-[#23243A] rounded-lg p-4 shadow border border-[#23243A]"
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
    </div>
  );
}

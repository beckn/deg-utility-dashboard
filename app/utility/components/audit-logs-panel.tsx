import React from "react";

const logs = [
  {
    title: "Grid Update",
    time: "Today, 10:15 AM",
    desc: "Added feeder control to Central Hub",
  },
  {
    title: "Config Change",
    time: "Today, 09:32 AM",
    desc: "Updated fallback thresholds for North Grid",
  },
  {
    title: "Mitigation Action",
    time: "Yesterday, 03:45 PM",
    desc: "Initiated load shedding for South Grid",
  },
  {
    title: "System Alert",
    time: "Yesterday, 02:18 PM",
    desc: "Critical load warning threshold reached",
  },
];

export function AuditLogsPanel() {
  return (
    <div className="max-w-md mx-auto bg-[#1E293B]  p-8  text-white">
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>
      <div className="space-y-4">
        {logs.map((log, idx) => (
          <div key={idx} className="bg-[#313A4E] rounded-lg p-4 shadow border border-[#313A4E]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{log.title}</span>
              <span className="text-sm text-blue-200">{log.time}</span>
            </div>
            <div className="text-blue-100 text-sm">{log.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 
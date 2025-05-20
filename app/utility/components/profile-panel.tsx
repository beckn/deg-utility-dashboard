import React from "react";

export function ProfilePanel() {
  return (
    <div className="max-w-md mx-auto bg-[#232B3E] rounded-2xl p-8 shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">JS</div>
        <div>
          <div className="text-lg font-semibold">John Smith</div>
          <div className="text-sm text-blue-300">Grid Operator</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-xs text-blue-200 mb-1">Email ID</div>
        <div className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base">john.smith@utility.com</div>
      </div>
      <div className="mb-4">
        <div className="text-xs text-blue-200 mb-1">Role</div>
        <div className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base">Senior Grid Operator</div>
      </div>
      <div>
        <div className="text-xs text-blue-200 mb-1">Last Login</div>
        <div className="bg-[#232B3E] border border-blue-400 rounded-lg px-4 py-2 text-base">Today, 9:45 AM</div>
      </div>
    </div>
  );
} 
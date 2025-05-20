import React from "react";

export function ControlsPanel() {
  return (
    <div className="max-w-md mx-auto bg-[#1E293B] p-8 text-white">
      <h2 className="text-2xl font-bold mb-6">Controls</h2>
      {/* Manual Override */}
      <div className="mb-6 bg-[#334155] rounded-b-sm p-4 border border-[#313A4E] w-[330px]">
        <div className="font-semibold text-lg mb-2">Manual Override</div>
        <select className="w-full mb-3 px-3 py-2 rounded bg-[#232B3E] border border-[#313A4E] text-white focus:outline-none">
          <option>Select Feeder</option>
          <option>Feeder 1</option>
          <option>Feeder 2</option>
        </select>
        <div className="flex bg-[#334155] rounded-b-sm " style={{columnGap: '25px'}}>
          <button className="w-20 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-sm font-semibold text-sm">Load Shed</button>
          <button className="w-20 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-sm font-semibold text-sm">Reset</button>
          <button className="bg-red-600 hover:bg-red-700 text-white rounded-sm font-semibold text-sm" style={{paddingLeft: '5px', paddingRight: '5px'}}>Emergency</button>
        </div>
      </div>        
      {/* DER Control */}
      <div className="mb-6 bg-[#334155] rounded-b-sm p-4 border border-[#313A4E] w-[330px]">
        <div className="font-semibold text-lg mb-2">DER Control</div>
        <div className="flex items-center justify-between mb-1">
          <span>Battery Discharge Rate</span>
          <span>65%</span>
        </div>
        <div className="w-full h-2 bg-[#313A4E] rounded">
          <div className="h-2 bg-blue-500 rounded" style={{ width: '65%' }} />
        </div>
      </div>
      {/* Emergency Contacts */}
      <div className="bg-[#334155] rounded-b-sm p-4 border border-[#313A4E] w-[330px]">
        <div className="font-semibold text-lg mb-2">Emergency Contacts</div>
        <div className="flex justify-between text-base mb-1">
          <span>Control Centre</span>
          <span>555-123-4567</span>
        </div>
        <div className="flex justify-between text-base mb-1">
          <span>Field Operations</span>
          <span>555-789-0123</span>
        </div>
        <div className="flex justify-between text-base">
          <span>Emergency Services</span>
          <span>911</span>
        </div>
      </div>
    </div>
  );
} 
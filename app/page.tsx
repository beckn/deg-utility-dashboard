// app/page.tsx
"use client";

import Link from "next/link";

import { redirect } from 'next/navigation';

 

export default function Home() {
  redirect('/aggregator');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-white flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          DEG Energy Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/utility">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all">
              <h2 className="text-xl font-semibold mb-2">Utility Dashboard</h2>
              <p className="text-blue-100">
                Monitor grid operations and DER management
              </p>
            </div>
          </Link>
          <Link href="/aggregator">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg cursor-pointer hover:from-green-600 hover:to-green-700 transition-all">
              <h2 className="text-xl font-semibold mb-2">
                Aggregator Dashboard
              </h2>
              <p className="text-green-100">
                Manage DER aggregation and control
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Menu } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between p-4 h-16 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        <Menu className="w-6 h-6 text-gray-600" />
        <h1 className="text-xl font-semibold text-gray-800">Utility Admin Dashboard</h1>
      </div>
      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center ring-2 ring-white shadow">
        <span className="text-white font-bold text-lg">A</span>
      </div>
    </header>
  )
}

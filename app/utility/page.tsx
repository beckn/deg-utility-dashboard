import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import UtilityDashboard from "./components/utility-dashboard"

function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-200">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="ml-4 text-xl text-gray-700">Loading Utility Data...</p>
        </div>
      }
    >
      <UtilityDashboard />
    </Suspense>
  )
}

export default Page;
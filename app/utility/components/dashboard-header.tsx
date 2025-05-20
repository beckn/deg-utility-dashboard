import { Menu } from "lucide-react"
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shadow-sm">
      <div className="flex items-center gap-4">
        <button className="text-2xl font-bold tracking-tight text-primary">Utility Administration Portal</button>
      </div>
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        {/* <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">🌞</span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
          <span className="text-xs text-muted-foreground">🌙</span>
        </div> */}
        {/* Avatar or user icon can go here */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span role="img" aria-label="avatar">👤</span>
        </div>
      </div>
    </header>
  )
}

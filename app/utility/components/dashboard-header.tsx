import { Menu, X, User, FileText, Sliders, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { ProfilePanel } from "./profile-panel";
import { AuditLogsPanel } from "./audit-logs-panel";
import { ControlsPanel } from "./controls-panel";

interface DashboardHeaderProps {
  onSelectPanel: (panel: "profile" | "audit" | "controls") => void;
  activePanel: "profile" | "audit" | "controls";
}

export function DashboardHeader({
  onSelectPanel,
  activePanel,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<
    null | "profile" | "audit" | "controls"
  >(null);

  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40  bg-opacity-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Modal Overlay */}
      {openModal && (
        <div
          className="fixed inset-0 z-50  bg-opacity-40 transition-opacity"
          onClick={() => setOpenModal(null)}
        />
      )}
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ transitionProperty: "transform" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <span className="text-lg font-semibold text-primary">Menu</span>
          <button
            onClick={() => {
              setOpenModal(null);
              setSidebarOpen(false);
            }}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-primary" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 mt-4 px-4">
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-primary font-medium w-full justify-between ${
              activePanel === "profile" ? "" : ""
            }`}
            onClick={() => {
              setOpenModal("profile");
              // setSidebarOpen(false);
            }}
          >
            <span className="flex items-center gap-3">
              <User className="w-5 h-5" /> Profile
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-primary font-medium w-full justify-between ${
              activePanel === "audit" ? "bg-muted" : ""
            }`}
            onClick={() => {
              setOpenModal("audit");
              // setSidebarOpen(false);
            }}
          >
            <span className="flex items-center gap-3">
              <FileText className="w-5 h-5" /> Audit Logs
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-primary font-medium w-full justify-between ${
              activePanel === "controls" ? "bg-muted" : ""
            }`}
            onClick={() => {
              setOpenModal("controls");
              // setSidebarOpen(false);
            }}
          >
            <span className="flex items-center gap-3">
              <Sliders className="w-5 h-5" /> Controls
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </aside>
      {/* Side Modal */}
      {openModal && (
        <aside
          className="fixed top-0 left-64 z-50 h-full min-w-[400px] max-w-full bg-card border-r border-border shadow-lg transform transition-transform duration-200"
          style={{ transitionProperty: "transform" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* <div className="flex items-center justify-between px-6 h-16 border-b border-border">
            <span className="text-lg font-semibold text-primary capitalize">
              {openModal}
            </span>
            <button onClick={() => setOpenModal(null)} aria-label="Close modal">
              <X className="w-6 h-6 text-primary" />
            </button>
          </div> */}
          <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">
            {openModal === "profile" && <ProfilePanel />}
            {openModal === "audit" && <AuditLogsPanel />}
            {openModal === "controls" && <ControlsPanel />}
          </div>
        </aside>
      )}
      <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shadow-sm relative z-30">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <button
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
          <span className="text-xl font-semibold tracking-tight text-primary">
            Utility Administration Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">🌞</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              aria-label="Toggle dark mode"
            />
            <span className="text-xs text-muted-foreground">🌙</span>
          </div>
          {/* Avatar or user icon can go here */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span role="img" aria-label="avatar">
              👤
            </span>
          </div>
        </div>
      </header>
    </>
  );
}

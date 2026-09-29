import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, Siren, Library, GraduationCap, BookOpen, Plane, Wind, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Operações",
    items: [
      { label: "Painel", path: "/", icon: LayoutDashboard },
      { label: "Diário de Bordo", path: "/flight-log", icon: BookOpen },
      { label: "Aeronaves", path: "/aircraft", icon: Plane },
    ],
  },
  {
    label: "Procedimentos",
    items: [
      { label: "Checklists", path: "/checklist", icon: ClipboardCheck },
      { label: "QRH", path: "/qrh", icon: Siren },
      { label: "Biblioteca", path: "/biblioteca", icon: Library },
    ],
  },
  {
    label: "Treinamento",
    items: [
      { label: "Treinamentos", path: "/treinamentos", icon: GraduationCap },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

function isActive(location, path) {
  return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
}

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-100 fixed inset-y-0 left-0 z-20">
        <SidebarContent location={location} />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 text-white px-4 h-14 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-sm">RSANDOLI PILOT</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-300 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-100 flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
              <span className="font-semibold text-sm">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent location={location} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 pt-20 md:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ location, onNavigate }) {
  return (
    <>
      <div className="px-6 py-7 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Wind className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold tracking-tight leading-tight text-sm">RSANDOLI PILOT</p>
          <p className="text-[10px] uppercase tracking-widest text-sky-300/80">Helicopter Aviation</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(location, item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-sky-500/15 text-sky-300 shadow-inner"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10 text-[11px] text-slate-500">
        <p className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5" />
          Sistema de operações aéreas
        </p>
      </div>
    </>
  );
}
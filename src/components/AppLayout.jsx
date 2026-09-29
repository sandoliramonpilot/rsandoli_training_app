import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, Plane, ClipboardCheck, PlaneTakeoff, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Painel", path: "/", icon: LayoutDashboard },
  { label: "Diário de Bordo", path: "/flight-log", icon: BookOpen },
  { label: "Aeronaves", path: "/aircraft", icon: Plane },
  { label: "Checklist", path: "/checklist", icon: ClipboardCheck },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-100 fixed inset-y-0 left-0 z-20">
        <div className="px-6 py-7 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold tracking-tight leading-tight">RotorOps</p>
            <p className="text-[11px] uppercase tracking-widest text-sky-300/80">Helicopter Aviation</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
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
        </nav>

        <div className="px-6 py-5 border-t border-white/10 text-[11px] text-slate-500">
          <p className="flex items-center gap-2">
            <PlaneTakeoff className="w-3.5 h-3.5" />
            Sistema de operações aéreas
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 text-white px-4 h-14 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold tracking-tight">RotorOps</span>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 grid grid-cols-4 h-16 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                active ? "text-sky-600" : "text-slate-500"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-w-0 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 pt-20 md:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
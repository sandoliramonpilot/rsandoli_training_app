import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, Siren, GraduationCap, BookOpen, Library, Users, Search, X, Menu, Plane, HelpCircle, BarChart3, UserCog, UserCircle, LogOut, Crown, Monitor, Settings, ChevronDown, ChevronRight, Fuel, Droplets, Zap, Radio, Joystick, Gauge, FileText, Image, Video, ShieldAlert, RotateCcw,   FileBarChart, CalendarDays, TrendingUp, Megaphone } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { can, canManageUsers, getAccessLevel } from "@/lib/accessControl";

const navSections = [
  {
    label: "Principal",
    items: [
      { label: "Painel", path: "/", icon: LayoutDashboard, moduleId: "dashboard" },
      { label: "Diário de Bordo", path: "/flight-log", icon: BookOpen, moduleId: "diario_bordo" },
      { label: "Aeronaves", path: "/aircraft", icon: Plane, moduleId: "aeronaves" },
    ],
  },
  {
    label: "Operações",
    items: [
      { label: "Checklists", path: "/checklist", icon: ClipboardCheck, moduleId: "checklists" },
      { label: "QRH", path: "/qrh", icon: Siren, moduleId: "qrh" },
      { label: "QRH-EFIS", path: "/qrh-efis", icon: Monitor, moduleId: "qrh_efis" },
      { label: "Pilotos", path: "/pilotos", icon: Users, moduleId: "pilotos" },
      { label: "Escalas", path: "/escalas", icon: CalendarDays, moduleId: "escalas" },
    ],
  },
  {
    label: "Academy",
    items: [
      { label: "AW119 TRAINING", path: "/aw119-training", icon: Crown, moduleId: "aw119_training", badge: "Premium" },
      { label: "Dashboard de Progresso", path: "/painel-progresso", icon: TrendingUp, moduleId: "treinamentos" },
      { label: "Treinamentos Gerais", path: "/treinamentos-gerais", icon: GraduationCap, moduleId: "treinamentos_gerais" },
      { label: "Limitações", path: "/limitacoes", icon: Gauge, moduleId: "limitacoes" },
      { label: "Procedimentos Normais", path: "/procedimentos-normais", icon: FileText, moduleId: "procedimentos_normais" },
      { label: "Procedimentos de Emergência", path: "/procedimentos-emergencia", icon: Siren, moduleId: "procedimentos_emergencia" },
      { label: "Questões", path: "/questoes", icon: HelpCircle, moduleId: "questoes" },
      { label: "Simulados", path: "/simulados", icon: BarChart3, moduleId: "simulados" },
      { label: "Treinamento Recorrente", path: "/treinamento-recorrente", icon: RotateCcw, moduleId: "treinamento_recorrente" },
      { label: "Recursos Visuais", path: "/recursos-visuais", icon: Image, moduleId: "recursos_visuais" },
      { label: "Briefing de Emergência", path: "/briefing-emergencia", icon: ShieldAlert, moduleId: "briefing_emergencia" },
    ],
  },
  {
    label: "Conhecimento",
    items: [
      { label: "Biblioteca", path: "/biblioteca", icon: Library, moduleId: "biblioteca" },
    ],
  },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#12141A] text-[#F2EFE6] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#12141A] text-slate-200 fixed inset-y-0 left-0 z-20 border-r border-slate-800">
        <SidebarContent location={location} onNavigate={() => {}} />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-[#12141A] text-slate-100 px-4 h-14 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold tracking-tight text-sm">RSANDOLI PILOTS</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-300 hover:text-slate-100">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-[#12141A] text-slate-200 flex flex-col border-r border-slate-800">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
              <span className="font-semibold text-sm">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-100">
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

function Logo() {
  return (
    <img
      src="https://media.base44.com/images/public/6abbcee2e405be8f7f7ba4ef/8d21e7f79_Logo_APP.png"
      alt="RSANDOLI PILOTS"
      className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-amber-500/20"
    />
  );
}

function isActive(location, path) {
  return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
}

function SidebarContent({ location, onNavigate }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const visibleSections = React.useMemo(() => {
    return navSections
      .map((s) => ({ ...s, items: s.items.filter((i) => can(user, i.moduleId, "visualizar")) }))
      .filter((s) => s.items.length > 0);
  }, [user]);
  const showUsersMenu = canManageUsers(user);
  const showGestao = can(user, "gestao", "visualizar");
  const showMarcos = canManageUsers(user);

  return (
    <>
      <div className="px-6 py-7 flex items-center gap-3 border-b border-slate-800">
        <Logo />
        <div>
          <p className="font-semibold tracking-tight leading-tight text-sm">RSANDOLI PILOTS</p>
          <p className="text-[10px] uppercase tracking-widest text-amber-400/80">Helicopter Training</p>
        </div>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        className="mx-3 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#1A1D25] border border-slate-800 text-sm text-slate-500 hover:border-amber-500/40 hover:text-slate-300 transition-colors"
      >
        <Search className="w-4 h-4" /> Busca universal…
      </button>

      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {visibleSections.map((section) => (
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
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    )}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {(showGestao || showUsersMenu || showMarcos) && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Administração</p>
            <div className="space-y-1">
              {showGestao && (
                <Link
                  to="/gestao"
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(location, "/gestao")
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  <FileBarChart style={{ width: 18, height: 18 }} />
                  Gestão
                </Link>
              )}
              {showUsersMenu && (
                <Link
                  to="/usuarios"
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(location, "/usuarios")
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  <UserCog style={{ width: 18, height: 18 }} />
                  Usuários e Acessos
                </Link>
              )}
              {showMarcos && (
                <Link
                  to="/marcos-projeto"
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(location, "/marcos-projeto")
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  <Megaphone style={{ width: 18, height: 18 }} />
                  Marcos do Projeto
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-slate-800 space-y-1">
        <Link
          to="/perfil"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            isActive(location, "/perfil") ? "text-amber-300 bg-amber-500/10" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
          )}
        >
          <UserCircle style={{ width: 18, height: 18 }} />
          Meu perfil
        </Link>
        <button
          onClick={() => logout(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
        >
          <LogOut style={{ width: 18, height: 18 }} />
          Sair
        </button>
        {user && (
          <p className="px-3 pt-1 text-[11px] text-slate-600 truncate">
            {user.full_name || user.email}
          </p>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-800 text-[11px] text-slate-600">
        <p className="flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5" />
          RSANDOLI PILOTS Helicopter Training
        </p>
      </div>

      <GlobalSearch onClose={() => setSearchOpen(false)} open={searchOpen} />
    </>
  );
}
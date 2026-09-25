import React from "react";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  MessageSquare,
  KeyRound,
  Shield,
  BookOpen,
  UserCheck,
  Trophy,
  UserCog,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingOrdersCount?: number;
  unreadMessagesCount?: number;
  openTicketsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount = 0,
  unreadMessagesCount,
  openTicketsCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const displayUnread = unreadMessagesCount !== undefined ? unreadMessagesCount : openTicketsCount;

  const menuItems = [
    { id: "overview", label: "Executive KPI", icon: LayoutDashboard },
    {
      id: "orders",
      label: "Payment Queue",
      icon: FileCheck2,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
    },
    { id: "users", label: "User Management", icon: UserCog },
    { id: "students", label: "Students & Access", icon: Users },
    { id: "ebooks", label: "Free eBooks & PDFs", icon: BookOpen },
    {
      id: "support",
      label: "Support Messages",
      icon: MessageSquare,
      badge: displayUnread > 0 ? `${displayUnread}` : undefined,
    },
    { id: "owner", label: "Owner Profile CMS", icon: UserCheck },
    { id: "settings", label: "Gateways & Notice", icon: KeyRound },
    { id: "leaderboard", label: "Leaderboard Matrix", icon: Trophy },
    { id: "audit", label: "Audit Trail", icon: Shield },
  ];

  return (
    <>
      {/* Desktop Sidebar (Collapsible: w-64 expanded, w-20 collapsed) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col justify-between border-r border-slate-800 bg-[#070e1b] transition-[width,padding] duration-300 ease-in-out lg:flex ${
          isCollapsed ? "w-20 px-3 py-5" : "w-64 p-5"
        }`}
      >
        <div>
          {/* Brand & Toggle Control */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2.5">
              <div
                className="flex size-9 items-center justify-center rounded-xl bg-sky-500 font-black text-slate-950 shadow-md cursor-pointer hover:ring-2 hover:ring-sky-400/50 transition-all select-none"
                onClick={onToggleCollapse}
                title="Expand Sidebar (Cycle of Chart Admin Operations)"
              >
                C
              </div>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="flex size-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  title="Expand Sidebar"
                  aria-label="Expand Sidebar"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 font-black text-slate-950 shadow-md shrink-0">
                  C
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-widest text-white uppercase truncate">CYCLE OF CHART</div>
                  <div className="text-[10px] font-bold text-sky-400 truncate">ADMIN OPERATIONS</div>
                </div>
              </div>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer ml-1"
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="mt-8 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (isCollapsed) {
                return (
                  <div key={item.id} className="relative group flex justify-center">
                    <button
                      type="button"
                      onClick={() => onTabChange(item.id)}
                      title={item.label}
                      aria-label={item.label}
                      className={`flex size-11 items-center justify-center rounded-xl transition-all duration-150 cursor-pointer relative ${
                        isActive
                          ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-slate-950" : "text-slate-400 group-hover:text-white"} />
                      {item.badge && (
                        <span
                          className={`absolute -top-1 -right-1 flex min-w-[16px] h-4 items-center justify-center rounded-full px-1 text-[9px] font-black shadow-sm ring-2 ring-[#070e1b] ${
                            isActive ? "bg-slate-950 text-sky-400 ring-sky-500" : "bg-amber-500 text-slate-950"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-1.5 text-xs font-bold text-white shadow-2xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.2 text-[9px] font-black text-slate-950">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700/80" />
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-slate-950" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                        isActive ? "bg-slate-950 text-sky-400" : "bg-amber-500 text-slate-950"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        {isCollapsed ? (
          <div className="border-t border-slate-800/80 pt-4 flex flex-col items-center">
            <span
              className="inline-block rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[9px] font-black text-slate-400 select-none cursor-default"
              title="Trading Reality v2.0 · Dual-Mode Security Enabled"
            >
              v2.0
            </span>
          </div>
        ) : (
          <div className="border-t border-slate-800/80 pt-4 text-[11px] text-slate-400">
            <div className="font-bold text-slate-300">Trading Reality v2.0</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dual-Mode Security Enabled</div>
          </div>
        )}
      </aside>

      {/* Mobile Drawer (visible on < lg when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          />
          <aside className="absolute inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-800 bg-[#070e1b] p-5 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Brand & Mobile Close */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 font-black text-slate-950 shadow-md">
                    C
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-widest text-white uppercase">CYCLE OF CHART</div>
                    <div className="text-[10px] font-bold text-sky-400">ADMIN OPERATIONS</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="flex size-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="mt-8 space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onTabChange(item.id);
                        onCloseMobile?.();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? "text-slate-950" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                            isActive ? "bg-slate-950 text-sky-400" : "bg-amber-500 text-slate-950"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800/80 pt-4 text-[11px] text-slate-400">
              <div className="font-bold text-slate-300">Trading Reality v2.0</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Dual-Mode Security Enabled</div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

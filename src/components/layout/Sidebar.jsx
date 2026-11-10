import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  CalendarCheck,
  Users,
  UserCheck,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  Receipt,
  Tag,
  Star,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar({ isCollapsed, onToggleCollapse, emergencyCount = 0, unreadCount = 0 }) {
  const location = useLocation();

  const navGroups = [
    {
      group: "Operations",
      items: [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/bookings", label: "Bookings & Requests", icon: CalendarCheck },
        {
          path: "/emergency",
          label: "Emergency Dispatch",
          icon: AlertTriangle,
          badge: emergencyCount > 0 ? emergencyCount : null,
          badgeVariant: "destructive",
        },
        { path: "/scheduling", label: "Service Scheduling", icon: CalendarDays },
      ],
    },
    {
      group: "Catalog & Staff",
      items: [
        { path: "/services", label: "Services & Categories", icon: Wrench },
        { path: "/technicians", label: "Technicians & Staff", icon: UserCheck },
        { path: "/customers", label: "Customers", icon: Users },
      ],
    },
    {
      group: "Business & Revenue",
      items: [
        { path: "/pricing", label: "Pricing & Charges", icon: DollarSign },
        { path: "/payments", label: "Payments & Invoices", icon: Receipt },
        { path: "/promotions", label: "Offers & Promotions", icon: Tag },
        { path: "/reviews", label: "Customer Reviews", icon: Star },
      ],
    },
    {
      group: "Management",
      items: [
        {
          path: "/notifications",
          label: "Notifications",
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
          badgeVariant: "info",
        },
        { path: "/analytics", label: "Reports & Analytics", icon: BarChart3 },
        { path: "/settings", label: "Profile & Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          {/* Logo Mark: Teal/Emerald Circle with Checkmark from website */}
          <div className="h-10 w-10 rounded-xl bg-[#1E7B5A] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" fill="#1E7B5A" />
              <path
                d="M32 50 L45 63 L68 37"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[#16264a] leading-none">
                APEX REPAIR
              </span>
              <span className="text-[10px] font-semibold text-[#386a94] tracking-wider uppercase mt-0.5">
                Admin Console
              </span>
            </div>
          )}
        </NavLink>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 text-slate-400 hover:text-slate-800 hidden lg:flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? "bg-[#223f6b] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        item.badgeVariant === "destructive"
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-sky-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Live Site Link & Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {!isCollapsed && (
          <a
            href="https://appspeech.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-[#223f6b] hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Customer Website
            </span>
            <span className="text-[10px] bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded">
              Live
            </span>
          </a>
        )}

        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-8 w-8 ring-1 ring-slate-200">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#16264a] truncate">
                  Admin Dispatcher
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  admin@apexrepair.com
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}


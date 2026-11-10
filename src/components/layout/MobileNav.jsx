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
  X,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileNav({ isOpen, onClose, emergencyCount = 0, unreadCount = 0 }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/bookings", label: "Bookings & Requests", icon: CalendarCheck },
    {
      path: "/emergency",
      label: "Emergency Dispatch",
      icon: AlertTriangle,
      badge: emergencyCount > 0 ? emergencyCount : null,
    },
    { path: "/scheduling", label: "Service Scheduling", icon: CalendarDays },
    { path: "/services", label: "Services & Categories", icon: Wrench },
    { path: "/technicians", label: "Technicians & Staff", icon: UserCheck },
    { path: "/customers", label: "Customers", icon: Users },
    { path: "/pricing", label: "Pricing & Charges", icon: DollarSign },
    { path: "/payments", label: "Payments & Invoices", icon: Receipt },
    { path: "/promotions", label: "Offers & Promotions", icon: Tag },
    { path: "/reviews", label: "Customer Reviews", icon: Star },
    {
      path: "/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { path: "/analytics", label: "Reports & Analytics", icon: BarChart3 },
    { path: "/settings", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 flex flex-col h-full bg-white z-50"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#1E7B5A] flex items-center justify-center text-white shrink-0 shadow-sm">
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
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[#16264a]">
                APEX REPAIR
              </span>
              <span className="text-[10px] font-semibold text-[#386a94] uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#223f6b] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <a
            href="https://appspeech.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-slate-700 bg-white rounded-lg border border-slate-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Customer Website
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}


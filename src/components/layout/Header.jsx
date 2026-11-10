import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Database,
  ChevronRight,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header({
  onOpenMobileNav,
  onOpenSupabaseModal,
  notifications = [],
  emergencyCount = 0,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Breadcrumb mapping
  const pathMap = {
    "/": "Overview",
    "/bookings": "Service Bookings",
    "/emergency": "Emergency Dispatch",
    "/scheduling": "Service Scheduling",
    "/services": "Services & Categories",
    "/technicians": "Technicians & Staff",
    "/customers": "Customers Directory",
    "/pricing": "Pricing & Rates",
    "/payments": "Payments & Invoices",
    "/promotions": "Offers & Promotions",
    "/reviews": "Customer Reviews",
    "/notifications": "Notifications Center",
    "/analytics": "Reports & Analytics",
    "/settings": "Admin Settings",
  };

  const currentTitle = pathMap[location.pathname] || "Dashboard";

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      {/* Left: Mobile Nav Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileNav}
          className="lg:hidden h-9 w-9 text-slate-600 hover:text-slate-900"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>

        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/"
            className="text-slate-400 hover:text-slate-700 font-medium hidden sm:inline"
          >
            Apex Repair
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 hidden sm:inline" />
          <span className="font-bold text-[#16264a] text-sm sm:text-base">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 relative bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-white">
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-xs font-bold text-[#16264a]">
                Notifications ({unreadCount} unread)
              </span>
              <Link
                to="/notifications"
                className="text-[11px] font-medium text-[#223f6b] hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || "/notifications"}
                    className={`block p-3 text-xs hover:bg-slate-50 transition-colors ${
                      !n.is_read ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {n.message}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-1 pl-2 h-9 rounded-full hover:bg-slate-100"
            >
              <Avatar className="h-7 w-7 ring-1 ring-slate-200">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-slate-700 hidden lg:inline">
                Admin
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white p-1">
            <DropdownMenuLabel className="p-2">
              <p className="text-xs font-bold text-[#16264a]">Admin Console</p>
              <p className="text-[11px] font-normal text-slate-400">
                admin@apexrepair.com
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="gap-2 cursor-pointer text-xs"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              Settings & Preferences
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenSupabaseModal}
              className="gap-2 cursor-pointer text-xs"
            >
              <Database className="h-3.5 w-3.5 text-slate-500" />
              Supabase Configuration
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open("https://appspeech.vercel.app/", "_blank")}
              className="gap-2 cursor-pointer text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              View Customer Website
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate("/settings");
              }}
              className="gap-2 cursor-pointer text-xs text-slate-600"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


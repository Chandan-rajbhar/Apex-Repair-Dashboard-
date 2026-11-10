import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { SupabaseStatusModal } from "@/components/common/SupabaseStatusModal";
import { db } from "@/lib/db";

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("apex_sidebar_collapsed") === "true";
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [emergencyCount, setEmergencyCount] = useState(0);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("apex_sidebar_collapsed", String(next));
      return next;
    });
  };

  const fetchGlobalStats = async () => {
    try {
      const [notifs, bookings] = await Promise.all([
        db.getNotifications(),
        db.getBookings(),
      ]);
      setNotifications(notifs || []);
      const emergencies = (bookings || []).filter(
        (b) => b.is_emergency && b.current_step < 8
      ).length;
      setEmergencyCount(emergencies);
    } catch (e) {
      console.error("Global stats fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    // Poll every 30 seconds for live notifications/dispatch
    const interval = setInterval(fetchGlobalStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f8fc]">
      {/* Desktop Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
        emergencyCount={emergencyCount}
        unreadCount={notifications.filter((n) => !n.is_read).length}
      />

      {/* Mobile Off-Canvas Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        emergencyCount={emergencyCount}
        unreadCount={notifications.filter((n) => !n.is_read).length}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          notifications={notifications}
          emergencyCount={emergencyCount}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ refreshGlobalStats: fetchGlobalStats }} />
          </div>
        </main>
      </div>

      {/* Supabase Connection & Settings Modal */}
      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}


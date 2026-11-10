import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Wrench,
  Truck,
  Plus,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Star,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner, SpinnerCustom } from "@/components/ui/spinner";

export function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await db.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      toast.error("Failed to load dashboard statistics from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsViewDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#16264a] via-[#223f6b] to-[#2f5082] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-emerald-300 border border-white/10 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Dispatch Operations Active
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Apex Appliance Repair Dispatch Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
            Monitor real-time diagnostic calls, dispatch master technicians, manage quotes, and track customer satisfaction across all service territories.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate("/emergency")}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold h-9 px-4 gap-2 shadow-sm"
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency Dispatch
          </Button>
          <Button
            onClick={() => navigate("/bookings?new=true")}
            className="bg-[#1E7B5A] hover:bg-[#166046] text-white text-xs font-semibold h-9 px-4 gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Service Booking
          </Button>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
      </div>

      {/* KPI Statistic Cards (Dynamic from Supabase) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={isLoading ? "..." : stats?.totalCustomers ?? 0}
          trend="+18%"
          trendLabel="vs last month"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate("/customers")}
        />

        <StatCard
          title="Total Bookings"
          value={isLoading ? "..." : stats?.totalRequests ?? 0}
          trend="+24%"
          trendLabel="same-day dispatch"
          icon={CalendarCheck}
          iconColor="text-[#223f6b]"
          iconBg="bg-slate-100"
          onClick={() => navigate("/bookings")}
        />

        <StatCard
          title="In Progress / Pending"
          value={isLoading ? "..." : stats?.pendingRequests ?? 0}
          subtitle="Awaiting completion"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          onClick={() => navigate("/bookings")}
        />

        <StatCard
          title="Total Revenue"
          value={isLoading ? "..." : formatCurrency(stats?.totalRevenue ?? 0)}
          trend="+14.2%"
          trendLabel="cleared payments"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => navigate("/payments")}
        />
      </div>

      {/* Second Row: Emergency Alerts + Completed KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-rose-200 bg-rose-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                Emergency Dispatches
              </div>
              <div className="text-2xl font-extrabold text-rose-900">
                {isLoading ? "..." : stats?.emergencyRequests ?? 0}
              </div>
              <p className="text-xs text-rose-600">Priority same-day responses</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/emergency")}
              className="bg-white border-rose-200 text-rose-700 hover:bg-rose-50 text-xs"
            >
              View Queue
            </Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                Completed Services
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">
                {isLoading ? "..." : stats?.completedServices ?? 0}
              </div>
              <p className="text-xs text-emerald-700">90-Day warranty active</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/bookings")}
              className="bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs"
            >
              View Records
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#223f6b] text-xs font-bold uppercase tracking-wider">
                <Truck className="h-4 w-4" />
                Master Technicians
              </div>
              <div className="text-2xl font-extrabold text-[#16264a]">
                {isLoading ? "..." : `${stats?.activeTechs ?? 0} Active`}
              </div>
              <p className="text-xs text-slate-500">Fully equipped service vans</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/technicians")}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
            >
              View Roster
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Bookings & Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Bookings Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold text-[#16264a]">
                  Recent Service Requests
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live diagnostics and repairs in progress
                </p>
              </div>
              <Link to="/bookings">
                <Button variant="ghost" size="sm" className="text-xs text-[#223f6b] hover:bg-slate-100 gap-1">
                  View all ({stats?.totalRequests ?? 0})
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Booking #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Appliance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                          <td colSpan="5" className="px-4 py-8 text-center">
                            <SpinnerCustom text="Loading recent bookings from Supabase..." />
                          </td>
                      </tr>
                    ) : stats?.recentBookings?.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                          No service bookings found.
                        </td>
                      </tr>
                    ) : (
                      stats?.recentBookings?.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono font-bold text-[#223f6b]">
                            {b.booking_code}
                            {b.is_emergency && (
                              <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {b.customer_name}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {b.customer_phone}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <span className="font-semibold text-slate-700">
                              {b.brand}
                            </span>{" "}
                            {b.appliance_name}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge step={b.current_step} status={b.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs bg-white text-slate-700 hover:text-[#223f6b]"
                              onClick={() => handleOpenBookingDetails(b)}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Operations Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => navigate("/scheduling")}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#223f6b]/40 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#16264a]">Service Scheduling</p>
                <p className="text-[11px] text-slate-400">Manage time slots & routes</p>
              </div>
            </div>

            <div
              onClick={() => navigate("/pricing")}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#223f6b]/40 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#16264a]">Pricing & Rates</p>
                <p className="text-[11px] text-slate-400">$79 standard diagnostics</p>
              </div>
            </div>

            <div
              onClick={() => navigate("/promotions")}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#223f6b]/40 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#16264a]">Active Promotions</p>
                <p className="text-[11px] text-slate-400">Spring & discount coupons</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Appliance Categories & Customer Activity */}
        <div className="space-y-6">
          {/* Appliance Category Demand Breakdown */}
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-[#16264a] flex items-center justify-between">
                <span>Appliance Breakdown</span>
                <span className="text-[11px] font-normal text-slate-400">By Service Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              {stats?.categoryStats?.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate">
                      {cat.name}
                    </span>
                    <span className="font-mono text-slate-500">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#223f6b]"
                      style={{ width: `${Math.min(100, cat.percentage * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Customers Directory Snippet */}
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-[#16264a]">
                Recent Customers
              </CardTitle>
              <Link to="/customers">
                <Button variant="ghost" size="sm" className="text-xs text-[#223f6b] hover:bg-slate-100 p-0 h-auto">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isLoading ? (
                <div className="py-6 text-center">
                  <SpinnerCustom text="Loading recent customers..." size="sm" />
                </div>
              ) : stats?.recentCustomers?.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No recent customers found.</p>
              ) : (
                stats?.recentCustomers?.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate("/customers")}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#e6edf8] text-[#16264a] font-bold text-xs flex items-center justify-center">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.city}, {c.state}</p>
                      </div>
                    </div>
                    <Badge
                      variant={c.status === "vip" ? "purple" : "outline"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {c.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right-Side Drawer: View Booking Details */}
      <DrawerSheet
        isOpen={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        title={`Booking #${selectedBooking?.booking_code || ""}`}
        description="Detailed service request and dispatch tracking record"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Current Dispatch Status</p>
                <div className="mt-1">
                  <StatusBadge
                    step={selectedBooking.current_step}
                    status={selectedBooking.status}
                  />
                </div>
              </div>
              {selectedBooking.is_emergency && (
                <Badge variant="destructive" className="animate-pulse">
                  PRIORITY EMERGENCY
                </Badge>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Customer Information
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.customer_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.customer_phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.customer_email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Address:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-xs">
                    {selectedBooking.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Appliance Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Appliance & Issue Description
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Appliance:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.appliance_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Brand / Model:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.brand} ({selectedBooking.model_number || "Standard"})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-400 mb-1">Issue Reported:</p>
                  <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 italic border border-slate-100">
                    "{selectedBooking.issue_description}"
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Technician */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Technician
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#16264a] text-white flex items-center justify-center font-bold">
                    {selectedBooking.technician_name ? selectedBooking.technician_name[0] : "T"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {selectedBooking.technician_name || "Unassigned"}
                    </p>
                    <p className="text-[11px] text-slate-400">Master Certified Specialist</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/technicians")}
                  className="text-xs"
                >
                  View Tech
                </Button>
              </div>
            </div>

            {/* Financials & Quote */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Billing & Charges
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Standard Diagnostic Fee:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(selectedBooking.diagnostic_fee || 79)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parts & Labor Quote:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(selectedBooking.quote_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm text-[#16264a]">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedBooking.total_amount || 79)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsViewDrawerOpen(false);
                  navigate(`/bookings`);
                }}
                className="w-full bg-[#223f6b] hover:bg-[#16264a] text-white text-xs"
              >
                Go to Bookings Management
              </Button>
            </div>
          </div>
        )}
      </DrawerSheet>
    </div>
  );
}


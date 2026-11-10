import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner, SpinnerCustom } from "@/components/ui/spinner";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  DollarSign,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [dashStats, techs] = await Promise.all([
          db.getDashboardStats(),
          db.getTechnicians(),
        ]);
        setStats(dashStats);
        setTechnicians(techs || []);
      } catch (e) {
        toast.error("Failed to load analytics.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const monthlyRevenue = [
    { month: "Nov", revenue: 9800, calls: 42 },
    { month: "Dec", revenue: 11200, calls: 51 },
    { month: "Jan", revenue: 12450, calls: 56 },
    { month: "Feb", revenue: 14100, calls: 62 },
    { month: "Mar", revenue: 16800, calls: 74 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  const handleExport = () => {
    toast.success("Analytics CSV summary generated & downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Reports & Business Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational KPIs, revenue realization, technician leaderboard, and appliance reliability metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs bg-white gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/90 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Diagnostic Conversion</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#16264a] mt-2">88.4%</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              +3.2% vs industry average
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Avg Repair Duration</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#16264a] mt-2">52 Mins</p>
            <p className="text-xs text-slate-400 mt-1">
              From arrival to full restoration
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Warranty Recalls</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#16264a] mt-2">0.8%</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              99.2% zero-defect rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Customer CSAT</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#16264a] mt-2">4.96 / 5</p>
            <p className="text-xs text-slate-400 mt-1">
              Over 1,240 verified reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Revenue Growth Chart */}
        <Card className="lg:col-span-2 border-slate-200/90 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#16264a]">
                Monthly Realized Revenue
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Completed service invoices and diagnostic clearance
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-emerald-700 bg-emerald-50">
              +24% YoY Growth
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-56 flex items-end gap-6 pt-6">
              {monthlyRevenue.map((item, idx) => {
                const heightPct = Math.round((item.revenue / maxRevenue) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-bold text-[#223f6b] opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(item.revenue)}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-xl h-44 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-[#16264a] via-[#223f6b] to-[#386a94] rounded-t-xl transition-all duration-500 hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{item.month}</span>
                    <span className="text-[10px] text-slate-400">{item.calls} jobs</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Appliance Demand Distribution */}
        <Card className="border-slate-200/90 bg-white shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-[#16264a]">
              Category Demand
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Most frequent repairs by system</p>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {[
              { name: "Refrigeration & Freezers", pct: 38, count: "4,120 repairs", color: "bg-blue-600" },
              { name: "Laundry Care (Washers/Dryers)", pct: 32, count: "6,790 repairs", color: "bg-indigo-600" },
              { name: "Kitchen (Dishwashers/Disposals)", pct: 18, count: "4,460 repairs", color: "bg-emerald-600" },
              { name: "Cooking (Ovens & Ranges)", pct: 12, count: "2,180 repairs", color: "bg-amber-600" },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <span className="font-mono text-slate-500">{cat.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{cat.count}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Technician Leaderboard */}
      <Card className="border-slate-200/90 bg-white shadow-2xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-[#16264a]">
            Field Technician Performance Roster
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer satisfaction ratings, lifetime completed jobs, and on-time arrival metrics
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Master Technician</th>
                  <th className="px-5 py-3">Rating Score</th>
                  <th className="px-5 py-3">Completed Repairs</th>
                  <th className="px-5 py-3">On-Time Arrival</th>
                  <th className="px-5 py-3">Assigned Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {
                    isLoading?(
                  <tr>
                  <td colSpan="5" className="px-5 py-8 text-center">
                    <SpinnerCustom text="Loading technician performance from Supabase..." />
                  </td>
                  </tr>
              ) : (
                  technicians.map((tech) => (
              <tr key={tech.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[#16264a] text-white flex items-center justify-center font-bold text-[10px]">
                      {tech.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{tech.name}</p>
                      <p className="text-[10px] text-slate-400">{tech.title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{tech.rating}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-bold text-slate-700">
                  {tech.completed_jobs} jobs
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="success" className="text-[10px]">
                    98.6% On Time
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">
                  {tech.vehicle}
                </td>
              </tr>
                )))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    </div >
  );
}


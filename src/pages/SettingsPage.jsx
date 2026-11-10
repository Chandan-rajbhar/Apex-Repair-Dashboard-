import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  updateSupabaseCredentials,
} from "@/lib/supabase";
import { toast } from "sonner";
import {
  Settings,
  Database,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Clock,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export function SettingsPage() {
  const isConfigured = isSupabaseConfigured();

  // Company Settings State
  const [companyData, setCompanyData] = useState({
    name: "Apex Appliance Repair",
    phone: "(877) 225-2046",
    emergencyPhone: "(877) 225-2046 ext 911",
    email: "support@apexrepair.com",
    address: "742 Evergreen Terr, Suite 4B, Springfield, IL 62704",
    operatingHours: "Monday – Saturday: 7:00 AM – 8:00 PM",
    emergencyAvailable: true,
    standardDiagnosticFee: 79.00,
  });

  // Supabase Credentials State
  const [dbUrl, setDbUrl] = useState(supabaseUrl || "");
  const [dbKey, setDbKey] = useState(supabaseAnonKey || "");

  // Notifications State
  const [notifPreferences, setNotifPreferences] = useState({
    emergencySms: true,
    quoteApprovalEmail: true,
    dailySummary: true,
    lowInventoryAlert: false,
  });

  const handleSaveCompany = (e) => {
    e.preventDefault();
    toast.success("Company information & dispatch settings saved!");
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    updateSupabaseCredentials(dbUrl, dbKey);
    toast.success("Supabase credentials updated! Reloading application...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#16264a]">
          Admin Profile & System Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage business dispatch parameters, operating hours, emergency hotlines, and Supabase database connection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Business Info & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information Card */}
          <Card className="border-slate-200/90 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-[#223f6b]">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#16264a]">
                    Business Information & Dispatch Hotlines
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Official contact details displayed on customer quotes and website
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSaveCompany}>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Company Name</Label>
                    <Input
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Standard Diagnostic Fee ($)</Label>
                    <Input
                      type="number"
                      value={companyData.standardDiagnosticFee}
                      onChange={(e) => setCompanyData({ ...companyData, standardDiagnosticFee: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Customer Dispatch Phone</Label>
                    <Input
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">24/7 Emergency Dispatch Line</Label>
                    <Input
                      value={companyData.emergencyPhone}
                      onChange={(e) => setCompanyData({ ...companyData, emergencyPhone: e.target.value })}
                      className="mt-1 font-mono text-rose-600 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Support & Invoicing Email</Label>
                    <Input
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Operating Hours</Label>
                    <Input
                      value={companyData.operatingHours}
                      onChange={(e) => setCompanyData({ ...companyData, operatingHours: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Regional Dispatch Headquarters Address</Label>
                  <Input
                    value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">24/7 Same-Day Emergency Dispatch Active</p>
                    <p className="text-[11px] text-slate-400">Accept urgent emergency calls outside standard hours</p>
                  </div>
                  <Switch
                    checked={companyData.emergencyAvailable}
                    onCheckedChange={(checked) => setCompanyData({ ...companyData, emergencyAvailable: checked })}
                  />
                </div>
              </CardContent>
              <CardFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
                <Button type="submit" size="sm" className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Save Company Settings
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Dispatch Notification Alerts */}
          <Card className="border-slate-200/90 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#16264a]">
                    Notification Dispatch Preferences
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose how field alerts and quote approvals are routed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Instant SMS on Emergency Dispatch</p>
                  <p className="text-[11px] text-slate-400">Direct alert to on-duty technician mobile device</p>
                </div>
                <Switch
                  checked={notifPreferences.emergencySms}
                  onCheckedChange={(c) => setNotifPreferences({ ...notifPreferences, emergencySms: c })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Email Notification on Quote Sign-off</p>
                  <p className="text-[11px] text-slate-400">Notify dispatch desk when customer digitally signs quote</p>
                </div>
                <Switch
                  checked={notifPreferences.quoteApprovalEmail}
                  onCheckedChange={(c) => setNotifPreferences({ ...notifPreferences, quoteApprovalEmail: c })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Daily Revenue & Route Digest</p>
                  <p className="text-[11px] text-slate-400">Nightly summary of completed repairs and invoice receipts</p>
                </div>
                <Switch
                  checked={notifPreferences.dailySummary}
                  onCheckedChange={(c) => setNotifPreferences({ ...notifPreferences, dailySummary: c })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Supabase Configuration */}
        <div className="space-y-6">
          <Card className="border-slate-200/90 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isConfigured ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#16264a]">
                    Supabase Database
                  </CardTitle>
                  <CardDescription className="text-xs">
                    PostgreSQL backend connection
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSaveSupabase}>
              <CardContent className="p-5 space-y-4">
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  isConfigured ? "bg-emerald-50/70 border-emerald-200 text-emerald-800" : "bg-amber-50/70 border-amber-200 text-amber-800"
                }`}>
                  {isConfigured ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <span className="font-semibold">
                    {isConfigured ? "Connected to Supabase" : "Running on Local Database Fallback"}
                  </span>
                </div>

                <div>
                  <Label className="text-xs font-semibold">VITE_SUPABASE_URL</Label>
                  <Input
                    placeholder="https://xyzcompany.supabase.co"
                    value={dbUrl}
                    onChange={(e) => setDbUrl(e.target.value)}
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">VITE_SUPABASE_ANON_KEY</Label>
                  <Input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={dbKey}
                    onChange={(e) => setDbKey(e.target.value)}
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-slate-700">Database Schema:</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    A complete migration script <code className="font-mono text-[#223f6b] font-bold">supabase-schema.sql</code> is included in this repository. Run it in the Supabase SQL Editor.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
                <Button type="submit" size="sm" className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Update Credentials
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Admin Profile Details */}
          <Card className="border-slate-200/90 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-[#16264a]">
                Admin Dispatch Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Logged in as:</span>
                <span className="font-bold text-slate-800">Lead Operations Dispatcher</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Email:</span>
                <span className="font-semibold text-slate-800">admin@apexrepair.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Role:</span>
                <Badge variant="purple" className="text-[10px] font-bold">
                  SUPER ADMIN
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/common/DataTable";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle,
  Flame,
  Truck,
  Phone,
  Clock,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Wrench,
  Radio,
} from "lucide-react";

export function EmergencyPage() {
  const [emergencyBookings, setEmergencyBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer state
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'dispatch' | 'view'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Dispatch Form State
  const [dispatchData, setDispatchData] = useState({
    technician_id: "",
    eta_minutes: 15,
  });

  // New Emergency Request Form State
  const [newEmergencyData, setNewEmergencyData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address: "",
    appliance_id: "refrigerators",
    appliance_name: "Refrigerators",
    brand: "Samsung",
    issue_description: "Compressor stopped cooling / Food spoilage emergency",
    preferred_time_slot: "Immediate Same-Day Dispatch",
    technician_id: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allBookings, techList, srvList] = await Promise.all([
        db.getBookings(),
        db.getTechnicians(),
        db.getServices(),
      ]);
      const emergencies = (allBookings || []).filter((b) => b.is_emergency);
      setEmergencyBookings(emergencies);
      setTechnicians(techList || []);
      setServices(srvList || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load emergency dispatches from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDispatch = (booking) => {
    setSelectedBooking(booking);
    setDispatchData({
      technician_id: booking.technician_id || technicians[0]?.id || "",
      eta_minutes: 15,
    });
    setActiveDrawer("dispatch");
  };

  const handleOpenView = (booking) => {
    setSelectedBooking(booking);
    setActiveDrawer("view");
  };

  const handleOpenAdd = () => {
    setNewEmergencyData({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      address: "",
      appliance_id: services[0]?.id || "refrigerators",
      appliance_name: services[0]?.name || "Refrigerators",
      brand: "Samsung",
      issue_description: "Urgent cooling / leak issue requiring immediate technician dispatch",
      preferred_time_slot: "Immediate Same-Day Dispatch",
      technician_id: technicians[0]?.id || "",
    });
    setActiveDrawer("add");
  };

  const handleConfirmDispatch = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    try {
      const tech = technicians.find((t) => t.id === dispatchData.technician_id);
      await db.updateBooking(selectedBooking.id, {
        technician_id: dispatchData.technician_id,
        technician_name: tech ? tech.name : selectedBooking.technician_name,
        current_step: 4, // Step 4: Technician On The Way
        status: "on_the_way",
      });
      toast.success(
        `Emergency Unit Dispatched! ${tech ? tech.name : "Technician"} is en-route (ETA: ${dispatchData.eta_minutes} mins).`
      );
      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      toast.error("Failed to update dispatch status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEmergency = async (e) => {
    if (e) e.preventDefault();
    if (!newEmergencyData.customer_name || !newEmergencyData.customer_phone) {
      toast.error("Please enter the customer name and phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tech = technicians.find((t) => t.id === newEmergencyData.technician_id);
      await db.addBooking({
        ...newEmergencyData,
        is_emergency: true,
        current_step: tech ? 4 : 1, // If tech selected, immediately En Route, else Received
        status: tech ? "on_the_way" : "request_received",
        technician_name: tech ? tech.name : null,
        preferred_date: new Date().toISOString().split("T")[0],
        diagnostic_fee: 79.00,
        quote_amount: 0.00,
      });
      toast.success("Emergency priority booking logged and dispatched!");
      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create emergency request in Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: "booking_code",
      header: "Alert Code",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-rose-600">
            {row.booking_code}
          </span>
          <StatusBadge type="emergency" />
        </div>
      ),
    },
    {
      key: "customer_name",
      header: "Customer & Address",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.customer_name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.customer_phone}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{row.address}</p>
        </div>
      ),
    },
    {
      key: "appliance_name",
      header: "Fault Diagnosis",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-700">{row.brand}</span>{" "}
          <span className="text-slate-600">{row.appliance_name}</span>
          <p className="text-[11px] text-rose-700 font-medium italic truncate max-w-xs">
            "{row.issue_description}"
          </p>
        </div>
      ),
    },
    {
      key: "current_step",
      header: "Dispatch Status",
      sortable: true,
      render: (row) => (
        <StatusBadge step={row.current_step} status={row.status} />
      ),
    },
    {
      key: "technician_name",
      header: "En-Route Unit",
      render: (row) => (
        <div>
          {row.technician_name ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Truck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{row.technician_name}</span>
            </div>
          ) : (
            <Badge variant="destructive" className="animate-pulse text-[10px]">
              Awaiting Dispatch
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-[#16264a] text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Radio className="h-3.5 w-3.5 animate-pulse text-rose-400" />
            Priority Rapid Response Dispatch
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Emergency Appliance Service Queue
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/80 max-w-xl">
            Live monitoring for active water leaks, refrigerant loss, failed heating elements, and spoiled food emergencies. Same-day arrival guarantee.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button
            onClick={handleOpenAdd}
            className="bg-white hover:bg-slate-100 text-rose-900 font-bold text-xs h-9 px-4 shadow-sm"
          >
            <Flame className="h-4 w-4 text-rose-600 mr-1.5" />
            Trigger Emergency Call
          </Button>
        </div>
      </div>

      {/* Emergency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-200 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Emergency Queue
              </p>
              <p className="text-2xl font-black text-rose-950">
                {emergencyBookings.length} Active Calls
              </p>
              <p className="text-xs text-slate-500">Highest regional dispatch priority</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Target Response Time
              </p>
              <p className="text-2xl font-black text-emerald-950">
                &lt; 60 Mins
              </p>
              <p className="text-xs text-slate-500">Live GPS tracking enabled</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#223f6b] uppercase tracking-wider">
                24/7 Hotline
              </p>
              <p className="text-2xl font-black text-[#16264a]">
                (877) 225-2046
              </p>
              <p className="text-xs text-slate-500">Dedicated dispatch phone line</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Phone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Table */}
      <DataTable
        data={emergencyBookings}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading emergency priority dispatch requests..."
        searchPlaceholder="Search emergency bookings, customer, address..."
        searchKey={(item, q) => {
          const matchCode = (item.booking_code || "").toLowerCase().includes(q);
          const matchCust = (item.customer_name || "").toLowerCase().includes(q);
          const matchIssue = (item.issue_description || "").toLowerCase().includes(q);
          return matchCode || matchCust || matchIssue;
        }}
        onView={handleOpenView}
        onEdit={handleOpenDispatch}
        customActions={null}
        onRefresh={loadData}
        emptyTitle="No Active Emergency Dispatches"
        emptyDescription="All priority same-day calls have been safely handled and resolved."
      />

      {/* Right Drawer: Trigger Emergency Call */}
      <DrawerSheet
        isOpen={activeDrawer === "add"}
        onClose={() => setActiveDrawer(null)}
        title="Trigger Emergency Dispatch"
        description="Immediately log and dispatch highest-priority same-day diagnostic unit"
        onSubmit={handleCreateEmergency}
        isSubmitting={isSubmitting}
        submitLabel="Dispatch Immediately"
      >
        <form onSubmit={handleCreateEmergency} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Emergency requests bypass standard queues and notify nearby service vans instantly.</span>
          </div>

          <div>
            <Label className="text-xs font-semibold">Customer Full Name *</Label>
            <Input
              placeholder="e.g. Eleanor Vance"
              value={newEmergencyData.customer_name}
              onChange={(e) => setNewEmergencyData({ ...newEmergencyData, customer_name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Phone Number *</Label>
              <Input
                placeholder="(877) 225-2046"
                value={newEmergencyData.customer_phone}
                onChange={(e) => setNewEmergencyData({ ...newEmergencyData, customer_phone: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={newEmergencyData.customer_email}
                onChange={(e) => setNewEmergencyData({ ...newEmergencyData, customer_email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Emergency Service Address *</Label>
            <Input
              placeholder="Street, unit, city, zip"
              value={newEmergencyData.address}
              onChange={(e) => setNewEmergencyData({ ...newEmergencyData, address: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Appliance</Label>
              <Select
                value={newEmergencyData.appliance_id}
                onValueChange={(val) => {
                  const s = services.find((srv) => srv.id === val);
                  setNewEmergencyData({
                    ...newEmergencyData,
                    appliance_id: val,
                    appliance_name: s ? s.name : "Appliance",
                  });
                }}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Appliance" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Brand</Label>
              <Input
                placeholder="e.g. Sub-Zero, LG, Wolf"
                value={newEmergencyData.brand}
                onChange={(e) => setNewEmergencyData({ ...newEmergencyData, brand: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Emergency Issue Description *</Label>
            <textarea
              rows={3}
              placeholder="Describe urgent failure (water flooding floor, refrigerator defrost loop dead, electrical burning odor...)"
              value={newEmergencyData.issue_description}
              onChange={(e) => setNewEmergencyData({ ...newEmergencyData, issue_description: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Immediate Master Tech Assignment</Label>
            <Select
              value={newEmergencyData.technician_id}
              onValueChange={(val) => setNewEmergencyData({ ...newEmergencyData, technician_id: val })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select Available Tech" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.status}) - {t.vehicle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: Quick Dispatch Action */}
      <DrawerSheet
        isOpen={activeDrawer === "dispatch"}
        onClose={() => setActiveDrawer(null)}
        title={`Rapid Dispatch: #${selectedBooking?.booking_code}`}
        description="Assign service van and set real-time GPS arrival alert"
        onSubmit={handleConfirmDispatch}
        isSubmitting={isSubmitting}
        submitLabel="Confirm & Dispatch Tech"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-800">{selectedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{selectedBooking.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issue:</span>
                <span className="font-semibold text-rose-700">{selectedBooking.issue_description}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Select Master Technician to Dispatch</Label>
              <Select
                value={dispatchData.technician_id}
                onValueChange={(val) => setDispatchData({ ...dispatchData, technician_id: val })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.status}) - {t.vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Estimated Arrival ETA (Minutes)</Label>
              <Input
                type="number"
                value={dispatchData.eta_minutes}
                onChange={(e) => setDispatchData({ ...dispatchData, eta_minutes: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Right Drawer: View Emergency Details */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={`Emergency Alert #${selectedBooking?.booking_code}`}
        description="Complete priority dispatch details and service notes"
        footer={
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDrawer(null)}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenDispatch(selectedBooking)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
            >
              <Truck className="h-3.5 w-3.5" />
              Re-assign Van
            </Button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-rose-700 font-bold uppercase">Status:</span>
                <StatusBadge step={selectedBooking.current_step} status={selectedBooking.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-800">{selectedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{selectedBooking.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Appliance:</span>
                <span className="font-bold text-[#16264a]">{selectedBooking.brand} {selectedBooking.appliance_name}</span>
              </div>
              <div className="pt-2 border-t border-rose-200">
                <p className="text-rose-900 font-semibold mb-1">Reported Symptoms:</p>
                <p className="p-2 rounded bg-white/80 border border-rose-100 italic">
                  "{selectedBooking.issue_description}"
                </p>
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>
    </div>
  );
}


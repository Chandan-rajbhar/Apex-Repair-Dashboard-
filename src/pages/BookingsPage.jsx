import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DataTable } from "@/components/common/DataTable";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";
import { BOOKING_STEPS } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  CalendarCheck,
  Clock,
  User,
  Truck,
  Wrench,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

export function BookingsPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer & Dialog State
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'edit' | 'view' | null
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
    appliance_id: "refrigerators",
    appliance_name: "Refrigerators",
    brand: "Samsung",
    model_number: "",
    issue_description: "",
    is_emergency: false,
    preferred_date: new Date().toISOString().split("T")[0],
    preferred_time_slot: "11:00 AM – 2:00 PM",
    current_step: 1,
    technician_id: "",
    technician_name: "",
    diagnostic_fee: 79,
    quote_amount: 0,
    payment_status: "unpaid",
    notes: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookList, srvList, techList] = await Promise.all([
        db.getBookings(),
        db.getServices(),
        db.getTechnicians(),
      ]);
      setBookings(bookList || []);
      setServices(srvList || []);
      setTechnicians(techList || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load service bookings from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check if opened with query parameter
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "true") {
      handleOpenAdd();
    }
  }, [location.search]);

  // Form Openers
  const handleOpenAdd = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      address: "",
      appliance_id: services[0]?.id || "refrigerators",
      appliance_name: services[0]?.name || "Refrigerators",
      brand: "Whirlpool",
      model_number: "",
      issue_description: "",
      is_emergency: false,
      preferred_date: new Date().toISOString().split("T")[0],
      preferred_time_slot: "11:00 AM – 2:00 PM",
      current_step: 1,
      technician_id: "",
      technician_name: "",
      diagnostic_fee: 79,
      quote_amount: 0,
      payment_status: "unpaid",
      notes: "",
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (booking) => {
    setSelectedBooking(booking);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      customer_name: booking.customer_name || "",
      customer_email: booking.customer_email || "",
      customer_phone: booking.customer_phone || "",
      address: booking.address || "",
      appliance_id: booking.appliance_id || "refrigerators",
      appliance_name: booking.appliance_name || "Refrigerators",
      brand: booking.brand || "",
      model_number: booking.model_number || "",
      issue_description: booking.issue_description || "",
      is_emergency: Boolean(booking.is_emergency),
      preferred_date: booking.preferred_date || new Date().toISOString().split("T")[0],
      preferred_time_slot: booking.preferred_time_slot || "11:00 AM – 2:00 PM",
      current_step: booking.current_step || 1,
      technician_id: booking.technician_id || "",
      technician_name: booking.technician_name || "",
      diagnostic_fee: booking.diagnostic_fee || 79,
      quote_amount: booking.quote_amount || 0,
      payment_status: booking.payment_status || "unpaid",
      notes: booking.notes || "",
    });
    setActiveDrawer("edit");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.customer_name.trim() || !formData.issue_description.trim()) {
      toast.error("Please enter the customer name and issue description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTech = technicians.find((t) => t.id === formData.technician_id);

      const payload = {
        ...formData,
        technician_name: selectedTech ? selectedTech.name : formData.technician_name,
        diagnostic_fee: Number(formData.diagnostic_fee) || 79,
        quote_amount: Number(formData.quote_amount) || 0,
        current_step: Number(formData.current_step) || 1,
      };

      if (activeDrawer === "add") {
        await db.addBooking(payload);
        toast.success("Service request logged successfully!");
      } else if (activeDrawer === "edit" && selectedBooking) {
        await db.updateBooking(selectedBooking.id, payload);
        toast.success(`Booking #${selectedBooking.booking_code} updated successfully!`);
      }

      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save booking to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteBooking(bookingToDelete.id);
      toast.success(`Booking #${bookingToDelete.booking_code} deleted.`);
      setBookingToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete booking.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Direct advance step handler inside View drawer
  const handleAdvanceStepDirect = async (nextStep) => {
    if (!selectedBooking) return;
    try {
      const updated = await db.updateBooking(selectedBooking.id, { current_step: nextStep });
      setSelectedBooking(updated);
      toast.success(`Advanced to Step ${nextStep}!`);
      await loadData();
    } catch (e) {
      toast.error("Failed to advance step.");
    }
  };

  // Columns definition
  const columns = [
    {
      key: "booking_code",
      header: "Booking #",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#223f6b]">
            {row.booking_code}
          </span>
          {row.is_emergency && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="Emergency Request" />
          )}
        </div>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.customer_name}</p>
          <p className="text-[11px] text-slate-400">{row.customer_phone}</p>
        </div>
      ),
    },
    {
      key: "appliance_name",
      header: "Appliance & Brand",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-700">{row.brand}</span>{" "}
          <span className="text-slate-600">{row.appliance_name}</span>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{row.issue_description}</p>
        </div>
      ),
    },
    {
      key: "preferred_date",
      header: "Date & Window",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-700">{formatDate(row.preferred_date)}</p>
          <p className="text-[11px] text-slate-400">{row.preferred_time_slot}</p>
        </div>
      ),
    },
    {
      key: "current_step",
      header: "Dispatch Step",
      sortable: true,
      render: (row) => (
        <StatusBadge step={row.current_step} status={row.status} />
      ),
    },
    {
      key: "technician_name",
      header: "Assigned Tech",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.technician_name || (
            <span className="text-amber-600 font-normal italic">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Total",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-[#16264a]">{formatCurrency(row.total_amount)}</span>
          <div className="text-[10px] text-slate-400 capitalize">
            {row.payment_status}
          </div>
        </div>
      ),
    },
  ];

  const filterOptions = BOOKING_STEPS.map((s) => ({
    label: `Step ${s.id}: ${s.shortTitle}`,
    value: s.key,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">
            Service Requests & Bookings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full 9-step appliance diagnostic lifecycle from dispatch to quote authorization and repair sign-off
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-white">
            {bookings.length} Total Bookings
          </Badge>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={bookings}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading service bookings from Supabase..."
        searchPlaceholder="Search booking #, customer, brand, issue..."
        searchKey={(item, q) => {
          const matchCode = (item.booking_code || "").toLowerCase().includes(q);
          const matchName = (item.customer_name || "").toLowerCase().includes(q);
          const matchPhone = (item.customer_phone || "").toLowerCase().includes(q);
          const matchBrand = (item.brand || "").toLowerCase().includes(q);
          const matchAppliance = (item.appliance_name || "").toLowerCase().includes(q);
          const matchIssue = (item.issue_description || "").toLowerCase().includes(q);
          return matchCode || matchName || matchPhone || matchBrand || matchAppliance || matchIssue;
        }}
        filterOptions={filterOptions}
        onAdd={handleOpenAdd}
        addLabel="New Service Request"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setBookingToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Booking */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={
          activeDrawer === "add"
            ? "Create Service Booking"
            : `Edit Booking #${selectedBooking?.booking_code || ""}`
        }
        description="Configure diagnostic details, customer contact, and technician dispatch"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Create Booking" : "Update Booking"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emergency Priority Toggle */}
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-900">Emergency Priority Dispatch</p>
              <p className="text-[11px] text-rose-600">Immediate same-day route prioritization</p>
            </div>
            <Switch
              checked={formData.is_emergency}
              onCheckedChange={(checked) => setFormData({ ...formData, is_emergency: checked })}
            />
          </div>

          {/* Customer Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Customer & Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Customer Full Name *</Label>
                <Input
                  placeholder="e.g. Saurabh Yadav"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  placeholder="(877) 225-2046"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="demo@apex.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Service Address *</Label>
                <Input
                  placeholder="Street address, unit, city, zip"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Appliance Information */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Appliance & Problem Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Appliance Type</Label>
                <Select
                  value={formData.appliance_id}
                  onValueChange={(val) => {
                    const srv = services.find((s) => s.id === val);
                    setFormData({
                      ...formData,
                      appliance_id: val,
                      appliance_name: srv ? srv.name : "Appliance",
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
                  placeholder="e.g. Sub-Zero, Samsung, LG, Wolf"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Model Number</Label>
              <Input
                placeholder="e.g. RF28R7351SR French Door"
                value={formData.model_number}
                onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Issue Description *</Label>
              <textarea
                rows={3}
                placeholder="Describe fault symptoms (not cooling, error code, leaking, noise...)"
                value={formData.issue_description}
                onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#223f6b] outline-none"
                required
              />
            </div>
          </div>

          {/* Schedule & Technician */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Schedule & Dispatch
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Preferred Date</Label>
                <Input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Arrival Window</Label>
                <Select
                  value={formData.preferred_time_slot}
                  onValueChange={(val) => setFormData({ ...formData, preferred_time_slot: val })}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Select Window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:00 AM – 12:00 PM">9:00 AM – 12:00 PM</SelectItem>
                    <SelectItem value="11:00 AM – 2:00 PM">11:00 AM – 2:00 PM</SelectItem>
                    <SelectItem value="2:00 PM – 5:00 PM">2:00 PM – 5:00 PM</SelectItem>
                    <SelectItem value="3:00 PM – 6:00 PM">3:00 PM – 6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Assigned Technician</Label>
                <Select
                  value={formData.technician_id}
                  onValueChange={(val) => {
                    const tech = technicians.find((t) => t.id === val);
                    setFormData({
                      ...formData,
                      technician_id: val,
                      technician_name: tech ? tech.name : "",
                    });
                  }}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Select Master Tech" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Tracking Step (1 to 9)</Label>
                <Select
                  value={String(formData.current_step)}
                  onValueChange={(val) => setFormData({ ...formData, current_step: Number(val) })}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Select Step" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STEPS.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        Step {s.id}: {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing & Quotes */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Financials & Quotes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Standard Diagnostic Fee ($)</Label>
                <Input
                  type="number"
                  value={formData.diagnostic_fee}
                  onChange={(e) => setFormData({ ...formData, diagnostic_fee: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Parts & Labor Quote ($)</Label>
                <Input
                  type="number"
                  value={formData.quote_amount}
                  onChange={(e) => setFormData({ ...formData, quote_amount: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Booking Details & 9-Step Tracking */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={`Booking #${selectedBooking?.booking_code || ""}`}
        description="Detailed service request and live diagnostic tracking"
        footer={
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDrawer(null)}
              className="text-xs"
            >
              Close
            </Button>
            <div className="flex items-center gap-2">
              {selectedBooking && selectedBooking.current_step < 9 && (
                <Button
                  size="sm"
                  onClick={() => handleAdvanceStepDirect(selectedBooking.current_step + 1)}
                  className="bg-[#1E7B5A] hover:bg-[#166046] text-white text-xs gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Advance Step ({selectedBooking.current_step + 1}/9)
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleOpenEdit(selectedBooking)}
                className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
              >
                <Wrench className="h-3.5 w-3.5" />
                Edit Booking
              </Button>
            </div>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* 9-Step Interactive Progress Tracker */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  9-Step Repair Lifecycle
                </span>
                <span className="text-xs font-mono font-bold text-[#223f6b]">
                  Step {selectedBooking.current_step} of 9
                </span>
              </div>

              {/* Step pills */}
              <div className="space-y-2">
                {BOOKING_STEPS.map((step) => {
                  const isCurrent = step.id === selectedBooking.current_step;
                  const isPast = step.id < selectedBooking.current_step;

                  return (
                    <div
                      key={step.id}
                      onClick={() => handleAdvanceStepDirect(step.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-white border-[#223f6b] shadow-xs ring-1 ring-[#223f6b]/20"
                          : isPast
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                          : "bg-slate-50 border-slate-200/60 text-slate-400 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? "bg-[#223f6b] text-white"
                              : isPast
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isPast ? "✓" : step.id}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? "text-[#16264a]" : ""}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                        {step.badgeText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Contact Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                Customer Information
              </h4>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <User className="h-4 w-4 text-slate-400" />
                <span>{selectedBooking.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{selectedBooking.customer_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{selectedBooking.customer_email}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{selectedBooking.address}</span>
              </div>
            </div>

            {/* Appliance & Fault Details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                Appliance & Issue Description
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Appliance:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.appliance_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Brand / Model:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.brand} ({selectedBooking.model_number || "Standard"})
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 mb-1">Customer Issue Notes:</p>
                <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 italic border border-slate-100">
                  "{selectedBooking.issue_description}"
                </p>
              </div>
            </div>

            {/* Assigned Technician */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#16264a] text-white flex items-center justify-center font-bold">
                  {selectedBooking.technician_name ? selectedBooking.technician_name[0] : "T"}
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {selectedBooking.technician_name || "Unassigned"}
                  </p>
                  <p className="text-[11px] text-slate-400">Master Appliance Specialist</p>
                </div>
              </div>
              <Badge variant="outline" className="font-semibold">
                Arrival: {selectedBooking.preferred_time_slot}
              </Badge>
            </div>

            {/* Financials */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                Financials & Invoice Status
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Diagnostic Inspection Fee:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedBooking.diagnostic_fee || 79)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Quote:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedBooking.quote_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm text-[#16264a]">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedBooking.total_amount || 79)}</span>
              </div>
            </div>

            {/* Live Timeline History */}
            {selectedBooking.timeline && selectedBooking.timeline.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Timeline Activity
                </h4>
                <div className="space-y-2">
                  {selectedBooking.timeline.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-700 font-medium">{entry.note}</span>
                      <span className="font-mono text-slate-400 text-[11px] shrink-0 ml-2">
                        {entry.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(bookingToDelete)}
        onClose={() => setBookingToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete Booking #${bookingToDelete?.booking_code || ""}?`}
        description="Are you sure you want to delete this booking record? This will permanently delete the entry from Supabase."
      />
    </div>
  );
}


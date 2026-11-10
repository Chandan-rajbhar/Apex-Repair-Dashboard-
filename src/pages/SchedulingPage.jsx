import React, { useState, useEffect } from "react";
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
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner, SpinnerCustom } from "@/components/ui/spinner";
import {
  CalendarDays,
  Clock,
  User,
  Truck,
  Wrench,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  MapPin,
  Calendar,
} from "lucide-react";

export function SchedulingPage() {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scheduling State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [techFilter, setTechFilter] = useState("all");

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view"); // 'view' | 'reschedule' | 'add'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reschedule / New Form State
  const [rescheduleData, setRescheduleData] = useState({
    date: selectedDate,
    timeSlot: "11:00 AM – 2:00 PM",
    technician_id: "",
  });

  const timeSlots = [
    { slot: "9:00 AM – 12:00 PM", label: "Morning Window (09:00 - 12:00)" },
    { slot: "11:00 AM – 2:00 PM", label: "Midday Window (11:00 - 14:00)" },
    { slot: "2:00 PM – 5:00 PM", label: "Afternoon Window (14:00 - 17:00)" },
    { slot: "3:00 PM – 6:00 PM", label: "Evening Window (15:00 - 18:00)" },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookList, techList, srvList] = await Promise.all([
        db.getBookings(),
        db.getTechnicians(),
        db.getServices(),
      ]);
      setBookings(bookList || []);
      setTechnicians(techList || []);
      setServices(srvList || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scheduling data from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Filter bookings for current date & selected technician
  const filteredBookings = bookings.filter((b) => {
    const matchesDate = b.preferred_date === selectedDate;
    const matchesTech = techFilter === "all" || b.technician_id === techFilter;
    return matchesDate && matchesTech;
  });

  const handleOpenBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  };

  const handleOpenReschedule = (booking) => {
    setSelectedBooking(booking);
    setRescheduleData({
      date: booking.preferred_date || selectedDate,
      timeSlot: booking.preferred_time_slot || "11:00 AM – 2:00 PM",
      technician_id: booking.technician_id || "",
    });
    setDrawerMode("reschedule");
    setIsDrawerOpen(true);
  };

  const handleSaveReschedule = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    try {
      const tech = technicians.find((t) => t.id === rescheduleData.technician_id);
      await db.updateBooking(selectedBooking.id, {
        preferred_date: rescheduleData.date,
        preferred_time_slot: rescheduleData.timeSlot,
        technician_id: rescheduleData.technician_id,
        technician_name: tech ? tech.name : selectedBooking.technician_name,
      });
      toast.success(`Booking #${selectedBooking.booking_code} rescheduled to ${rescheduleData.date}!`);
      setIsDrawerOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Service Scheduling & Routes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Territory agenda, time-slot distribution, and technician van dispatch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs bg-white gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Navigation & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevDay}
            className="h-8 w-8 bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 text-xs bg-white"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
            className="h-8 w-8 bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 ml-2 font-bold text-sm text-[#16264a]">
            <Calendar className="h-4 w-4 text-[#223f6b]" />
            <span>{formatDate(selectedDate)}</span>
          </div>
        </div>

        {/* Technician Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter by Tech:</span>
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs bg-white">
              <SelectValue placeholder="All Technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time-Slots Schedule Grid */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
            <SpinnerCustom text="Loading daily schedule from Supabase..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeSlots.map((ts, idx) => {
              const slotBookings = filteredBookings.filter(
                (b) => b.preferred_time_slot === ts.slot
              );

              return (
                <Card key={idx} className="border-slate-200/90 shadow-2xs flex flex-col h-full bg-slate-50/40">
                  <CardHeader className="py-3 px-4 border-b border-slate-200/70 bg-white flex flex-row items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#223f6b]" />
                      <span className="font-bold text-xs text-[#16264a]">{ts.slot}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-slate-50">
                      {slotBookings.length} Visits
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5">
                    {slotBookings.length === 0 ? (
                      <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-slate-200/60 rounded-xl p-4">
                        <Clock className="h-6 w-6 text-slate-300 mb-1" />
                        <span>No dispatches scheduled</span>
                        <span className="text-[10px] text-slate-300">Slot is open for bookings</span>
                      </div>
                    ) : (
                      slotBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-[#223f6b]/50 hover:shadow-xs transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-mono text-xs font-bold text-[#223f6b]">
                              {b.booking_code}
                            </span>
                            <StatusBadge step={b.current_step} status={b.status} />
                          </div>

                          <div>
                            <p className="font-bold text-xs text-slate-800">{b.customer_name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {b.brand} {b.appliance_name}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{b.address}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                              Tech: {b.technician_name || "Unassigned"}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] text-blue-600 hover:text-blue-800"
                                onClick={() => handleOpenReschedule(b)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-1.5 text-[10px]"
                                onClick={() => handleOpenBookingDetails(b)}
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Right Drawer: View / Reschedule Appointment */}
      <DrawerSheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          drawerMode === "reschedule"
            ? `Reschedule Booking #${selectedBooking?.booking_code}`
            : `Appointment: #${selectedBooking?.booking_code}`
        }
        description="Modify appointment date, arrival window, or assign field technician"
        onSubmit={drawerMode === "reschedule" ? handleSaveReschedule : undefined}
        isSubmitting={isSubmitting}
        submitLabel="Confirm Reschedule"
      >
        {selectedBooking && (
          <div className="space-y-5">
            {drawerMode === "reschedule" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Scheduled Date *</Label>
                  <Input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Arrival Time Window *</Label>
                  <Select
                    value={rescheduleData.timeSlot}
                    onValueChange={(val) => setRescheduleData({ ...rescheduleData, timeSlot: val })}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Select Window" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((ts, idx) => (
                        <SelectItem key={idx} value={ts.slot}>
                          {ts.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Assign Technician</Label>
                  <Select
                    value={rescheduleData.technician_id}
                    onValueChange={(val) => setRescheduleData({ ...rescheduleData, technician_id: val })}
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
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
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
                    <span className="font-semibold text-slate-800">{selectedBooking.brand} {selectedBooking.appliance_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled:</span>
                    <span className="font-semibold text-[#223f6b]">{selectedBooking.preferred_date} ({selectedBooking.preferred_time_slot})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technician:</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.technician_name || "Unassigned"}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenReschedule(selectedBooking)}
                  className="w-full bg-[#223f6b] hover:bg-[#16264a] text-white text-xs"
                >
                  Change Date or Time Window
                </Button>
              </div>
            )}
          </div>
        )}
      </DrawerSheet>
    </div>
  );
}


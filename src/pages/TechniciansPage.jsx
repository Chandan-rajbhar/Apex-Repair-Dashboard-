import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/common/DataTable";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";
import { toast } from "sonner";
import {
  UserCheck,
  Star,
  Truck,
  Phone,
  Mail,
  Wrench,
  CheckCircle2,
  Clock,
  Shield,
  Edit2,
  Trash2,
} from "lucide-react";

export function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawers and Dialogs
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'edit' | 'view' | null
  const [selectedTech, setSelectedTech] = useState(null);
  const [techToDelete, setTechToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "Master Certified Appliance Specialist",
    rating: 4.95,
    completed_jobs: 0,
    active_jobs: 0,
    vehicle: "Ford Transit Master Van #TX-482",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    status: "available",
    specialtiesStr: "Refrigerators, Wine Coolers, Dishwashers",
    eta_minutes: 15,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await db.getTechnicians();
      setTechnicians(list || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load technicians from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "(877) 225-2046 ext ",
      title: "Master Certified Appliance Specialist",
      rating: 4.95,
      completed_jobs: 0,
      active_jobs: 0,
      vehicle: "Ford Transit Master Van #TX-100",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      status: "available",
      specialtiesStr: "Refrigerators, Washing Machines, Ovens",
      eta_minutes: 15,
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (tech) => {
    setSelectedTech(tech);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (tech) => {
    setSelectedTech(tech);
    const specStr = Array.isArray(tech.specialties)
      ? tech.specialties.join(", ")
      : tech.specialties || "";

    setFormData({
      name: tech.name || "",
      email: tech.email || "",
      phone: tech.phone || "",
      title: tech.title || "Master Certified Appliance Specialist",
      rating: tech.rating || 4.95,
      completed_jobs: tech.completed_jobs || 0,
      active_jobs: tech.active_jobs || 0,
      vehicle: tech.vehicle || "",
      photo_url: tech.photo_url || "",
      status: tech.status || "available",
      specialtiesStr: specStr,
      eta_minutes: tech.eta_minutes || 15,
    });
    setActiveDrawer("edit");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please provide both name and phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const specArray = formData.specialtiesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        title: formData.title.trim(),
        rating: Number(formData.rating) || 4.95,
        completed_jobs: Number(formData.completed_jobs) || 0,
        active_jobs: Number(formData.active_jobs) || 0,
        vehicle: formData.vehicle.trim(),
        photo_url: formData.photo_url.trim(),
        status: formData.status,
        specialties: specArray,
        eta_minutes: Number(formData.eta_minutes) || 15,
      };

      if (activeDrawer === "add") {
        await db.addTechnician(payload);
        toast.success(`Technician ${payload.name} added successfully!`);
      } else if (activeDrawer === "edit" && selectedTech) {
        await db.updateTechnician(selectedTech.id, payload);
        toast.success(`Technician ${payload.name} updated successfully!`);
      }

      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Error saving technician to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!techToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteTechnician(techToDelete.id);
      toast.success(`Technician ${techToDelete.name} removed from roster.`);
      setTechToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete technician.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Technician & Specialist",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-slate-200">
            <AvatarImage src={row.photo_url} alt={row.name} />
            <AvatarFallback>{row.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Availability",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.status} type="technician_status" />
      ),
    },
    {
      key: "vehicle",
      header: "Service Van & Vehicle",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-xs">{row.vehicle}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact Phone",
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">{row.phone}</span>
      ),
    },
    {
      key: "rating",
      header: "Rating / Jobs",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800">{row.rating}</span>
          <span className="text-slate-400 text-[11px]">({row.completed_jobs} done)</span>
        </div>
      ),
    },
    {
      key: "active_jobs",
      header: "Active Jobs",
      sortable: true,
      render: (row) => (
        <span className={`font-bold text-xs ${row.active_jobs > 0 ? "text-blue-600" : "text-slate-400"}`}>
          {row.active_jobs} assigned
        </span>
      ),
    },
  ];

  const filterOptions = [
    { label: "Available Now", value: "available" },
    { label: "On Active Job", value: "on_job" },
    { label: "Off Duty", value: "off_duty" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">
            Technicians & Field Staff
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master certified appliance technicians, service van assignments, and active field availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-white">
            {technicians.length} Field Technicians
          </Badge>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={technicians}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading technician roster & field assignments..."
        searchPlaceholder="Search technician name, vehicle, specialty..."
        searchKey={(item, q) => {
          const matchName = (item.name || "").toLowerCase().includes(q);
          const matchVehicle = (item.vehicle || "").toLowerCase().includes(q);
          const matchSpecialties = Array.isArray(item.specialties)
            ? item.specialties.some((s) => s.toLowerCase().includes(q))
            : false;
          return matchName || matchVehicle || matchSpecialties;
        }}
        filterOptions={filterOptions}
        onAdd={handleOpenAdd}
        addLabel="Add Technician"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setTechToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Technician */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer === "add" ? "Register Field Technician" : `Edit Technician: ${selectedTech?.name || ""}`}
        description="Technician credentials, vehicle assignment, and master certifications"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Register Technician" : "Save Changes"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Full Name *</Label>
            <Input
              placeholder="e.g. Marcus Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Phone Number *</Label>
              <Input
                placeholder="(877) 225-2046 ext 412"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                placeholder="tech@apexrepair.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Specialist Title</Label>
            <Input
              placeholder="e.g. Senior Master Appliance Specialist"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Service Van / Vehicle</Label>
              <Input
                placeholder="Ford Transit Master Van #TX-482"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Current Availability</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available for Dispatch</SelectItem>
                  <SelectItem value="on_job">On Active Job</SelectItem>
                  <SelectItem value="off_duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Photo URL</Label>
            <Input
              placeholder="https://..."
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Specialties & Certifications (comma-separated)</Label>
            <Input
              placeholder="Refrigerators, Wine Coolers, Sub-Zero Certified, Dishwashers..."
              value={formData.specialtiesStr}
              onChange={(e) => setFormData({ ...formData, specialtiesStr: e.target.value })}
              className="mt-1"
            />
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Technician Details */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={selectedTech?.name || "Technician Profile"}
        description={selectedTech?.title || "Master Appliance Specialist"}
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
              onClick={() => handleOpenEdit(selectedTech)}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        }
      >
        {selectedTech && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-sm">
                <AvatarImage src={selectedTech.photo_url} alt={selectedTech.name} />
                <AvatarFallback>{selectedTech.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-bold text-[#16264a]">{selectedTech.name}</h3>
                <p className="text-xs text-slate-500">{selectedTech.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedTech.status} type="technician_status" />
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">{selectedTech.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Completed Repairs</p>
                <p className="text-xl font-bold text-[#16264a] mt-0.5">
                  {selectedTech.completed_jobs || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Active Route Jobs</p>
                <p className="text-xl font-bold text-blue-600 mt-0.5">
                  {selectedTech.active_jobs || 0}
                </p>
              </div>
            </div>

            {/* Contact & Equipment */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                Field Logistics
              </h4>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="font-mono">{selectedTech.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{selectedTech.email || "dispatch@apexrepair.com"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Truck className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{selectedTech.vehicle}</span>
              </div>
            </div>

            {/* Specialties & OEM Brands */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Master Specialties & Certifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedTech.specialties)
                  ? selectedTech.specialties
                  : []
                ).map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#e6edf8] text-[#16264a] border border-[#c2d5e8]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(techToDelete)}
        onClose={() => setTechToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Remove Technician ${techToDelete?.name || ""}?`}
        description="Are you sure you want to remove this technician from the dispatch roster? This action deletes the record from Supabase."
      />
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/common/DataTable";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Wrench,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";

export function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawers & Dialogs State
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'edit' | 'view' | null
  const [selectedService, setSelectedService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category_id: "refrigeration",
    tag: "REFRIGERATION",
    diagnosticFee: 79,
    estDuration: "45-90 Mins",
    warranty: "90-Day Guarantee",
    badge: "SAME-DAY",
    shortDesc: "",
    fullDesc: "",
    popularBrandsStr: "",
    commonIssuesStr: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [srvList, catList] = await Promise.all([
        db.getServices(),
        db.getCategories(),
      ]);
      setServices(srvList || []);
      setCategories(catList || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load services data from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      category_id: "refrigeration",
      tag: "REFRIGERATION",
      diagnosticFee: 79,
      estDuration: "45-90 Mins",
      warranty: "90-Day Guarantee",
      badge: "SAME-DAY",
      shortDesc: "",
      fullDesc: "",
      popularBrandsStr: "Whirlpool, Samsung, LG, GE Profile",
      commonIssuesStr: "Will not power on or trips breaker\nFluctuating temperatures\nUnusual loud humming noise",
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (service) => {
    setSelectedService(service);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (service) => {
    setSelectedService(service);
    const brands = Array.isArray(service.popularBrands)
      ? service.popularBrands.join(", ")
      : service.popularBrands || "";
    const issues = Array.isArray(service.commonIssues)
      ? service.commonIssues.join("\n")
      : service.commonIssues || "";

    setFormData({
      name: service.name,
      category_id: service.category_id || "refrigeration",
      tag: service.tag || "REFRIGERATION",
      diagnosticFee: service.diagnosticFee || 79,
      estDuration: service.estDuration || "45-90 Mins",
      warranty: service.warranty || "90-Day Guarantee",
      badge: service.badge || "SAME-DAY",
      shortDesc: service.shortDesc || "",
      fullDesc: service.fullDesc || "",
      popularBrandsStr: brands,
      commonIssuesStr: issues,
    });
    setActiveDrawer("edit");
  };

  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide a service / appliance name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const brandsArray = formData.popularBrandsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const issuesArray = formData.commonIssuesStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        tag: formData.tag.toUpperCase(),
        diagnosticFee: Number(formData.diagnosticFee) || 79,
        estDuration: formData.estDuration.trim(),
        warranty: formData.warranty.trim(),
        badge: formData.badge.trim(),
        shortDesc: formData.shortDesc.trim(),
        fullDesc: formData.fullDesc.trim(),
        popularBrands: brandsArray,
        commonIssues: issuesArray,
      };

      if (activeDrawer === "add") {
        await db.addService(payload);
        toast.success(`Service "${payload.name}" added successfully!`);
      } else if (activeDrawer === "edit" && selectedService) {
        await db.updateService(selectedService.id, payload);
        toast.success(`Service "${payload.name}" updated successfully!`);
      }

      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Error saving service to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteService(serviceToDelete.id);
      toast.success(`Service "${serviceToDelete.name}" removed from database.`);
      setServiceToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      key: "name",
      header: "Service & Appliance",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#e6edf8] text-[#16264a] flex items-center justify-center font-bold text-xs shrink-0">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.name}</p>
            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{row.shortDesc}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tag",
      header: "Category",
      sortable: true,
      render: (row) => (
        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md tracking-wider">
          {row.tag}
        </span>
      ),
    },
    {
      key: "diagnosticFee",
      header: "Diagnostic Fee",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#16264a] text-xs sm:text-sm">
          {formatCurrency(row.diagnosticFee)}
        </span>
      ),
    },
    {
      key: "estDuration",
      header: "Est Duration",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{row.estDuration}</span>
        </div>
      ),
    },
    {
      key: "badge",
      header: "Badge",
      render: (row) => (
        <Badge
          variant={
            row.badge === "BEST-SELLER"
              ? "purple"
              : row.badge === "URGENT CARE"
              ? "destructive"
              : row.badge === "POPULAR"
              ? "warning"
              : "secondary"
          }
          className="text-[10px] font-bold tracking-wider"
        >
          {row.badge}
        </Badge>
      ),
    },
    {
      key: "rating",
      header: "Rating / Repairs",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800">{row.rating}</span>
          <span className="text-slate-400 text-[11px]">
            ({row.completedRepairs} jobs)
          </span>
        </div>
      ),
    },
  ];

  // Category filter options
  const filterOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">
            Services & Appliance Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage certified repair specialties, diagnostic pricing, warranties, and common fault issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-white">
            {services.length} Total Services Active
          </Badge>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        data={services}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading appliance repair service catalog..."
        searchPlaceholder="Search services, appliances, brands..."
        searchKey={(item, q) => {
          const matchName = item.name.toLowerCase().includes(q);
          const matchTag = item.tag.toLowerCase().includes(q);
          const matchBrands = Array.isArray(item.popularBrands)
            ? item.popularBrands.some((b) => b.toLowerCase().includes(q))
            : false;
          return matchName || matchTag || matchBrands;
        }}
        filterOptions={filterOptions}
        onAdd={handleOpenAdd}
        addLabel="Add New Service"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setServiceToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Service */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer === "add" ? "Add New Service Offering" : `Edit Service: ${selectedService?.name || ""}`}
        description="Configure diagnostic rates, durations, warranties, and common trouble patterns"
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Create Service" : "Save Changes"}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Service / Appliance Name *</Label>
            <Input
              placeholder="e.g. Refrigerators, Dishwashers..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Appliance Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(val) => {
                  const cat = categories.find((c) => c.id === val);
                  setFormData({
                    ...formData,
                    category_id: val,
                    tag: cat ? cat.tag : "APPLIANCE",
                  });
                }}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Diagnostic Fee ($)</Label>
              <Input
                type="number"
                value={formData.diagnosticFee}
                onChange={(e) => setFormData({ ...formData, diagnosticFee: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Estimated Duration</Label>
              <Input
                placeholder="e.g. 45-90 Mins"
                value={formData.estDuration}
                onChange={(e) => setFormData({ ...formData, estDuration: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Warranty Period</Label>
              <Input
                placeholder="e.g. 90-Day Guarantee"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Marketing Badge</Label>
            <Select
              value={formData.badge}
              onValueChange={(val) => setFormData({ ...formData, badge: val })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select Badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEST-SELLER">BEST-SELLER</SelectItem>
                <SelectItem value="SAME-DAY">SAME-DAY</SelectItem>
                <SelectItem value="POPULAR">POPULAR</SelectItem>
                <SelectItem value="PRECISION">PRECISION</SelectItem>
                <SelectItem value="URGENT CARE">URGENT CARE</SelectItem>
                <SelectItem value="QUICK FIX">QUICK FIX</SelectItem>
                <SelectItem value="SPECIALTY">SPECIALTY</SelectItem>
                <SelectItem value="LUXURY CARE">LUXURY CARE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Short Summary</Label>
            <Input
              placeholder="Brief 1-sentence overview for dispatch cards"
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Full Technical Scope</Label>
            <textarea
              rows={3}
              placeholder="Comprehensive diagnostic and component scope..."
              value={formData.fullDesc}
              onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#223f6b] outline-none"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Popular Brands Supported (comma-separated)</Label>
            <Input
              placeholder="Sub-Zero, Samsung, LG, Whirlpool, Bosch..."
              value={formData.popularBrandsStr}
              onChange={(e) => setFormData({ ...formData, popularBrandsStr: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Common Fault Issues (one per line)</Label>
            <textarea
              rows={4}
              placeholder="Not cooling properly&#10;Water leaking onto floor&#10;Loud humming noise"
              value={formData.commonIssuesStr}
              onChange={(e) => setFormData({ ...formData, commonIssuesStr: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#223f6b] outline-none"
            />
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Service Details */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={selectedService?.name || "Service Details"}
        description={`Category: ${selectedService?.tag || ""}`}
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
              onClick={() => handleOpenEdit(selectedService)}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Wrench className="h-3.5 w-3.5" />
              Edit Service
            </Button>
          </div>
        }
      >
        {selectedService && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="purple" className="font-bold">
                  {selectedService.badge}
                </Badge>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">
                    {selectedService.rating}
                  </span>
                  <span className="text-slate-400">
                    ({selectedService.completedRepairs} verified repairs)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">Diagnostic Fee</p>
                  <p className="font-bold text-[#16264a] mt-0.5">
                    {formatCurrency(selectedService.diagnosticFee)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Est Duration</p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedService.estDuration}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Warranty</p>
                  <p className="font-semibold text-emerald-700 mt-0.5">
                    {selectedService.warranty}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Technical Scope & Overview
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed p-3 rounded-lg border border-slate-100 bg-white">
                {selectedService.fullDesc || selectedService.shortDesc}
              </p>
            </div>

            {/* Supported Brands */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Certified OEM Brands
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedService.popularBrands)
                  ? selectedService.popularBrands
                  : []
                ).map((b, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Common Issues Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Common Fault Diagnostics
              </h4>
              <div className="space-y-1.5">
                {(Array.isArray(selectedService.commonIssues)
                  ? selectedService.commonIssues
                  : []
                ).map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete Service "${serviceToDelete?.name || ""}"?`}
        description="Are you sure you want to remove this service from the active catalog? This will delete the record from Supabase."
      />
    </div>
  );
}


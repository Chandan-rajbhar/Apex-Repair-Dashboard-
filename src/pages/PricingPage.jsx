import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/common/DataTable";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  DollarSign,
  ShieldCheck,
  Clock,
  Wrench,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle,
} from "lucide-react";

export function PricingPage() {
  const [pricing, setPricing] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer State
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'edit' | 'view'
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [priceToDelete, setPriceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    service_name: "",
    category: "Refrigeration",
    diagnostic_fee: 79.00,
    base_labor_rate: 120.00,
    emergency_fee: 49.00,
    parts_estimate_min: 40.00,
    parts_estimate_max: 250.00,
    warranty_months: 3,
    is_active: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prices, cats] = await Promise.all([
        db.getPricing(),
        db.getCategories(),
      ]);
      setPricing(prices || []);
      setCategories(cats || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pricing policies from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      service_name: "",
      category: "Refrigeration",
      diagnostic_fee: 79.00,
      base_labor_rate: 120.00,
      emergency_fee: 49.00,
      parts_estimate_min: 40.00,
      parts_estimate_max: 250.00,
      warranty_months: 3,
      is_active: true,
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (price) => {
    setSelectedPrice(price);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (price) => {
    setSelectedPrice(price);
    setFormData({
      service_name: price.service_name || "",
      category: price.category || "Refrigeration",
      diagnostic_fee: price.diagnostic_fee || 79.00,
      base_labor_rate: price.base_labor_rate || 120.00,
      emergency_fee: price.emergency_fee || 49.00,
      parts_estimate_min: price.parts_estimate_min || 40.00,
      parts_estimate_max: price.parts_estimate_max || 250.00,
      warranty_months: price.warranty_months || 3,
      is_active: price.is_active ?? true,
    });
    setActiveDrawer("edit");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.service_name.trim()) {
      toast.error("Please enter the service or appliance name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        diagnostic_fee: Number(formData.diagnostic_fee) || 79.00,
        base_labor_rate: Number(formData.base_labor_rate) || 120.00,
        emergency_fee: Number(formData.emergency_fee) || 49.00,
        parts_estimate_min: Number(formData.parts_estimate_min) || 0,
        parts_estimate_max: Number(formData.parts_estimate_max) || 0,
        warranty_months: Number(formData.warranty_months) || 3,
      };

      if (activeDrawer === "add") {
        await db.addPricing(payload);
        toast.success(`Pricing rule for "${payload.service_name}" created!`);
      } else if (activeDrawer === "edit" && selectedPrice) {
        await db.updatePricing(selectedPrice.id, payload);
        toast.success(`Pricing rule updated!`);
      }

      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save pricing rule to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!priceToDelete) return;
    setIsDeleting(true);
    try {
      await db.deletePricing(priceToDelete.id);
      toast.success("Pricing record deleted.");
      setPriceToDelete(null);
      await loadData();
    } catch (e) {
      toast.error("Failed to delete pricing record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "service_name",
      header: "Service & Category",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.service_name}</p>
          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {row.category}
          </span>
        </div>
      ),
    },
    {
      key: "diagnostic_fee",
      header: "Diagnostic Fee",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#16264a] text-xs sm:text-sm">
          {formatCurrency(row.diagnostic_fee)}
        </span>
      ),
    },
    {
      key: "base_labor_rate",
      header: "Base Labor Rate",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {formatCurrency(row.base_labor_rate)}/hr
        </span>
      ),
    },
    {
      key: "emergency_fee",
      header: "Emergency Surcharge",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-rose-600">
          +{formatCurrency(row.emergency_fee)}
        </span>
      ),
    },
    {
      key: "parts_estimate",
      header: "Parts Est Range",
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {formatCurrency(row.parts_estimate_min)} – {formatCurrency(row.parts_estimate_max)}
        </span>
      ),
    },
    {
      key: "warranty_months",
      header: "Warranty",
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="h-3 w-3" />
          {row.warranty_months * 30}-Day Guarantee
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Pricing & Service Charges</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent $79 diagnostic fees, hourly labor scales, emergency priority surcharges, and warranty guidelines
          </p>
        </div>
      </div>

      {/* Info Callout Banner matching website style */}
      <div className="p-4 rounded-xl border border-blue-200 bg-[#f1f5fb] text-xs text-slate-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#223f6b] text-white shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-[#16264a] text-sm">
              Standard $79 Precision Diagnostic Inspection Policy
            </p>
            <p className="text-slate-500 mt-0.5">
              Includes comprehensive 32-point electrical and mechanical diagnostic. 100% applied toward parts and labor upon quote approval.
            </p>
          </div>
        </div>
        <Badge variant="success" className="font-bold shrink-0">
          Apex Price Protection
        </Badge>
      </div>

      {/* Main Table */}
      <DataTable
        data={pricing}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading diagnostic rates and pricing rules..."
        searchPlaceholder="Search pricing rule, appliance..."
        searchKey={(item, q) => {
          const matchName = (item.service_name || "").toLowerCase().includes(q);
          const matchCat = (item.category || "").toLowerCase().includes(q);
          return matchName || matchCat;
        }}
        onAdd={handleOpenAdd}
        addLabel="Add Pricing Rule"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setPriceToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Pricing */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer === "add" ? "Create Pricing Policy" : `Edit Pricing: ${selectedPrice?.service_name || ""}`}
        description="Configure diagnostic inspection fee, hourly labor, and emergency rates"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Save Pricing Rule" : "Update Rule"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Service / Appliance Name *</Label>
            <Input
              placeholder="e.g. Refrigerators, Wine Coolers..."
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(val) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Refrigeration">Refrigeration</SelectItem>
                <SelectItem value="Laundry Care">Laundry Care</SelectItem>
                <SelectItem value="Kitchen Cleaning">Kitchen Cleaning</SelectItem>
                <SelectItem value="Cooking Appliances">Cooking Appliances</SelectItem>
                <SelectItem value="Specialty Appliances">Specialty Appliances</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Diagnostic Fee ($)</Label>
              <Input
                type="number"
                value={formData.diagnostic_fee}
                onChange={(e) => setFormData({ ...formData, diagnostic_fee: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Base Labor Rate ($/hr)</Label>
              <Input
                type="number"
                value={formData.base_labor_rate}
                onChange={(e) => setFormData({ ...formData, base_labor_rate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Emergency Same-Day Surcharge ($)</Label>
              <Input
                type="number"
                value={formData.emergency_fee}
                onChange={(e) => setFormData({ ...formData, emergency_fee: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Warranty Period (Months)</Label>
              <Input
                type="number"
                value={formData.warranty_months}
                onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Parts Estimate Min ($)</Label>
              <Input
                type="number"
                value={formData.parts_estimate_min}
                onChange={(e) => setFormData({ ...formData, parts_estimate_min: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Parts Estimate Max ($)</Label>
              <Input
                type="number"
                value={formData.parts_estimate_max}
                onChange={(e) => setFormData({ ...formData, parts_estimate_max: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Pricing Details */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={selectedPrice?.service_name || "Pricing Details"}
        description={`Category: ${selectedPrice?.category || ""}`}
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
              onClick={() => handleOpenEdit(selectedPrice)}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Pricing
            </Button>
          </div>
        }
      >
        {selectedPrice && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Diagnostic Inspection:</span>
                <span className="font-bold text-[#16264a]">{formatCurrency(selectedPrice.diagnostic_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Master Labor:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(selectedPrice.base_labor_rate)}/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Priority Dispatch:</span>
                <span className="font-semibold text-rose-600">+{formatCurrency(selectedPrice.emergency_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated OEM Parts Range:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedPrice.parts_estimate_min)} – {formatCurrency(selectedPrice.parts_estimate_max)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-400">Guaranteed Warranty:</span>
                <span className="font-bold text-emerald-700">{selectedPrice.warranty_months * 30}-Day Parts & Labor Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(priceToDelete)}
        onClose={() => setPriceToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete Pricing Rule "${priceToDelete?.service_name || ""}"?`}
        description="Are you sure you want to delete this pricing schedule? This removes the record from Supabase."
      />
    </div>
  );
}


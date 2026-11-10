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
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer State
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'edit' | 'view'
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "fixed",
    discount_value: 25.00,
    min_spend: 79.00,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 86400000 * 60).toISOString().split("T")[0],
    usage_limit: 500,
    is_active: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await db.getPromotions();
      setPromotions(list || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load promotions from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      discount_type: "fixed",
      discount_value: 20.00,
      min_spend: 79.00,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 86400000 * 60).toISOString().split("T")[0],
      usage_limit: 300,
      is_active: true,
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (promo) => {
    setSelectedPromo(promo);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (promo) => {
    setSelectedPromo(promo);
    setFormData({
      code: promo.code || "",
      title: promo.title || "",
      description: promo.description || "",
      discount_type: promo.discount_type || "fixed",
      discount_value: promo.discount_value || 25,
      min_spend: promo.min_spend || 0,
      start_date: promo.start_date || "",
      end_date: promo.end_date || "",
      usage_limit: promo.usage_limit || 500,
      is_active: promo.is_active ?? true,
    });
    setActiveDrawer("edit");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) {
      toast.error("Please provide both promotion code and title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discount_value: Number(formData.discount_value) || 0,
        min_spend: Number(formData.min_spend) || 0,
        usage_limit: Number(formData.usage_limit) || 100,
      };

      if (activeDrawer === "add") {
        await db.addPromotion(payload);
        toast.success(`Promo code "${payload.code}" created!`);
      } else if (activeDrawer === "edit" && selectedPromo) {
        await db.updatePromotion(selectedPromo.id, payload);
        toast.success(`Promo code "${payload.code}" updated!`);
      }

      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      toast.error("Failed to save promotion to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;
    setIsDeleting(true);
    try {
      await db.deletePromotion(promoToDelete.id);
      toast.success(`Promo code "${promoToDelete.code}" deleted.`);
      setPromoToDelete(null);
      await loadData();
    } catch (e) {
      toast.error("Failed to delete promotion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Promo Code",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs bg-slate-100 text-[#16264a] px-2.5 py-1 rounded-md border border-slate-200">
            {row.code}
          </span>
          {row.is_active ? (
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-300" title="Inactive" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Campaign Title",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.title}</p>
          <p className="text-[11px] text-slate-400">{row.description}</p>
        </div>
      ),
    },
    {
      key: "discount_value",
      header: "Discount Value",
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-700 text-xs sm:text-sm">
          {row.discount_type === "percentage"
            ? `${row.discount_value}% OFF`
            : `${formatCurrency(row.discount_value)} OFF`}
        </span>
      ),
    },
    {
      key: "min_spend",
      header: "Min Spend",
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.min_spend > 0 ? formatCurrency(row.min_spend) : "None"}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Validity Period",
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDate(row.start_date)} – {formatDate(row.end_date)}
        </span>
      ),
    },
    {
      key: "times_used",
      header: "Redemptions",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.times_used || 0} / {row.usage_limit || "∞"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Offers & Promotions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discount coupons, spring promotional savings, and customer retention campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-white">
            {promotions.length} Active Campaigns
          </Badge>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={promotions}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading promotional campaigns & discount vouchers..."
        searchPlaceholder="Search promo code, campaign title..."
        searchKey={(item, q) => {
          const matchCode = (item.code || "").toLowerCase().includes(q);
          const matchTitle = (item.title || "").toLowerCase().includes(q);
          return matchCode || matchTitle;
        }}
        onAdd={handleOpenAdd}
        addLabel="New Promotion"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setPromoToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Promotion */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer === "add" ? "Create Promo Campaign" : `Edit Promo: ${selectedPromo?.code || ""}`}
        description="Configure discount percentages, minimum spend threshold, and expiry"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Launch Campaign" : "Save Changes"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Promo Code *</Label>
              <Input
                placeholder="e.g. APEX20, SPRING25"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 font-mono uppercase font-bold"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Discount Type</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(val) => setFormData({ ...formData, discount_type: val })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Discount Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Dollar Off ($)</SelectItem>
                  <SelectItem value="percentage">Percentage Off (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Campaign Title *</Label>
            <Input
              placeholder="e.g. $25 Off Precision Diagnostic"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Description</Label>
            <Input
              placeholder="Terms and details for customers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">
                {formData.discount_type === "percentage" ? "Discount Value (%)" : "Discount Value ($)"}
              </Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Minimum Spend ($)</Label>
              <Input
                type="number"
                value={formData.min_spend}
                onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">End Date (Expiry)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Max Usage Redemptions</Label>
            <Input
              type="number"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
              className="mt-1"
            />
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Promo Details */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={`Promo: ${selectedPromo?.code || ""}`}
        description={selectedPromo?.title || "Campaign Details"}
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
              onClick={() => handleOpenEdit(selectedPromo)}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Promotion
            </Button>
          </div>
        }
      >
        {selectedPromo && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Coupon Code:</span>
                <span className="font-mono font-bold text-[#16264a] text-sm">{selectedPromo.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Discount Offered:</span>
                <span className="font-bold text-emerald-700">
                  {selectedPromo.discount_type === "percentage"
                    ? `${selectedPromo.discount_value}% OFF`
                    : `${formatCurrency(selectedPromo.discount_value)} OFF`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Min Qualifying Spend:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(selectedPromo.min_spend)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campaign Timeline:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedPromo.start_date)} to {formatDate(selectedPromo.end_date)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-400">Redemptions:</span>
                <span className="font-bold text-blue-700">
                  {selectedPromo.times_used || 0} of {selectedPromo.usage_limit} used
                </span>
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(promoToDelete)}
        onClose={() => setPromoToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete Promo Code "${promoToDelete?.code || ""}"?`}
        description="Are you sure you want to deactivate and remove this promotional coupon?"
      />
    </div>
  );
}


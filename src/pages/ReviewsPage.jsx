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
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Star,
  CheckCircle2,
  MessageSquare,
  User,
  Wrench,
  ShieldCheck,
  Edit2,
  Trash2,
} from "lucide-react";

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer State
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'view' | 'edit'
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    appliance_name: "Refrigerator & Freezer",
    rating: 5,
    comment: "",
    technician_name: "Marcus Vance",
    is_published: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await db.getReviews();
      setReviews(list || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load customer reviews from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      appliance_name: "Refrigerators",
      rating: 5,
      comment: "",
      technician_name: "Marcus Vance",
      is_published: true,
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (review) => {
    setSelectedReview(review);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (review) => {
    setSelectedReview(review);
    setFormData({
      customer_name: review.customer_name || "",
      customer_email: review.customer_email || "",
      appliance_name: review.appliance_name || "",
      rating: review.rating || 5,
      comment: review.comment || "",
      technician_name: review.technician_name || "",
      is_published: review.is_published ?? true,
    });
    setActiveDrawer("edit");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.customer_name.trim() || !formData.comment.trim()) {
      toast.error("Please provide both customer name and review comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating) || 5,
      };

      if (activeDrawer === "add") {
        await db.addReview(payload);
        toast.success("Review published successfully!");
      } else if (activeDrawer === "edit" && selectedReview) {
        await db.updateReview(selectedReview.id, payload);
        toast.success("Review updated!");
      }

      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      toast.error("Failed to save review to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (review) => {
    try {
      const nextState = !review.is_published;
      await db.updateReview(review.id, { is_published: nextState });
      toast.success(nextState ? "Review is now visible to customers." : "Review hidden from public site.");
      await loadData();
    } catch (e) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteReview(reviewToDelete.id);
      toast.success("Review deleted.");
      setReviewToDelete(null);
      await loadData();
    } catch (e) {
      toast.error("Failed to delete review.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "customer_name",
      header: "Customer",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.customer_name}</p>
          <p className="text-[11px] text-slate-400">{row.customer_email}</p>
        </div>
      ),
    },
    {
      key: "appliance_name",
      header: "Appliance",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-700 text-xs">
          {row.appliance_name}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < row.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      key: "comment",
      header: "Customer Feedback",
      render: (row) => (
        <p className="text-xs text-slate-600 italic line-clamp-2 max-w-sm">
          "{row.comment}"
        </p>
      ),
    },
    {
      key: "technician_name",
      header: "Serviced By",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.technician_name || "Marcus Vance"}
        </span>
      ),
    },
    {
      key: "is_published",
      header: "Visibility",
      render: (row) => (
        <Switch
          checked={row.is_published}
          onCheckedChange={() => handleTogglePublish(row)}
          title="Toggle public visibility on customer site"
        />
      ),
    },
    {
      key: "review_date",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDate(row.review_date || row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Customer Reviews & Feedback</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings, customer satisfaction comments, and technician performance reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-white">
            ⭐ 4.96 Average Customer Score
          </Badge>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={reviews}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading customer reviews & satisfaction ratings..."
        searchPlaceholder="Search customer, appliance, feedback text..."
        searchKey={(item, q) => {
          const matchName = (item.customer_name || "").toLowerCase().includes(q);
          const matchApp = (item.appliance_name || "").toLowerCase().includes(q);
          const matchCom = (item.comment || "").toLowerCase().includes(q);
          return matchName || matchApp || matchCom;
        }}
        onAdd={handleOpenAdd}
        addLabel="Add Testimonial"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setReviewToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Review */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer === "add" ? "Add Customer Testimonial" : "Edit Customer Review"}
        description="Verified customer feedback and rating score"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Save Review" : "Update Review"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Customer Full Name *</Label>
            <Input
              placeholder="e.g. Amanda Miller"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Customer Email</Label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Star Rating (1-5)</Label>
              <Select
                value={String(formData.rating)}
                onValueChange={(val) => setFormData({ ...formData, rating: Number(val) })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Stars)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4 Stars)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3 Stars)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2 Stars)</SelectItem>
                  <SelectItem value="1">⭐ (1 Star)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Appliance Repaired</Label>
              <Input
                placeholder="e.g. Washing Machines, Refrigerators..."
                value={formData.appliance_name}
                onChange={(e) => setFormData({ ...formData, appliance_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Technician Name</Label>
              <Input
                placeholder="e.g. Marcus Vance, Elena Rostova..."
                value={formData.technician_name}
                onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Customer Feedback Comment *</Label>
            <textarea
              rows={4}
              placeholder="Quote or detailed feedback from customer..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#223f6b] outline-none"
              required
            />
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Review */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title="Customer Review Details"
        description={`Reviewed: ${selectedReview?.appliance_name || ""}`}
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
              onClick={() => handleOpenEdit(selectedReview)}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Review
            </Button>
          </div>
        }
      >
        {selectedReview && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < selectedReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <Badge variant={selectedReview.is_published ? "success" : "outline"}>
                  {selectedReview.is_published ? "Published Online" : "Hidden"}
                </Badge>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed italic">
                "{selectedReview.comment}"
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400">Customer:</span>{" "}
                  <strong>{selectedReview.customer_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Technician:</span>{" "}
                  <strong>{selectedReview.technician_name}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Customer Review?"
        description="Are you sure you want to delete this customer testimonial from Supabase?"
      />
    </div>
  );
}


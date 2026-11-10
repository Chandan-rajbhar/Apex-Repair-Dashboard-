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
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  DollarSign,
  Shield,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawers and Dialogs
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'edit' | 'view' | null
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Springfield",
    state: "IL",
    zip_code: "62704",
    status: "active",
    notes: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await db.getCustomers();
      setCustomers(list || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load customers from Supabase.");
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
      phone: "",
      address: "",
      city: "Springfield",
      state: "IL",
      zip_code: "62704",
      status: "active",
      notes: "",
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (customer) => {
    setSelectedCustomer(customer);
    setActiveDrawer("view");
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "Springfield",
      state: customer.state || "IL",
      zip_code: customer.zip_code || "62704",
      status: customer.status || "active",
      notes: customer.notes || "",
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
      if (activeDrawer === "add") {
        await db.addCustomer(formData);
        toast.success(`Customer ${formData.name} added successfully!`);
      } else if (activeDrawer === "edit" && selectedCustomer) {
        await db.updateCustomer(selectedCustomer.id, formData);
        toast.success(`Customer ${formData.name} updated!`);
      }
      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Error saving customer to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteCustomer(customerToDelete.id);
      toast.success(`Customer ${customerToDelete.name} deleted.`);
      setCustomerToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete customer.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Customer Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#16264a] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs sm:text-sm">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">{row.phone}</span>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (row) => (
        <div className="text-xs text-slate-600 max-w-xs truncate">
          <p className="truncate">{row.address}</p>
          <p className="text-[10px] text-slate-400">{row.city}, {row.state} {row.zip_code}</p>
        </div>
      ),
    },
    {
      key: "total_bookings",
      header: "Bookings",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.total_bookings || 0} visits
        </span>
      ),
    },
    {
      key: "lifetime_spend",
      header: "Lifetime Spend",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#16264a] text-xs sm:text-sm">
          {formatCurrency(row.lifetime_spend || 0)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Badge
          variant={row.status === "vip" ? "purple" : row.status === "active" ? "success" : "outline"}
          className="text-[10px] font-bold uppercase tracking-wider"
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  const filterOptions = [
    { label: "Active Clients", value: "active" },
    { label: "VIP Tier", value: "vip" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">Customer Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered homeowners, property managers, and warranty accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 bg-white">
            {customers.length} Accounts
          </Badge>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading customer profiles & history from Supabase..."
        searchPlaceholder="Search customer name, email, phone, address..."
        searchKey={(item, q) => {
          const matchName = (item.name || "").toLowerCase().includes(q);
          const matchEmail = (item.email || "").toLowerCase().includes(q);
          const matchPhone = (item.phone || "").toLowerCase().includes(q);
          const matchAddr = (item.address || "").toLowerCase().includes(q);
          return matchName || matchEmail || matchPhone || matchAddr;
        }}
        filterOptions={filterOptions}
        onAdd={handleOpenAdd}
        addLabel="Add Customer"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(item) => setCustomerToDelete(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Add or Edit Customer */}
      <DrawerSheet
        isOpen={activeDrawer === "add" || activeDrawer === "edit"}
        onClose={() => setActiveDrawer(null)}
        title={activeDrawer === "add" ? "Create Customer Profile" : `Edit Customer: ${selectedCustomer?.name || ""}`}
        description="Customer contact coordinates, preferred service notes, and account tier"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={activeDrawer === "add" ? "Save Customer" : "Update Profile"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Customer Full Name *</Label>
            <Input
              placeholder="e.g. Saurabh Yadav"
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
                placeholder="(877) 225-2046"
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
                placeholder="demo@apex.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Street Address *</Label>
            <Input
              placeholder="742 Evergreen Terr, Suite 4B"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">State</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Zip Code</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Account Status Tier</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active Standard</SelectItem>
                <SelectItem value="vip">VIP Preferred Customer</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold">Special Instructions & Service Notes</Label>
            <textarea
              rows={3}
              placeholder="e.g. Gate code, preferred technician, high-end appliance suites..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#223f6b] outline-none"
            />
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Customer Details */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={selectedCustomer?.name || "Customer Profile"}
        description={`Customer ID: ${selectedCustomer?.id || ""}`}
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
              onClick={() => handleOpenEdit(selectedCustomer)}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Customer
            </Button>
          </div>
        }
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Top Stat Strip */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-slate-400 text-[11px] uppercase tracking-wider">Total Bookings</p>
                <p className="text-xl font-bold text-[#16264a] mt-0.5">
                  {selectedCustomer.total_bookings || 0}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] uppercase tracking-wider">Lifetime Spend</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  {formatCurrency(selectedCustomer.lifetime_spend || 0)}
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                Contact & Address
              </h4>
              <div className="flex items-center gap-2 text-slate-800">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{selectedCustomer.name}</span>
                <Badge variant={selectedCustomer.status === "vip" ? "purple" : "outline"} className="text-[10px] ml-auto">
                  {selectedCustomer.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zip_code}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedCustomer.notes && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                  Service Preferences & Notes
                </h4>
                <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 italic border border-slate-100">
                  "{selectedCustomer.notes}"
                </p>
              </div>
            )}
          </div>
        )}
      </DrawerSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete Customer ${customerToDelete?.name || ""}?`}
        description="Are you sure you want to delete this customer record? All linked bookings and profile data will be affected."
      />
    </div>
  );
}


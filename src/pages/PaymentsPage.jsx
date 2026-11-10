import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/common/DataTable";
import { DrawerSheet } from "@/components/common/DrawerSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
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
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Receipt,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  RotateCcw,
  User,
  ShieldCheck,
} from "lucide-react";

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer state
  const [activeDrawer, setActiveDrawer] = useState(null); // 'add' | 'view'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentToRefund, setPaymentToRefund] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  // Add Payment Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    amount: 224.00,
    payment_method: "Credit Card",
    status: "paid",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await db.getPayments();
      setPayments(list || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load payment records from Supabase.");
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
      amount: 79.00,
      payment_method: "Credit Card",
      status: "paid",
    });
    setActiveDrawer("add");
  };

  const handleOpenView = (payment) => {
    setSelectedPayment(payment);
    setActiveDrawer("view");
  };

  const handleSubmitPayment = async (e) => {
    if (e) e.preventDefault();
    if (!formData.customer_name.trim() || !formData.amount) {
      toast.error("Please provide customer name and amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.addPayment({
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success("Payment recorded successfully!");
      setActiveDrawer(null);
      await loadData();
    } catch (err) {
      toast.error("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefundConfirm = async () => {
    if (!paymentToRefund) return;
    setIsRefunding(true);
    try {
      await db.updatePayment(paymentToRefund.id, { status: "refunded" });
      toast.success(`Invoice ${paymentToRefund.invoice_number} refunded.`);
      setPaymentToRefund(null);
      await loadData();
    } catch (e) {
      toast.error("Failed to process refund.");
    } finally {
      setIsRefunding(false);
    }
  };

  const columns = [
    {
      key: "invoice_number",
      header: "Invoice #",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#223f6b] text-xs sm:text-sm">
          {row.invoice_number}
        </span>
      ),
    },
    {
      key: "transaction_id",
      header: "Transaction ID",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500">
          {row.transaction_id || "TXN-AUTO"}
        </span>
      ),
    },
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
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#16264a] text-xs sm:text-sm">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
          <span>{row.payment_method}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="payment" />,
    },
    {
      key: "paid_at",
      header: "Date Paid",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDateTime(row.paid_at || row.created_at)}
        </span>
      ),
    },
  ];

  const filterOptions = [
    { label: "Paid Invoices", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Refunded", value: "refunded" },
  ];

  const totalCleared = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16264a]">
            Payments & Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic fees, approved repair invoices, digital receipts, and warranty payment certificates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            Total Revenue Cleared: {formatCurrency(totalCleared)}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading invoices & payment transaction ledger..."
        searchPlaceholder="Search invoice #, customer name, transaction ID..."
        searchKey={(item, q) => {
          const matchInv = (item.invoice_number || "").toLowerCase().includes(q);
          const matchTxn = (item.transaction_id || "").toLowerCase().includes(q);
          const matchName = (item.customer_name || "").toLowerCase().includes(q);
          return matchInv || matchTxn || matchName;
        }}
        filterOptions={filterOptions}
        onAdd={handleOpenAdd}
        addLabel="Record Payment"
        onView={handleOpenView}
        onDelete={(item) => setPaymentToRefund(item)}
        onRefresh={loadData}
      />

      {/* Right Drawer: Record New Payment */}
      <DrawerSheet
        isOpen={activeDrawer === "add"}
        onClose={() => setActiveDrawer(null)}
        title="Record Payment / Invoice"
        description="Log received customer payment for diagnostic or completed repair"
        onSubmit={handleSubmitPayment}
        isSubmitting={isSubmitting}
        submitLabel="Record Payment"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Customer Name *</Label>
            <Input
              placeholder="e.g. Amanda Miller"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Payment Amount ($) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(val) => setFormData({ ...formData, payment_method: val })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Financing">Financing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </DrawerSheet>

      {/* Right Drawer: View Receipt */}
      <DrawerSheet
        isOpen={activeDrawer === "view"}
        onClose={() => setActiveDrawer(null)}
        title={`Receipt: ${selectedPayment?.invoice_number || ""}`}
        description="Official Apex Appliance Repair payment clearance receipt"
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
              onClick={() => {
                window.print();
              }}
              className="bg-[#223f6b] hover:bg-[#16264a] text-white text-xs gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </Button>
          </div>
        }
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Printable Receipt Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#1E7B5A] flex items-center justify-center text-white font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#16264a]">APEX APPLIANCE REPAIR</h3>
                    <p className="text-[10px] text-slate-400">Precision Diagnostics & Repair</p>
                  </div>
                </div>
                <Badge variant="success" className="font-bold">
                  PAID IN FULL
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">Billed To:</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedPayment.customer_name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedPayment.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[11px]">Invoice Details:</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedPayment.invoice_number}</p>
                  <p className="text-slate-400 text-[11px] font-mono">{selectedPayment.transaction_id}</p>
                </div>
              </div>

              {/* Itemized Line Items */}
              <div className="py-2 border-t border-b border-slate-100 space-y-2">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Authorized Appliance Service & OEM Restoration</span>
                  <span className="font-mono">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Payment Method: {selectedPayment.payment_method}</span>
                  <span>Cleared: {formatDateTime(selectedPayment.paid_at || selectedPayment.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-base font-bold text-[#16264a]">
                <span>Total Cleared:</span>
                <span className="font-mono text-lg text-emerald-700">{formatCurrency(selectedPayment.amount)}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed text-center">
                This receipt validates your active <strong>90-Day Parts & Labor Warranty</strong>. For warranty claims or follow-up service, call <strong>(877) 225-2046</strong>.
              </div>
            </div>
          </div>
        )}
      </DrawerSheet>

      {/* Refund Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(paymentToRefund)}
        onClose={() => setPaymentToRefund(null)}
        onConfirm={handleRefundConfirm}
        isLoading={isRefunding}
        isDestructive={true}
        title={`Process Refund for Invoice ${paymentToRefund?.invoice_number || ""}?`}
        description={`Are you sure you want to refund ${formatCurrency(paymentToRefund?.amount || 0)} back to ${paymentToRefund?.customer_name}?`}
        confirmLabel="Process Refund"
      />
    </div>
  );
}


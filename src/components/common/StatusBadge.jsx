import React from "react";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STEPS } from "@/lib/mockData";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Wrench,
  ShieldCheck,
  CreditCard,
  UserCheck,
} from "lucide-react";

export function StatusBadge({ status, step, type = "step" }) {
  if (type === "emergency") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        EMERGENCY
      </span>
    );
  }

  if (type === "payment") {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </Badge>
        );
      case "unpaid":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Unpaid
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="destructive" className="gap-1">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Pending"}</Badge>;
    }
  }

  if (type === "technician_status") {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case "on_job":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            On Job
          </span>
        );
      case "off_duty":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Off Duty
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  // Booking step representation (1-9)
  const currentStep = step || BOOKING_STEPS.find((s) => s.key === status)?.id || 1;
  const stepInfo = BOOKING_STEPS.find((s) => s.id === currentStep) || BOOKING_STEPS[0];

  const getStepIcon = (id) => {
    switch (id) {
      case 1:
      case 2:
        return <Clock className="w-3 h-3" />;
      case 3:
        return <UserCheck className="w-3 h-3" />;
      case 4:
        return <Truck className="w-3 h-3" />;
      case 5:
      case 7:
        return <Wrench className="w-3 h-3" />;
      case 6:
        return <AlertCircle className="w-3 h-3" />;
      case 8:
      case 9:
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${stepInfo.color}`}
    >
      {getStepIcon(stepInfo.id)}
      <span>
        Step {stepInfo.id}: {stepInfo.shortTitle}
      </span>
    </span>
  );
}


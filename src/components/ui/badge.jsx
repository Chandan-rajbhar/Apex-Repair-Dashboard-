import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#16264a] text-white hover:bg-[#0e1a36]",
        secondary:
          "border-transparent bg-[#e6edf8] text-[#16264a] hover:bg-[#c2d5e8]",
        destructive:
          "border-transparent bg-red-100 text-red-700 border border-red-200",
        outline: "text-slate-700 border border-slate-200",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
        warning:
          "border-transparent bg-amber-50 text-amber-800 border border-amber-200 font-medium",
        info:
          "border-transparent bg-sky-50 text-sky-800 border border-sky-200 font-medium",
        purple:
          "border-transparent bg-purple-50 text-purple-700 border border-purple-200 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };


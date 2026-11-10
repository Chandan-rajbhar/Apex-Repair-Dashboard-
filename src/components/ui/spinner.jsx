import React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shadcn UI Spinner component (npx shadcn@latest add spinner)
 */
function Spinner({
  className,
  size = "default",
  ...props
}) {
  const sizeMap = {
    sm: "size-4",
    default: "size-5",
    md: "size-6",
    lg: "size-8",
    xl: "size-10",
  };

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin text-[#223f6b]",
        sizeMap[size] || sizeMap.default,
        className
      )}
      {...props}
    />
  );
}

/**
 * Standardized module table / card loading container with Shadcn Spinner
 */
function SpinnerCustom({
  className,
  children,
  text = "Loading live records from Supabase...",
  size = "md",
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 py-8 text-slate-500",
        className
      )}
      {...props}
    >
      <Spinner size={size} className="text-[#223f6b]" />
      {children || (
        text && (
          <span className="text-xs sm:text-sm font-medium text-slate-600 animate-pulse">
            {text}
          </span>
        )
      )}
    </div>
  );
}

export { Spinner, SpinnerCustom };
export default Spinner;

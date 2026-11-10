import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = "vs last month",
  icon: Icon,
  iconColor = "text-[#223f6b]",
  iconBg = "bg-[#e6edf8]",
  onClick,
}) {
  const isPositive = trend && !trend.startsWith("-");

  return (
    <Card
      onClick={onClick}
      className={`border border-slate-200/80 bg-white transition-all hover:shadow-md hover:border-slate-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {title}
            </p>
            <h4 className="text-2xl font-bold tracking-tight text-[#16264a]">
              {value}
            </h4>
          </div>
          {Icon && (
            <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {(trend || subtitle) && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-50">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {subtitle || trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


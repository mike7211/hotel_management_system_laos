import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, className, iconBgColor = "bg-blue-50", iconColor = "text-blue-600" }) {
  return (
    <Card className={cn("p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center text-xs font-medium",
              trend === 'up' ? "text-emerald-600" : "text-rose-600"
            )}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </Card>
  );
}
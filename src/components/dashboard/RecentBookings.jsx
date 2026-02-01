import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusMap = {
  pending: { label: "待入住", color: "bg-amber-100 text-amber-700" },
  checked_in: { label: "已入住", color: "bg-emerald-100 text-emerald-700" },
  checked_out: { label: "已退房", color: "bg-slate-100 text-slate-700" },
  cancelled: { label: "已取消", color: "bg-rose-100 text-rose-700" }
};

export default function RecentBookings({ bookings }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">最近预订</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">暂无预订记录</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{booking.guest_name}</p>
                <p className="text-sm text-slate-500">房间 {booking.room_number}</p>
              </div>
              <div className="text-right space-y-1">
                <Badge className={statusMap[booking.status]?.color || statusMap.pending.color}>
                  {statusMap[booking.status]?.label || "待入住"}
                </Badge>
                <p className="text-xs text-slate-500">
                  {booking.check_in_date && format(new Date(booking.check_in_date), 'MM/dd')} - {booking.check_out_date && format(new Date(booking.check_out_date), 'MM/dd')}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
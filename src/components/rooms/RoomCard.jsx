import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const roomTypeMap = {
  standard: "标准间",
  deluxe: "豪华间",
  suite: "套房",
  presidential: "总统套房"
};

const statusMap = {
  available: { label: "空闲", color: "bg-emerald-100 text-emerald-700" },
  occupied: { label: "入住中", color: "bg-blue-100 text-blue-700" },
  maintenance: { label: "维护中", color: "bg-amber-100 text-amber-700" },
  reserved: { label: "已预订", color: "bg-purple-100 text-purple-700" }
};

export default function RoomCard({ room, onEdit, onDelete }) {
  return (
    <Card className="group p-5 border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl",
            room.status === 'available' ? "bg-emerald-50" : 
            room.status === 'occupied' ? "bg-blue-50" : "bg-slate-50"
          )}>
            <BedDouble className={cn(
              "w-5 h-5",
              room.status === 'available' ? "text-emerald-600" : 
              room.status === 'occupied' ? "text-blue-600" : "text-slate-600"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{room.room_number}</h3>
            <p className="text-sm text-slate-500">{roomTypeMap[room.room_type] || room.room_type}</p>
          </div>
        </div>
        <Badge className={statusMap[room.status]?.color || statusMap.available.color}>
          {statusMap[room.status]?.label || "空闲"}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">楼层</span>
          <span className="font-medium text-slate-900">{room.floor || '-'}层</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">价格</span>
          <span className="font-medium text-slate-900">¥{room.price_per_night}/晚</span>
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(room)}>
          <Edit2 className="w-4 h-4 mr-1" /> 编辑
        </Button>
        <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" onClick={() => onDelete(room)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Edit2, Trash2, Ticket } from "lucide-react";

export default function ScenicSpotCard({ spot, onEdit, onDelete, onSellTicket }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
        {spot.image_url ? (
          <img src={spot.image_url} alt={spot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-blue-300" />
          </div>
        )}
        <Badge className={spot.is_active !== false ? "absolute top-3 right-3 bg-emerald-500" : "absolute top-3 right-3 bg-slate-400"}>
          {spot.is_active !== false ? "营业中" : "已关闭"}
        </Badge>
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-900">{spot.name}</h3>
          {spot.opening_hours && (
            <p className="text-sm text-slate-500 mt-1">{spot.opening_hours}</p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">成人票</p>
            <p className="font-semibold text-slate-900">¥{spot.adult_price || 0}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">儿童票</p>
            <p className="font-semibold text-slate-900">¥{spot.child_price || 0}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">老人票</p>
            <p className="font-semibold text-slate-900">¥{spot.senior_price || 0}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onSellTicket(spot)}
          >
            <Ticket className="w-4 h-4 mr-1" /> 售票
          </Button>
          <Button variant="outline" size="icon" onClick={() => onEdit(spot)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-rose-600 hover:text-rose-700" onClick={() => onDelete(spot)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
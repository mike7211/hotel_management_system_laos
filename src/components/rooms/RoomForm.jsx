import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RoomForm({ open, onClose, onSubmit, room }) {
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'standard',
    price_per_night: '',
    floor: '',
    status: 'available'
  });

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number || '',
        room_type: room.room_type || 'standard',
        price_per_night: room.price_per_night || '',
        floor: room.floor || '',
        status: room.status || 'available'
      });
    } else {
      setFormData({
        room_number: '',
        room_type: 'standard',
        price_per_night: '',
        floor: '',
        status: 'available'
      });
    }
  }, [room, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price_per_night: Number(formData.price_per_night),
      floor: Number(formData.floor)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? '编辑房间' : '添加房间'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>房间号</Label>
            <Input 
              value={formData.room_number}
              onChange={(e) => setFormData({...formData, room_number: e.target.value})}
              placeholder="如：101"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>房间类型</Label>
            <Select value={formData.room_type} onValueChange={(v) => setFormData({...formData, room_type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">标准间</SelectItem>
                <SelectItem value="deluxe">豪华间</SelectItem>
                <SelectItem value="suite">套房</SelectItem>
                <SelectItem value="presidential">总统套房</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>价格（每晚）</Label>
              <Input 
                type="number"
                value={formData.price_per_night}
                onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                placeholder="¥"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>楼层</Label>
              <Input 
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                placeholder="如：1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">空闲</SelectItem>
                <SelectItem value="occupied">入住中</SelectItem>
                <SelectItem value="maintenance">维护中</SelectItem>
                <SelectItem value="reserved">已预订</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800">
              {room ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
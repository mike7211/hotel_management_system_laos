import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { differenceInDays } from "date-fns";

export default function BookingForm({ open, onClose, onSubmit, booking, rooms }) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_phone: '',
    guest_id_number: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    status: 'pending',
    payment_status: 'unpaid',
    notes: ''
  });

  const availableRooms = rooms.filter(r => r.status === 'available' || (booking && r.id === booking.room_id));

  useEffect(() => {
    if (booking) {
      setFormData({
        guest_name: booking.guest_name || '',
        guest_phone: booking.guest_phone || '',
        guest_id_number: booking.guest_id_number || '',
        room_id: booking.room_id || '',
        check_in_date: booking.check_in_date || '',
        check_out_date: booking.check_out_date || '',
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'unpaid',
        notes: booking.notes || ''
      });
    } else {
      setFormData({
        guest_name: '',
        guest_phone: '',
        guest_id_number: '',
        room_id: '',
        check_in_date: '',
        check_out_date: '',
        status: 'pending',
        payment_status: 'unpaid',
        notes: ''
      });
    }
  }, [booking, open]);

  const calculateTotal = () => {
    if (!formData.room_id || !formData.check_in_date || !formData.check_out_date) return 0;
    const room = rooms.find(r => r.id === formData.room_id);
    if (!room) return 0;
    const days = differenceInDays(new Date(formData.check_out_date), new Date(formData.check_in_date));
    return days > 0 ? days * room.price_per_night : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === formData.room_id);
    onSubmit({
      ...formData,
      room_number: room?.room_number || '',
      total_amount: calculateTotal()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? '编辑预订' : '新建预订'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>客人姓名 *</Label>
              <Input 
                value={formData.guest_name}
                onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>联系电话 *</Label>
              <Input 
                value={formData.guest_phone}
                onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>身份证号</Label>
            <Input 
              value={formData.guest_id_number}
              onChange={(e) => setFormData({...formData, guest_id_number: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>选择房间 *</Label>
            <Select value={formData.room_id} onValueChange={(v) => setFormData({...formData, room_id: v})}>
              <SelectTrigger>
                <SelectValue placeholder="选择房间" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.room_number} - ¥{room.price_per_night}/晚
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>入住日期 *</Label>
              <Input 
                type="date"
                value={formData.check_in_date}
                onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>退房日期 *</Label>
              <Input 
                type="date"
                value={formData.check_out_date}
                onChange={(e) => setFormData({...formData, check_out_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>预订状态</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待入住</SelectItem>
                  <SelectItem value="checked_in">已入住</SelectItem>
                  <SelectItem value="checked_out">已退房</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>支付状态</Label>
              <Select value={formData.payment_status} onValueChange={(v) => setFormData({...formData, payment_status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">未支付</SelectItem>
                  <SelectItem value="partial">部分支付</SelectItem>
                  <SelectItem value="paid">已支付</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">预计总金额</span>
              <span className="text-xl font-bold text-slate-900">¥{calculateTotal()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800">
              {booking ? '保存' : '创建预订'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
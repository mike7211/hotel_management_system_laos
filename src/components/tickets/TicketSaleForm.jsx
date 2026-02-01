import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

export default function TicketSaleForm({ open, onClose, onSubmit, scenicSpot }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    adult_count: 0,
    child_count: 0,
    senior_count: 0,
    visit_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (open) {
      setFormData({
        customer_name: '',
        customer_phone: '',
        adult_count: 0,
        child_count: 0,
        senior_count: 0,
        visit_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [open]);

  const calculateTotal = () => {
    if (!scenicSpot) return 0;
    return (
      formData.adult_count * (scenicSpot.adult_price || 0) +
      formData.child_count * (scenicSpot.child_price || 0) +
      formData.senior_count * (scenicSpot.senior_price || 0)
    );
  };

  const handleCountChange = (type, delta) => {
    setFormData(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.adult_count + formData.child_count + formData.senior_count === 0) return;
    onSubmit({
      scenic_spot_id: scenicSpot.id,
      scenic_spot_name: scenicSpot.name,
      ...formData,
      total_amount: calculateTotal(),
      payment_status: 'paid'
    });
  };

  const CounterControl = ({ label, price, type, count }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">¥{price}/张</p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => handleCountChange(type, -1)}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-semibold">{count}</span>
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => handleCountChange(type, 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (!scenicSpot) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>售票 - {scenicSpot.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>客户姓名 *</Label>
              <Input 
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input 
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>游玩日期 *</Label>
            <Input 
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>选择票种</Label>
            <CounterControl 
              label="成人票" 
              price={scenicSpot.adult_price || 0} 
              type="adult_count"
              count={formData.adult_count}
            />
            {scenicSpot.child_price > 0 && (
              <CounterControl 
                label="儿童票" 
                price={scenicSpot.child_price} 
                type="child_count"
                count={formData.child_count}
              />
            )}
            {scenicSpot.senior_price > 0 && (
              <CounterControl 
                label="老人票" 
                price={scenicSpot.senior_price} 
                type="senior_count"
                count={formData.senior_count}
              />
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-600">共 {formData.adult_count + formData.child_count + formData.senior_count} 张</p>
                <p className="text-sm text-slate-500">应收金额</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">¥{calculateTotal()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={formData.adult_count + formData.child_count + formData.senior_count === 0}
            >
              确认售票
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
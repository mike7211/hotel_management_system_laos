import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function ScenicSpotForm({ open, onClose, onSubmit, spot }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adult_price: '',
    child_price: '',
    senior_price: '',
    opening_hours: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    if (spot) {
      setFormData({
        name: spot.name || '',
        description: spot.description || '',
        adult_price: spot.adult_price || '',
        child_price: spot.child_price || '',
        senior_price: spot.senior_price || '',
        opening_hours: spot.opening_hours || '',
        image_url: spot.image_url || '',
        is_active: spot.is_active !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        adult_price: '',
        child_price: '',
        senior_price: '',
        opening_hours: '',
        image_url: '',
        is_active: true
      });
    }
  }, [spot, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      adult_price: Number(formData.adult_price) || 0,
      child_price: Number(formData.child_price) || 0,
      senior_price: Number(formData.senior_price) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{spot ? '编辑景点' : '添加景点'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>景点名称 *</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>景点描述</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>成人票价 *</Label>
              <Input 
                type="number"
                value={formData.adult_price}
                onChange={(e) => setFormData({...formData, adult_price: e.target.value})}
                placeholder="¥"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>儿童票价</Label>
              <Input 
                type="number"
                value={formData.child_price}
                onChange={(e) => setFormData({...formData, child_price: e.target.value})}
                placeholder="¥"
              />
            </div>
            <div className="space-y-2">
              <Label>老人票价</Label>
              <Input 
                type="number"
                value={formData.senior_price}
                onChange={(e) => setFormData({...formData, senior_price: e.target.value})}
                placeholder="¥"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>营业时间</Label>
            <Input 
              value={formData.opening_hours}
              onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
              placeholder="如：09:00 - 18:00"
            />
          </div>

          <div className="space-y-2">
            <Label>图片链接</Label>
            <Input 
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>启用状态</Label>
            <Switch 
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800">
              {spot ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
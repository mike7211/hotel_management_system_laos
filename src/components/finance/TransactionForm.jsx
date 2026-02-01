import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryMap = {
  income: [
    { value: 'room_booking', label: '客房收入' },
    { value: 'ticket_sale', label: '门票收入' },
    { value: 'food_beverage', label: '餐饮收入' },
    { value: 'spa_service', label: '服务收入' },
    { value: 'other', label: '其他收入' }
  ],
  expense: [
    { value: 'salary', label: '员工工资' },
    { value: 'utilities', label: '水电费用' },
    { value: 'maintenance', label: '维护费用' },
    { value: 'supplies', label: '物资采购' },
    { value: 'marketing', label: '营销费用' },
    { value: 'other', label: '其他支出' }
  ]
};

export default function TransactionForm({ open, onClose, onSubmit, transaction }) {
  const [formData, setFormData] = useState({
    type: 'income',
    category: 'room_booking',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash'
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'income',
        category: transaction.category || 'room_booking',
        amount: transaction.amount || '',
        description: transaction.description || '',
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        payment_method: transaction.payment_method || 'cash'
      });
    } else {
      setFormData({
        type: 'income',
        category: 'room_booking',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
      });
    }
  }, [transaction, open]);

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category: categoryMap[type][0].value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? '编辑交易' : '新增交易'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={formData.type} onValueChange={handleTypeChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                收入
              </TabsTrigger>
              <TabsTrigger value="expense" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700">
                支出
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>分类 *</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryMap[formData.type].map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>金额 *</Label>
            <Input 
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="¥"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>交易日期 *</Label>
              <Input 
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>支付方式</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">现金</SelectItem>
                  <SelectItem value="wechat">微信</SelectItem>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="card">银行卡</SelectItem>
                  <SelectItem value="bank_transfer">银行转账</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800">
              {transaction ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
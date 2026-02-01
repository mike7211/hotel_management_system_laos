import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp, TrendingDown, Wallet, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TransactionForm from '../components/finance/TransactionForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const categoryLabels = {
  room_booking: '客房收入',
  ticket_sale: '门票收入',
  food_beverage: '餐饮收入',
  spa_service: '服务收入',
  salary: '员工工资',
  utilities: '水电费用',
  maintenance: '维护费用',
  supplies: '物资采购',
  marketing: '营销费用',
  other: '其他'
};

const paymentMethodLabels = {
  cash: '现金',
  wechat: '微信',
  alipay: '支付宝',
  card: '银行卡',
  bank_transfer: '银行转账'
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Finance() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTransaction, setDeleteTransaction] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setDeleteTransaction(null);
    }
  });

  const handleSubmit = (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  // Filter transactions based on date range
  const now = new Date();
  const startDate = dateRange === 'month' 
    ? startOfMonth(now).toISOString().split('T')[0]
    : startOfMonth(subMonths(now, 11)).toISOString().split('T')[0];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabels[t.category]?.includes(search);
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesDate = t.transaction_date >= startDate;
    return matchesSearch && matchesType && matchesDate;
  });

  // Calculate stats
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netProfit = totalIncome - totalExpense;

  // Category breakdown for pie chart
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (t.amount || 0);
      return acc;
    }, {});

  const pieData = Object.entries(incomeByCategory).map(([key, value]) => ({
    name: categoryLabels[key] || key,
    value
  }));

  // Monthly trend
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const monthStart = startOfMonth(date).toISOString().split('T')[0];
    const monthEnd = endOfMonth(date).toISOString().split('T')[0];
    
    const monthTransactions = transactions.filter(t => 
      t.transaction_date >= monthStart && t.transaction_date <= monthEnd
    );
    
    return {
      month: format(date, 'MM月'),
      income: monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
      expense: monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0)
    };
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">财务管理</h1>
            <p className="text-slate-500 mt-1">收支记录和财务分析</p>
          </div>
          <Button 
            onClick={() => { setEditingTransaction(null); setShowForm(true); }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" /> 新增交易
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">总收入</p>
                  <p className="text-2xl font-bold text-emerald-600">¥{totalIncome.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">总支出</p>
                  <p className="text-2xl font-bold text-rose-600">¥{totalExpense.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl">
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">净利润</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    ¥{netProfit.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">月度趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <Bar dataKey="income" fill="#10b981" name="收入" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#f43f5e" name="支出" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">收入构成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    暂无数据
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="搜索描述或分类..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="income">收入</SelectItem>
              <SelectItem value="expense">支出</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>日期</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    暂无交易记录
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.slice(0, 50).map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                    <TableCell>{transaction.transaction_date}</TableCell>
                    <TableCell>
                      <Badge className={transaction.type === 'income' 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                      }>
                        {transaction.type === 'income' ? '收入' : '支出'}
                      </Badge>
                    </TableCell>
                    <TableCell>{categoryLabels[transaction.category] || transaction.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description || '-'}</TableCell>
                    <TableCell>{paymentMethodLabels[transaction.payment_method] || transaction.payment_method}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                            <Edit2 className="w-4 h-4 mr-2" /> 编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteTransaction(transaction)}
                            className="text-rose-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> 删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <TransactionForm 
          open={showForm}
          onClose={() => { setShowForm(false); setEditingTransaction(null); }}
          onSubmit={handleSubmit}
          transaction={editingTransaction}
        />

        <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除这条交易记录吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteMutation.mutate(deleteTransaction.id)}
                className="bg-rose-600 hover:bg-rose-700"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
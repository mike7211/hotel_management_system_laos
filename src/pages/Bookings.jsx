import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import BookingForm from '../components/bookings/BookingForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusMap = {
  pending: { label: "待入住", color: "bg-amber-100 text-amber-700" },
  checked_in: { label: "已入住", color: "bg-emerald-100 text-emerald-700" },
  checked_out: { label: "已退房", color: "bg-slate-100 text-slate-700" },
  cancelled: { label: "已取消", color: "bg-rose-100 text-rose-700" }
};

const paymentStatusMap = {
  unpaid: { label: "未支付", color: "bg-rose-100 text-rose-700" },
  partial: { label: "部分支付", color: "bg-amber-100 text-amber-700" },
  paid: { label: "已支付", color: "bg-emerald-100 text-emerald-700" }
};

export default function Bookings() {
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date')
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const booking = await base44.entities.Booking.create(data);
      // Update room status
      if (data.status === 'checked_in') {
        await base44.entities.Room.update(data.room_id, { status: 'occupied' });
      } else if (data.status === 'pending') {
        await base44.entities.Room.update(data.room_id, { status: 'reserved' });
      }
      // Create transaction for paid bookings
      if (data.payment_status === 'paid' && data.total_amount > 0) {
        await base44.entities.Transaction.create({
          type: 'income',
          category: 'room_booking',
          amount: data.total_amount,
          description: `房间${data.room_number} - ${data.guest_name}`,
          reference_id: booking.id,
          transaction_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash'
        });
      }
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, oldBooking }) => {
      await base44.entities.Booking.update(id, data);
      // Handle room status changes
      if (data.status === 'checked_out' || data.status === 'cancelled') {
        await base44.entities.Room.update(data.room_id, { status: 'available' });
      } else if (data.status === 'checked_in') {
        await base44.entities.Room.update(data.room_id, { status: 'occupied' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setShowForm(false);
      setEditingBooking(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (booking) => {
      await base44.entities.Booking.delete(booking.id);
      if (booking.status !== 'checked_out' && booking.status !== 'cancelled') {
        await base44.entities.Room.update(booking.room_id, { status: 'available' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setDeleteBooking(null);
    }
  });

  const handleSubmit = (data) => {
    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data, oldBooking: editingBooking });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      booking.room_number?.includes(search);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">预订管理</h1>
            <p className="text-slate-500 mt-1">管理客房预订和入住</p>
          </div>
          <Button 
            onClick={() => { setEditingBooking(null); setShowForm(true); }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" /> 新建预订
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="搜索客人姓名或房间号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待入住</SelectItem>
              <SelectItem value="checked_in">已入住</SelectItem>
              <SelectItem value="checked_out">已退房</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>客人</TableHead>
                <TableHead>房间</TableHead>
                <TableHead>入住日期</TableHead>
                <TableHead>退房日期</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>支付</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    暂无预订数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{booking.guest_name}</p>
                        <p className="text-sm text-slate-500">{booking.guest_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{booking.room_number}</TableCell>
                    <TableCell>{booking.check_in_date && format(new Date(booking.check_in_date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{booking.check_out_date && format(new Date(booking.check_out_date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell className="font-medium">¥{booking.total_amount || 0}</TableCell>
                    <TableCell>
                      <Badge className={statusMap[booking.status]?.color || statusMap.pending.color}>
                        {statusMap[booking.status]?.label || "待入住"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusMap[booking.payment_status]?.color || paymentStatusMap.unpaid.color}>
                        {paymentStatusMap[booking.payment_status]?.label || "未支付"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(booking)}>
                            <Edit2 className="w-4 h-4 mr-2" /> 编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteBooking(booking)}
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

        <BookingForm 
          open={showForm}
          onClose={() => { setShowForm(false); setEditingBooking(null); }}
          onSubmit={handleSubmit}
          booking={editingBooking}
          rooms={rooms}
        />

        <AlertDialog open={!!deleteBooking} onOpenChange={() => setDeleteBooking(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除 {deleteBooking?.guest_name} 的预订吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteMutation.mutate(deleteBooking)}
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
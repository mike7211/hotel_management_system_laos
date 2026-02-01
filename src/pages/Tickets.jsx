import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MapPin, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import ScenicSpotCard from '../components/tickets/ScenicSpotCard';
import ScenicSpotForm from '../components/tickets/ScenicSpotForm';
import TicketSaleForm from '../components/tickets/TicketSaleForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('spots');
  const [showSpotForm, setShowSpotForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [deleteSpot, setDeleteSpot] = useState(null);
  const [sellingSpot, setSellingSpot] = useState(null);

  const queryClient = useQueryClient();

  const { data: spots = [], isLoading: loadingSpots } = useQuery({
    queryKey: ['scenicSpots'],
    queryFn: () => base44.entities.ScenicSpot.list()
  });

  const { data: ticketSales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['ticketSales'],
    queryFn: () => base44.entities.TicketSale.list('-created_date', 100)
  });

  const createSpotMutation = useMutation({
    mutationFn: (data) => base44.entities.ScenicSpot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenicSpots'] });
      setShowSpotForm(false);
    }
  });

  const updateSpotMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScenicSpot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenicSpots'] });
      setShowSpotForm(false);
      setEditingSpot(null);
    }
  });

  const deleteSpotMutation = useMutation({
    mutationFn: (id) => base44.entities.ScenicSpot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenicSpots'] });
      setDeleteSpot(null);
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data) => {
      const sale = await base44.entities.TicketSale.create(data);
      // Create transaction
      await base44.entities.Transaction.create({
        type: 'income',
        category: 'ticket_sale',
        amount: data.total_amount,
        description: `${data.scenic_spot_name} - ${data.customer_name}`,
        reference_id: sale.id,
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
      });
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketSales'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSellingSpot(null);
    }
  });

  const handleSpotSubmit = (data) => {
    if (editingSpot) {
      updateSpotMutation.mutate({ id: editingSpot.id, data });
    } else {
      createSpotMutation.mutate(data);
    }
  };

  const handleEditSpot = (spot) => {
    setEditingSpot(spot);
    setShowSpotForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">景点门票</h1>
            <p className="text-slate-500 mt-1">管理景点和门票销售</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="spots" className="gap-2">
              <MapPin className="w-4 h-4" /> 景点管理
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <Receipt className="w-4 h-4" /> 销售记录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spots" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => { setEditingSpot(null); setShowSpotForm(true); }}
                className="bg-slate-900 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" /> 添加景点
              </Button>
            </div>
            
            {loadingSpots ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : spots.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无景点数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots.map((spot) => (
                  <ScenicSpotCard 
                    key={spot.id}
                    spot={spot}
                    onEdit={handleEditSpot}
                    onDelete={setDeleteSpot}
                    onSellTicket={setSellingSpot}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <Card className="border-0 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>景点</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>游玩日期</TableHead>
                    <TableHead>票数</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>购买时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSales ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <div className="h-12 bg-slate-100 rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : ticketSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        暂无销售记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    ticketSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{sale.scenic_spot_name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{sale.customer_name}</p>
                            <p className="text-sm text-slate-500">{sale.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{sale.visit_date}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {sale.adult_count > 0 && <span>成人×{sale.adult_count} </span>}
                            {sale.child_count > 0 && <span>儿童×{sale.child_count} </span>}
                            {sale.senior_count > 0 && <span>老人×{sale.senior_count}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">¥{sale.total_amount}</TableCell>
                        <TableCell className="text-slate-500">
                          {sale.created_date && format(new Date(sale.created_date), 'MM-dd HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        <ScenicSpotForm 
          open={showSpotForm}
          onClose={() => { setShowSpotForm(false); setEditingSpot(null); }}
          onSubmit={handleSpotSubmit}
          spot={editingSpot}
        />

        <TicketSaleForm 
          open={!!sellingSpot}
          onClose={() => setSellingSpot(null)}
          onSubmit={(data) => createSaleMutation.mutate(data)}
          scenicSpot={sellingSpot}
        />

        <AlertDialog open={!!deleteSpot} onOpenChange={() => setDeleteSpot(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除景点 {deleteSpot?.name} 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteSpotMutation.mutate(deleteSpot.id)}
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
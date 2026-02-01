import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, Ticket, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentBookings from '../components/dashboard/RecentBookings';
import RevenueChart from '../components/dashboard/RevenueChart';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function Dashboard() {
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 50)
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 100)
  });

  const { data: ticketSales = [] } = useQuery({
    queryKey: ['ticketSales'],
    queryFn: () => base44.entities.TicketSale.list('-created_date', 100)
  });

  // Calculate stats
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.transaction_date === today)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const todayExpense = transactions
    .filter(t => t.type === 'expense' && t.transaction_date === today)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const todayTicketSales = ticketSales
    .filter(t => t.created_date?.split('T')[0] === today)
    .reduce((sum, t) => sum + (t.total_amount || 0), 0);

  // Chart data - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const income = transactions
      .filter(t => t.type === 'income' && t.transaction_date === dateStr)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return {
      date: format(date, 'MM/dd'),
      income
    };
  });

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">控制台</h1>
          <p className="text-slate-500 mt-1">欢迎回来，这是今天的运营概况</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="可用房间" 
            value={`${availableRooms} / ${rooms.length}`}
            icon={BedDouble}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            trend="up"
            trendValue={`入住率 ${occupancyRate}%`}
          />
          <StatCard 
            title="今日收入" 
            value={`¥${todayIncome.toLocaleString()}`}
            icon={TrendingUp}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard 
            title="今日支出" 
            value={`¥${todayExpense.toLocaleString()}`}
            icon={TrendingDown}
            iconBgColor="bg-rose-50"
            iconColor="text-rose-600"
          />
          <StatCard 
            title="今日门票" 
            value={`¥${todayTicketSales.toLocaleString()}`}
            icon={Ticket}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* Charts and Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
          <div>
            <RecentBookings bookings={recentBookings} />
          </div>
        </div>
      </div>
    </div>
  );
}
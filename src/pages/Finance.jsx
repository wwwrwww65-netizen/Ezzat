import React from 'react';
import { Card, Badge, Table, Button } from '../components/UI';
import { useData } from '../context/DataContext';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Finance() {
  const { income, expenses } = useData();
  const navigate = useNavigate();

  const totalIncome = (income || []).reduce((acc, curr) => {
    const amount = typeof curr.amount === 'string' ? curr.amount : String(curr.amount || 0);
    const val = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
    return acc + val;
  }, 0);

  const totalExpenses = (expenses || []).reduce((acc, curr) => {
    const amount = typeof curr.amount === 'string' ? curr.amount : String(curr.amount || 0);
    const val = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
    return acc + val;
  }, 0);

  const balance = totalIncome - totalExpenses;

  // Recent transactions (merged and sorted)
  const recentTransactions = [
    ...(income || []).map(i => ({ ...i, type: 'income' })),
    ...(expenses || []).map(e => ({ ...e, type: 'expense', title: e.category }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const handleDownload = () => {
    alert('جاري تجهيز كشف الحساب للتحميل...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">الإدارة المالية</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownload}>تحميل كشف حساب</Button>
          <Button onClick={() => navigate('/income')}>إضافة معاملة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
          <div className="flex items-center justify-between mb-4 text-primary-100">
            <span className="text-sm font-medium uppercase tracking-wider">صافي الرصيد</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold">{balance.toLocaleString()} ر.س</h2>
          <div className="mt-6 flex items-center gap-2 text-primary-100 text-xs">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold">تحديث فوري</span>
            <span>بناءً على العمليات الحالية</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4 text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">إجمالي الإيرادات</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{totalIncome.toLocaleString()} ر.س</h2>
          <div className="mt-6 flex items-center gap-2 text-gray-500 text-xs">
            <span className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <span className="bg-emerald-500 h-full block" style={{ width: '100%' }}></span>
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4 text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">إجمالي المصروفات</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{totalExpenses.toLocaleString()} ر.س</h2>
          <div className="mt-6 flex items-center gap-2 text-gray-500 text-xs">
            <span className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <span className="bg-red-500 h-full block" style={{ width: `${Math.min(100, (totalExpenses / (totalIncome || 1)) * 100)}%` }}></span>
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="توزيع المصاريف">
          <div className="space-y-4">
            {[
              { label: 'مواد بناء', color: 'bg-emerald-500' },
              { label: 'رواتب', color: 'bg-blue-500' },
              { label: 'إيجار', color: 'bg-amber-500' },
            ].map((cat, idx) => {
              const catTotal = (expenses || [])
                .filter(e => e.category === cat.label)
                .reduce((acc, curr) => acc + (parseInt(curr.amount.replace(/[^0-9]/g, '')) || 0), 0);
              const percent = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{cat.label}</span>
                    <span className="font-bold text-gray-900">{catTotal.toLocaleString()} ر.س</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="آخر العمليات المالية" noPadding>
          <Table headers={['المعاملة', 'التاريخ', 'المبلغ', 'الحالة']}>
            {recentTransactions.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.title || item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{item.date}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.type === 'income' ? '+' : '-'}{item.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={item.status === 'مؤكد' || item.status === 'مكتمل' ? 'success' : 'warning'}>
                    {item.status || 'مكتمل'}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}

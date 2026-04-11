import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  FileText,
  Clock,
  PieChart,
  Download,
  Printer,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const chartData = [
  { name: 'الأسبوع 1', income: 45000, expense: 32000 },
  { name: 'الأسبوع 2', income: 52000, expense: 48000 },
  { name: 'الأسبوع 3', income: 38000, expense: 25000 },
  { name: 'الأسبوع 4', income: 65000, expense: 42000 },
];

export default function Finance() {
  const { invoices, expenses, income, bonds, payments } = useData();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState('income');

  const totalIncome = (invoices.filter(i => i.status === 'مدفوعة').reduce((acc, i) => acc + Number(i.total || 0), 0)) +
                    (income.filter(i => i.status === 'مؤكد').reduce((acc, i) => acc + Number(i.amount || 0), 0));

  const totalExpenses = (expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0)) +
                        (payments.filter(p => p.entityType === 'supplier').reduce((acc, p) => acc + Number(p.amount || 0), 0));

  const netProfit = totalIncome - totalExpenses;

  const stats = [
    { label: 'إجمالي المقبوضات', value: totalIncome.toLocaleString() + ' ر.س', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'إجمالي المصروفات', value: totalExpenses.toLocaleString() + ' ر.س', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'صافي الربح التقديري', value: netProfit.toLocaleString() + ' ر.س', icon: Wallet, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'تدفقات نقدية معلقة', value: invoices.filter(i => i.status === 'معلقة').reduce((acc, i) => acc + Number(i.total || 0), 0).toLocaleString() + ' ر.س', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الإدارة المالية</h1>
          <p className="text-sm text-gray-500 mt-1">نظرة شاملة على الأداء المالي، التدفقات النقدية، والأرباح والخسائر</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddTransaction(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إضافة حركة مالية</span>
          </Button>
          <Button variant="secondary">
            <PieChart className="w-4 h-4" />
            <span>التقارير المالية</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4 border-none shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="مقارنة الإيرادات والمصروفات" subtitle="تحليل التدفق النقدي الشهري">
          <div className="h-80 w-full mt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="income" name="الإيرادات" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="أرصدة الحسابات" subtitle="توزيع المبالغ حسب النوع">
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Building2 className="w-5 h-5 text-gray-600" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">أرصدة العملاء</p>
                  <p className="text-xs text-gray-500">مبالغ مستحقة القبض</p>
                </div>
              </div>
              <p className="font-bold text-red-600">420,000 ر.س</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Truck className="w-5 h-5 text-gray-600" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">أرصدة الموردين</p>
                  <p className="text-xs text-gray-500">مبالغ مستحقة الدفع</p>
                </div>
              </div>
              <p className="font-bold text-emerald-600">115,000 ر.س</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl text-center">
              <p className="text-xs text-gray-400 mb-2">إجمالي الالتزامات المالية</p>
              <h3 className="text-2xl font-black text-gray-800">535,000 ر.س</h3>
              <Button variant="ghost" size="sm" className="mt-2 text-primary-600">عرض التفاصيل <ArrowUpRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="أحدث السندات" noPadding>
          <Table headers={['رقم السند', 'الجهة', 'المبلغ', 'النوع', 'الحالة']}>
            {bonds.slice(0, 5).map((bond) => (
              <tr key={bond.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{bond.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{bond.entityName}</td>
                <td className="px-6 py-4 font-bold">{Number(bond.amount).toLocaleString()} ر.س</td>
                <td className="px-6 py-4">
                  <Badge variant={bond.type === 'قبض' ? 'success' : 'danger'}>{bond.type}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="success">{bond.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="أحدث المصروفات" noPadding>
          <Table headers={['التاريخ', 'الفئة', 'المبلغ', 'المستفيد']}>
            {expenses.slice(0, 5).map((exp) => (
              <tr key={exp.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{exp.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{exp.category}</td>
                <td className="px-6 py-4 font-bold text-red-600">{Number(exp.amount).toLocaleString()} ر.س</td>
                <td className="px-6 py-4 text-sm text-gray-600">{exp.recipient}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

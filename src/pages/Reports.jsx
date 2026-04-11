import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  Search,
  Briefcase,
  DollarSign,
  Package,
  Users,
  HardHat,
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export default function Reports() {
  const { projects, clients, inventory, invoices, expenses } = useData();
  const [reportType, setReportType] = useState('financial');

  const financialData = [
    { name: 'يناير', income: 450000, expense: 280000 },
    { name: 'فبراير', income: 520000, expense: 310000 },
    { name: 'مارس', income: 380000, expense: 420000 },
    { name: 'أبريل', income: 610000, expense: 350000 },
    { name: 'مايو', income: 580000, expense: 290000 },
  ];

  const projectStatusData = [
    { name: 'نشط', value: projects.filter(p => p.status === 'نشط').length },
    { name: 'مكتمل', value: projects.filter(p => p.status === 'مكتمل').length },
    { name: 'متأخر', value: projects.filter(p => p.status === 'متأخر').length },
    { name: 'بالانتظار', value: projects.filter(p => p.status === 'قيد الانتظار').length },
  ];

  const COLORS = ['#1e3a8a', '#10b981', '#ef4444', '#f59e0b'];

  const reportOptions = [
    { id: 'financial', name: 'التقرير المالي العام', icon: DollarSign },
    { id: 'projects', name: 'تقرير حالة المشاريع', icon: Briefcase },
    { id: 'inventory', name: 'تقرير حركة المخزون', icon: Package },
    { id: 'clients', name: 'تقرير العملاء والديون', icon: Users },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">مركز التقارير المتقدم</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">تحليل البيانات، مؤشرات الأداء، والتقارير التنفيذية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-xl"><Printer className="w-4 h-4" /> طباعة الكل</Button>
          <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200"><Download className="w-4 h-4" /> تصدير PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setReportType(opt.id)}
            className={`p-4 rounded-2xl border transition-all text-right group ${
              reportType === opt.id
              ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-100'
              : 'bg-white border-gray-100 text-gray-600 hover:border-primary-200 hover:bg-gray-50'
            }`}
          >
            <opt.icon className={`w-6 h-6 mb-3 ${reportType === opt.id ? 'text-white' : 'text-primary-600'}`} />
            <p className="text-xs font-bold uppercase opacity-70">قسم</p>
            <p className="text-sm font-black tracking-tight">{opt.name}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6" title="التحليل البياني للمدخولات والمصروفات">
          <div className="h-[400px] w-full mt-6" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="الإيرادات" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="المصروفات" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="توزيع حالة المشاريع" className="p-6">
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
             {projectStatusData.map((s, i) => (
               <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                     <span className="text-gray-600 font-bold">{s.name}</span>
                  </div>
                  <span className="font-black text-gray-800">{s.value}</span>
               </div>
             ))}
          </div>
        </Card>
      </div>

      <Card title="بيانات التقرير التفصيلية" noPadding>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="البحث في التقرير..." className="pr-9" />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <Button variant="secondary" size="sm"><Filter className="w-4 h-4" /> فلاتر</Button>
              <Button variant="secondary" size="sm"><Calendar className="w-4 h-4" /> الفترة الزمنية</Button>
           </div>
        </div>
        <Table headers={['المعرف', 'البيان', 'التاريخ', 'القيمة الإجمالية', 'الضريبة', 'الحالة']}>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td className="px-6 py-4 font-bold text-gray-900">{inv.id}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600">{inv.clientName}</td>
              <td className="px-6 py-4 text-xs text-gray-400 font-bold">{inv.date}</td>
              <td className="px-6 py-4 font-black text-emerald-600">{Number(inv.total).toLocaleString()} ر.س</td>
              <td className="px-6 py-4 text-xs text-gray-500">{Number(inv.tax).toLocaleString()} ر.س</td>
              <td className="px-6 py-4"><Badge variant={inv.status === 'مدفوعة' ? 'success' : 'warning'}>{inv.status}</Badge></td>
            </tr>
          ))}
        </Table>
        <div className="p-4 bg-gray-50 text-center">
           <Button variant="ghost" className="text-primary-600 font-bold">تحميل التقرير كاملاً بصيغة Excel</Button>
        </div>
      </Card>
    </div>
  );
}

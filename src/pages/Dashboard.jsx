import React from 'react';
import { Card, Badge, Table } from '../components/UI';
import { useData } from '../context/DataContext';
import { TrendingUp, TrendingDown, Minus, Briefcase, Users, FileText, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'يناير', total: 4000 },
  { name: 'فبراير', total: 3000 },
  { name: 'مارس', total: 5000 },
  { name: 'أبريل', total: 4500 },
  { name: 'مايو', total: 6000 },
  { name: 'يونيو', total: 5500 },
];

export default function Dashboard() {
  const { projects, clients, invoices, expenses } = useData();

  const calculateProfit = () => {
    const totalIncome = invoices
      .filter(inv => inv.status === 'مدفوعة')
      .reduce((acc, inv) => acc + (parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0), 0);
    const totalExpenses = expenses
      .reduce((acc, exp) => acc + (parseInt(exp.amount.replace(/[^0-9]/g, '')) || 0), 0);
    return totalIncome - totalExpenses;
  };

  const stats = [
    { label: 'إجمالي المشاريع', value: projects.length.toString(), trend: '+2', trendType: 'up', icon: Briefcase },
    { label: 'المشاريع النشطة', value: projects.filter(p => p.status === 'نشط').length.toString(), trend: '0', trendType: 'neutral', icon: Briefcase },
    { label: 'إجمالي العملاء', value: clients.length.toString(), trend: '+12', trendType: 'up', icon: Users },
    { label: 'صافي الربح', value: `${calculateProfit().toLocaleString()} ر.س`, trend: '+15%', trendType: 'up', icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">نظرة عامة</h1>
        <p className="text-sm text-gray-500">مرحباً بك، إليك ملخص لأعمال اليوم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-0 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary-600 group-hover:text-white" />
                  </div>
                  <div className={stat.trendType === 'up' ? 'text-emerald-600' : stat.trendType === 'down' ? 'text-red-600' : 'text-gray-400'}>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {stat.trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : stat.trendType === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h4 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h4>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="إحصائيات الإيرادات">
          <div className="h-80 w-full mt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="أحدث المشاريع">
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    {project.name ? project.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.client}</p>
                  </div>
                </div>
                <Badge variant={project.status === 'نشط' ? 'success' : project.status === 'مكتمل' ? 'info' : project.status === 'متأخر' ? 'danger' : 'warning'}>
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="المشاريع الجارية" noPadding>
        <Table headers={['اسم المشروع', 'العميل', 'الحالة', 'الإنجاز', 'تاريخ البدء']}>
          {projects.filter(p => p.status === 'نشط').slice(0, 10).map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="success">{project.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{project.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.startDate}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

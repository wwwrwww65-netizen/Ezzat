import React from 'react';
import { Card, Badge, Table, Button } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
  Users,
  FileText,
  Wallet,
  Clock,
  AlertTriangle,
  Building2,
  ChevronRight,
  Calendar,
  Truck,
  HardHat,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { Link } from 'react-router-dom';

const chartData = [
  { name: 'الأسبوع 1', income: 45000, expense: 32000 },
  { name: 'الأسبوع 2', income: 52000, expense: 48000 },
  { name: 'الأسبوع 3', income: 38000, expense: 25000 },
  { name: 'الأسبوع 4', income: 65000, expense: 42000 },
];

const COLORS = ['#1e3a8a', '#10b981', '#ef4444', '#f59e0b'];

export default function Dashboard() {
  const { projects, clients, invoices, expenses, income, tasks, notifications } = useData();

  const totalIncome = (invoices?.filter(i => i.status === 'مدفوعة').reduce((acc, i) => acc + Number(i.total || 0), 0) || 0) +
                    (income?.filter(i => i.status === 'مؤكد').reduce((acc, i) => acc + Number(i.amount || 0), 0) || 0);

  const totalExpenses = (expenses?.reduce((acc, e) => acc + Number(e.amount || 0), 0) || 0);

  const stats = [
    { label: 'إجمالي المشاريع', value: projects.length, trend: '+2', trendType: 'up', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'المشاريع النشطة', value: projects.filter(p => p.status === 'نشط').length, trend: '0', trendType: 'neutral', icon: ActivityIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'إجمالي العملاء', value: clients.length, trend: '+12', trendType: 'up', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'صافي الربح', value: `${(totalIncome - totalExpenses).toLocaleString()} ر.س`, trend: '+15%', trendType: 'up', icon: Wallet, color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">لوحة التحكم الرئيسية</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">مرحباً بك مجدداً، إليك نظرة سريعة على أداء أعمالك اليوم</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="rounded-xl"><Calendar className="w-4 h-4" /> الفترة: الشهر الحالي</Button>
           <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200">تحديث البيانات</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-0 overflow-hidden border-none shadow-sm group">
              <div className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:bg-primary-50 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={cn("flex items-center gap-1 text-xs font-black",
                      stat.trendType === 'up' ? 'text-emerald-600' :
                      stat.trendType === 'down' ? 'text-red-600' : 'text-gray-400'
                    )}>
                      {stat.trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : stat.trendType === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <h4 className="text-2xl font-black text-gray-800 mt-1">{stat.value}</h4>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6" title="تحليل التدفق النقدي" subtitle="مقارنة أسبوعية للإيرادات والمصروفات">
          <div className="h-80 w-full mt-6" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="income" name="الدخل" stroke="#1e3a8a" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="المصروف" stroke="#ef4444" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="أحدث التنبيهات" subtitle="إشعارات النظام والتحذيرات">
           <div className="space-y-4 mt-4">
              {notifications.slice(0, 4).map(note => (
                <div key={note.id} className={cn(
                  "p-4 rounded-2xl border flex gap-4 transition-all hover:shadow-md",
                  note.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                )}>
                   <div className={cn(
                     "p-2 rounded-xl h-fit",
                     note.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                   )}>
                      {note.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-gray-800">{note.title}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{note.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-bold">{note.time}</p>
                   </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-primary-600 font-bold text-sm">عرض كافة الإشعارات <ChevronRight className="w-4 h-4" /></Button>
           </div>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="المشاريع الجارية" noPadding
          footer={<Link to="/projects" className="text-sm font-bold text-primary-600 flex items-center justify-center gap-2 hover:gap-3 transition-all">عرض كافة المشاريع <ChevronRight className="w-4 h-4" /></Link>}
        >
          <Table headers={['المشروع', 'التقدم', 'الميزانية', 'الحالة']}>
            {projects.slice(0, 5).map(prj => (
              <tr key={prj.id}>
                <td className="px-6 py-4">
                   <p className="text-sm font-bold text-gray-800">{prj.name}</p>
                   <p className="text-[10px] text-gray-400 font-medium">{prj.clientName}</p>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-primary-600" style={{ width: `${prj.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{prj.progress}%</span>
                   </div>
                </td>
                <td className="px-6 py-4 font-bold text-sm text-gray-700">{prj.budget?.toLocaleString()} <span className="text-[10px] font-normal">ر.س</span></td>
                <td className="px-6 py-4"><Badge variant="success">{prj.status}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="المهام والمواعيد" noPadding
          footer={<Link to="/tasks" className="text-sm font-bold text-primary-600 flex items-center justify-center gap-2 hover:gap-3 transition-all">إدارة كافة المهام <ChevronRight className="w-4 h-4" /></Link>}
        >
           <div className="divide-y divide-gray-50">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        task.priority === 'عالية' ? 'bg-red-500' : 'bg-amber-500'
                      )}></div>
                      <div>
                         <p className="text-sm font-bold text-gray-800">{task.title}</p>
                         <p className="text-xs text-gray-400 mt-0.5">موعد التسليم: {task.dueDate}</p>
                      </div>
                   </div>
                   <Badge variant="neutral">{task.status}</Badge>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
}

function ActivityIcon({className}) {
  return <TrendingUp className={className} />;
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

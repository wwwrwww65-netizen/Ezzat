import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  Globe,
  FileText,
  AlertCircle,
  Download,
  Trash2,
  Calendar
} from 'lucide-react';

export default function ActivityLog() {
  const { activityLog, setData } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const clearLog = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح كافة سجلات النشاط؟ لا يمكن التراجع عن هذه الخطوة.')) {
      setData(prev => ({ ...prev, activityLog: [] }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">سجل النشاط والتدقيق</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">مراقبة كافة العمليات والتغييرات التي تتم داخل النظام</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="rounded-xl"><Download className="w-4 h-4" /> تصدير السجل</Button>
           <Button variant="danger" className="rounded-xl" onClick={clearLog}><Trash2 className="w-4 h-4" /> مسح السجل</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><History className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي العمليات</p>
               <p className="text-xl font-black">{activityLog.length}</p>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><User className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">مستخدمين نشطين</p>
               <p className="text-xl font-black">4</p>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600"><AlertCircle className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">تغييرات حساسة</p>
               <p className="text-xl font-black">12</p>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><Globe className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">عناوين IP</p>
               <p className="text-xl font-black">8</p>
            </div>
         </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في سجل النشاط..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Select options={[{label: 'اليوم', value: 'today'}, {label: 'آخر 7 أيام', value: '7d'}]} className="w-32" />
              <Button variant="secondary" size="sm"><Calendar className="w-4 h-4" /></Button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
               <tr>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">المستخدم</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">الإجراء</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">الوقت والتاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">عنوان IP</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">المنصة</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {activityLog.filter(log => log.action.includes(searchTerm) || log.user.includes(searchTerm)).map(log => (
                 <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary-600">{log.user.charAt(0)}</div>
                          <span className="text-sm font-bold text-gray-700">{log.user}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm text-gray-600 font-medium">{log.action}</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-bold">{log.time}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{log.ip}</td>
                    <td className="px-6 py-4">
                       <Badge variant="neutral" className="text-[8px] opacity-50 group-hover:opacity-100 transition-opacity">Desktop / Chrome</Badge>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

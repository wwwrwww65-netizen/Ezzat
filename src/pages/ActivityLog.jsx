import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Input, Select, Button } from '../components/UI';
import { History, Search, Filter, Calendar, Clock } from 'lucide-react';

export default function ActivityLog() {
  const [activityLog, setActivityLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    if (window.electronAPI) {
      const logs = await window.electronAPI.queryDb("SELECT * FROM activity_log ORDER BY id DESC");
      setActivityLog(logs);
    }
  };

  const filteredLogs = (activityLog || []).filter(log => 
    log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سجل النشاطات</h1>
          <p className="text-sm text-gray-500 mt-1">تتبع كافة تحركات المستخدمين وتعديلات النظام.</p>
        </div>
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
               {filteredLogs.map(log => (
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
               {filteredLogs.length === 0 && (
                 <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">لا توجد نشاطات مسجلة</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

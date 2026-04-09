import React from 'react';
import { Card, Table, Badge } from '../components/UI';
import { mockActivityLog } from '../data/mockData';
import { History, Clock, MapPin, User } from 'lucide-react';

export default function ActivityLog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سجل النشاط</h1>
          <p className="text-sm text-gray-500">تتبع جميع العمليات التي تمت في النظام</p>
        </div>
      </div>

      <Card className="p-4" noPadding>
        <Table headers={['المستخدم', 'النشاط / العملية', 'الوقت', 'عنوان IP']}>
          {mockActivityLog.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{log.user}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.action}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {log.time}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                  <MapPin className="w-3.5 h-3.5" />
                  {log.ip}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

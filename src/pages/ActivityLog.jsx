import React from 'react';
import { Card, Table } from '../components/UI';
import { useData } from '../context/DataContext';
import { Clock, User, Activity } from 'lucide-react';

export default function ActivityLog() {
  const { activityLog } = useData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سجل النشاطات</h1>
          <p className="text-sm text-gray-500">تتبع جميع العمليات التي تمت على النظام</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden" noPadding>
        <Table headers={['المستخدم', 'العملية', 'الوقت', 'عنوان IP']}>
          {activityLog.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{log.user}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{log.action}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {log.time}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                {log.ip}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

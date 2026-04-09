import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { mockUsers } from '../data/mockData';
import { UserPlus, ShieldCheck } from 'lucide-react';

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المستخدمون والصلاحيات</h1>
          <p className="text-sm text-gray-500">إدارة حسابات النظام وتوزيع الأدوار</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      <Card className="p-4" noPadding>
        <Table headers={['المستخدم', 'البريد الإلكتروني', 'الدور الوظيفي', 'الحالة', 'الإجراءات']}>
          {mockUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-primary-600 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  {user.role}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.status === 'نشط' ? 'success' : 'neutral'}>
                  {user.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button variant="secondary" size="sm">تعديل الصلاحيات</Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

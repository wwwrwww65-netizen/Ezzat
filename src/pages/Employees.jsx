import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { mockEmployees } from '../data/mockData';
import { Plus, Search, UserPlus } from 'lucide-react';

export default function Employees() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
          <p className="text-sm text-gray-500">إدارة الكادر البشري والرواتب والمهام</p>
        </div>
        <Button className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4" />
          إضافة موظف جديد
        </Button>
      </div>

      <Card className="p-4" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="البحث عن موظف..."
            />
          </div>
        </div>

        <Table headers={['الموظف', 'الوظيفة / القسم', 'الراتب الأساسي', 'الحالة', 'الإجراءات']}>
          {mockEmployees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    {emp.name.split(' ')[0][0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{emp.name}</span>
                    <span className="text-xs text-gray-500">EM-{emp.id.toString().padStart(3, '0')}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900">{emp.position}</span>
                  <span className="text-xs text-primary-600 font-medium">{emp.department}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{emp.salary}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={emp.status === 'على رأس العمل' ? 'success' : 'warning'}>
                  {emp.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">ملف الموظف</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

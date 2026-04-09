import React from 'react';
import { Card, Table, Button } from '../components/UI';
import { mockExpenses } from '../data/mockData';
import { Plus, Filter, Calendar } from 'lucide-react';

export default function Expenses() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المصروفات</h1>
          <p className="text-sm text-gray-500">تتبع وإدارة جميع مصروفات الشركة</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4" />
          إضافة مصروف جديد
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {['الكل', 'رواتب', 'مواد بناء', 'إيجارات', 'صيانة', 'أخرى'].map((cat, idx) => (
          <button key={idx} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${idx === 0 ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      <Card className="p-4" noPadding>
        <Table headers={['الفئة', 'المستلم / الجهة', 'التاريخ', 'المبلغ', 'الإجراءات']}>
          {mockExpenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {exp.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{exp.recipient}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3 h-3 text-gray-400" />
                {exp.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{exp.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button variant="ghost" size="sm">عرض السند</Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

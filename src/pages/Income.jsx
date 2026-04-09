import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { TrendingUp, Plus, Download } from 'lucide-react';

export default function Income() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الإيرادات</h1>
          <p className="text-sm text-gray-500">إجمالي الدخل والتدفقات النقدية الواردة</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          إضافة إيراد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-r-4 border-r-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">إيرادات اليوم</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">12,500 ر.س</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            +8% من الأمس
          </div>
        </Card>
        <Card className="border-r-4 border-r-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">إيرادات الأسبوع</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">84,200 ر.س</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            +15% من الأسبوع الماضي
          </div>
        </Card>
        <Card className="border-r-4 border-r-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">إيرادات الشهر</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">345,000 ر.س</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            +22% من الشهر الماضي
          </div>
        </Card>
      </div>

      <Card title="سجل المقبوضات الأخيرة" noPadding>
        <Table headers={['البيان / المشروع', 'طريقة الدفع', 'التاريخ', 'المبلغ', 'الحالة']}>
          {[
            { id: 1, title: 'دفعة أولى - فيلا النرجس', method: 'تحويل بنكي', date: '2023-12-05', amount: '50,000 ر.س', status: 'مؤكد' },
            { id: 2, title: 'مستخلص رقم 3 - برج الملك', method: 'شيك', date: '2023-12-04', amount: '120,000 ر.س', status: 'مؤكد' },
            { id: 3, title: 'تجديد فندق الشاطئ', method: 'نقدًا', date: '2023-12-02', amount: '15,000 ر.س', status: 'قيد التحصيل' },
          ].map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.method}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{item.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{item.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={item.status === 'مؤكد' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

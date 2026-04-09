import React from 'react';
import { Card, Badge, Table, Button } from '../components/UI';
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Finance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">الإدارة المالية</h1>
        <div className="flex gap-2">
          <Button variant="secondary">تحميل كشف حساب</Button>
          <Button>إضافة معاملة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
          <div className="flex items-center justify-between mb-4 text-primary-100">
            <span className="text-sm font-medium uppercase tracking-wider">إجمالي الرصيد</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold">1,245,000 ر.س</h2>
          <div className="mt-6 flex items-center gap-2 text-primary-100 text-xs">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold">+12%</span>
            <span>مقارنة بالشهر الماضي</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4 text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">إيرادات الشهر</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">185,400 ر.س</h2>
          <div className="mt-6 flex items-center gap-2 text-gray-500 text-xs">
            <span className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <span className="bg-emerald-500 h-full block" style={{ width: '70%' }}></span>
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4 text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">مصروفات الشهر</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">92,300 ر.س</h2>
          <div className="mt-6 flex items-center gap-2 text-gray-500 text-xs">
            <span className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <span className="bg-red-500 h-full block" style={{ width: '45%' }}></span>
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="توزيع المصاريف">
          <div className="space-y-4">
            {[
              { label: 'رواتب موظفين', value: '55,000 ر.س', percent: 60, color: 'bg-blue-500' },
              { label: 'مواد ومخزون', value: '25,000 ر.س', percent: 27, color: 'bg-emerald-500' },
              { label: 'إيجارات ومرافق', value: '12,300 ر.س', percent: 13, color: 'bg-amber-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="المعاملات الأخيرة" noPadding>
          <Table headers={['المعاملة', 'المبلغ', 'الحالة']}>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm">دفعة مشروع فيلا النرجس</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">+15,000 ر.س</td>
              <td className="px-6 py-4 whitespace-nowrap"><Badge variant="success">مكتمل</Badge></td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm">شراء رخام إيطالي</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">-8,400 ر.س</td>
              <td className="px-6 py-4 whitespace-nowrap"><Badge variant="success">مكتمل</Badge></td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm">فاتورة كهرباء المكتب</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">-1,200 ر.س</td>
              <td className="px-6 py-4 whitespace-nowrap"><Badge variant="warning">قيد المعالجة</Badge></td>
            </tr>
          </Table>
        </Card>
      </div>
    </div>
  );
}

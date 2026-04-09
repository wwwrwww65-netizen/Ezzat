import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { mockInvoices } from '../data/mockData';
import { FilePlus, Search, Download, Printer } from 'lucide-react';

export default function Invoices() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الفواتير</h1>
          <p className="text-sm text-gray-500">إدارة فواتير المبيعات والعملاء</p>
        </div>
        <Button className="w-full sm:w-auto">
          <FilePlus className="w-4 h-4" />
          إنشاء فاتورة جديدة
        </Button>
      </div>

      <Card className="p-4" noPadding>
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="البحث عن فاتورة..."
            />
          </div>
        </div>

        <Table headers={['رقم الفاتورة', 'العميل', 'تاريخ الإصدار', 'إجمالي المبلغ', 'الحالة', 'الإجراءات']}>
          {mockInvoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">{inv.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.client}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{inv.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{inv.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={inv.status === 'مدفوعة' ? 'success' : inv.status === 'معلقة' ? 'warning' : 'danger'}>
                  {inv.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"><Download className="w-4 h-4" /></button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"><Printer className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

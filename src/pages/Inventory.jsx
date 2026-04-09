import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { mockInventory } from '../data/mockData';
import { PackagePlus, Search, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المخزون والمواد</h1>
          <p className="text-sm text-gray-500">إدارة المواد الخام والقطع واللوازم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><RefreshCw className="w-4 h-4" /> تحديث الكميات</Button>
          <Button><PackagePlus className="w-4 h-4" /> إضافة مادة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase">إجمالي الأصناف</p>
            <p className="text-xl font-bold text-gray-900">156</p>
          </div>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-lg text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase">مخزون منخفض</p>
            <p className="text-xl font-bold text-gray-900">12</p>
          </div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-100 flex items-center gap-4">
          <div className="p-3 bg-red-500 rounded-lg text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-600 uppercase">نفذت الكمية</p>
            <p className="text-xl font-bold text-gray-900">3</p>
          </div>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-lg text-white">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase">حركات اليوم</p>
            <p className="text-xl font-bold text-gray-900">45</p>
          </div>
        </Card>
      </div>

      <Card className="p-4" noPadding>
        <Table headers={['اسم المادة', 'الفئة', 'الكمية الحالية', 'الحد الأدنى', 'الحالة', 'الإجراءات']}>
          {mockInventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{item.minQuantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={item.status === 'متوفر' ? 'success' : item.status === 'منخفض' ? 'warning' : 'danger'}>
                  {item.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button variant="ghost" size="sm">تعديل</Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

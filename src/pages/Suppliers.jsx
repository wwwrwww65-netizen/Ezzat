import React from 'react';
import { Card, Table, Button, Badge } from '../components/UI';
import { mockSuppliers } from '../data/mockData';
import { Plus, Search, Truck, Phone, MessageSquare } from 'lucide-react';

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الموردون</h1>
          <p className="text-sm text-gray-500">إدارة علاقات الموردين وأوامر الشراء</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          إضافة مورد جديد
        </Button>
      </div>

      <Card className="p-4" noPadding>
        <Table headers={['المورد', 'مسؤول التواصل', 'رقم الهاتف', 'التخصص', 'الإجراءات']}>
          {mockSuppliers.map((sup) => (
            <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{sup.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sup.contact}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{sup.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="info">{sup.category}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"><Phone className="w-4 h-4" /></button>
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><MessageSquare className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

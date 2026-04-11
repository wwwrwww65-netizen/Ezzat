import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Printer,
  Download,
  ShoppingBag,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function PurchaseOrders() {
  const { purchaseOrders, suppliers, projects, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">أوامر الشراء للمشاريع</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة طلبات التوريد، مواعيد الاستلام، وفواتير الموردين</p>
        </div>
        <div className="flex gap-2">
           <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200"><Plus className="w-4 h-4" /> إنشاء أمر شراء</Button>
           <Button variant="secondary" className="rounded-xl"><Download className="w-4 h-4" /></Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث برقم الأمر أو المورد..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <Table headers={['رقم الأمر', 'المورد', 'المشروع', 'التاريخ', 'الإجمالي', 'الحالة', '']}>
           {purchaseOrders.map(po => (
             <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary-600">{po.id}</td>
                <td className="px-6 py-4">
                   <p className="text-sm font-bold text-gray-800">{suppliers.find(s => s.id === po.supplierId)?.name}</p>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-500">
                   {projects.find(p => p.id === po.projectId)?.name}
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-400">{po.orderDate}</td>
                <td className="px-6 py-4 font-black text-gray-800">{Number(po.totalAmount).toLocaleString()} ر.س</td>
                <td className="px-6 py-4">
                   <Badge variant={po.status === 'تم الاستلام' ? 'success' : 'warning'}>{po.status}</Badge>
                </td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Printer className="w-4 h-4" /></button>
                      <button onClick={() => deleteItem('purchaseOrders', po.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
             </tr>
           ))}
        </Table>
      </Card>
    </div>
  );
}

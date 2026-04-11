import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  Filter,
  Layers,
  Archive,
  Download,
  Boxes,
  Maximize2
} from 'lucide-react';

export default function Materials() {
  const { inventory, categories, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">دليل الأصناف والمواد</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة كافة المواد، المواصفات الفنية، والوحدات</p>
        </div>
        <div className="flex gap-2">
           <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200"><Plus className="w-4 h-4" /> إضافة صنف</Button>
           <Button variant="secondary" className="rounded-xl"><Download className="w-4 h-4" /></Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في دليل المواد..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Select options={categories.map(c => ({label: c.name, value: c.id}))} className="w-40" />
              <Button variant="secondary" size="sm" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
           </div>
        </div>

        <Table headers={['المادة / الصنف', 'الفئة', 'وحدة القياس', 'سعر الشراء', 'سعر البيع', 'الحالة', '']}>
           {filtered.map(item => (
             <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Package className="w-5 h-5" /></div>
                      <div>
                         <p className="text-sm font-bold text-gray-800">{item.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">SKU: {item.id}</p>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <Badge variant="neutral">{categories.find(c => c.id === item.categoryId)?.name}</Badge>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 font-black text-gray-700">{item.buyPrice} ر.س</td>
                <td className="px-6 py-4 font-black text-primary-600">{item.sellPrice} ر.س</td>
                <td className="px-6 py-4"><Badge variant="success">نشط</Badge></td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteItem('inventory', item.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
             </tr>
           ))}
        </Table>
      </Card>
    </div>
  );
}

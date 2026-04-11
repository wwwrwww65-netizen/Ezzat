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
  Boxes,
  Tag,
  Download
} from 'lucide-react';

export default function Categories() {
  const { categories, addItem, deleteItem } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">فئات المواد والأصناف</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">تصنيف المواد لتسهيل البحث وإدارة المخزون والتقارير</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" className="rounded-xl">
          <Plus className="w-4 h-4" /> إضافة فئة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <Card key={cat.id} className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: cat.color }}></div>
            <div className="flex justify-between items-start">
               <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  <Tag className="w-6 h-6" />
               </div>
               <div className="flex gap-1">
                  <button className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('categories', cat.id)} className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>
            <h3 className="text-lg font-black text-gray-800 mt-4">{cat.name}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">كود: {cat.code}</p>
            <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">{cat.description}</p>
            <div className="mt-6 flex justify-between items-center">
               <Badge variant={cat.status === 'نشط' ? 'success' : 'neutral'}>{cat.status}</Badge>
               <span className="text-[10px] font-bold text-gray-400 uppercase">12 صنف</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة فئة جديدة">
         <form className="space-y-4">
            <Input label="اسم الفئة" required />
            <div className="grid grid-cols-2 gap-4">
               <Input label="كود الفئة (مثلاً: CEM)" />
               <Input label="اللون التعريفي" type="color" defaultValue="#1e3a8a" />
            </div>
            <textarea className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm" placeholder="وصف الفئة..." rows="3"></textarea>
            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary">حفظ الفئة</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Input } from '../components/UI';
import { useData } from '../context/DataContext';
import { Plus, Search, Phone, User, Edit, Trash2 } from 'lucide-react';

export default function Suppliers() {
  const { suppliers, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact: '', phone: '', category: '' });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({ ...supplier });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', contact: '', phone: '', category: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      updateItem('suppliers', editingSupplier.id, formData);
    } else {
      addItem('suppliers', { ...formData, id: Date.now() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموردين</h1>
          <p className="text-sm text-gray-500">إدارة سجلات الموردين والمصانع</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          إضافة مورد جديد
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="البحث عن مورد..."
            />
          </div>
        </div>

        <Table headers={['اسم المورد', 'المسؤول', 'الجوال', 'الفئة', 'الإجراءات']}>
          {filteredSuppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{supplier.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {supplier.contact}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-700 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {supplier.phone}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="neutral">{supplier.category}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(supplier)} className="p-1 hover:text-amber-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('suppliers', supplier.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="اسم الشركة/المورد"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="اسم الشخص المسؤول"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
            required
          />
          <Input
            label="رقم الجوال"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <Input
            label="الفئة (مثال: رخام، حديد، بناء)"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}

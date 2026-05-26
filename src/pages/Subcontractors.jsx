import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { HardHat, Plus, Search, Trash2, Edit, CheckCircle2, MapPin, Phone } from 'lucide-react';

export default function Subcontractors() {
  // Use inventory or employees as base, but we will store subcontractors in suppliers if there isn't a dedicated array
  // For now, let's use suppliers context as they are similar, or create a mock array if missing
  const { suppliers, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter suppliers to only show subcontractors (category = مقاول باطن)
  const subcontractors = (suppliers || []).filter(s => s.category === 'مقاول باطن');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: 'كهرباء',
    status: 'نشط',
    category: 'مقاول باطن'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addItem('suppliers', {
      ...formData,
      id: Date.now()
    });
    setShowAddModal(false);
    setFormData({ name: '', phone: '', specialty: 'كهرباء', status: 'نشط', category: 'مقاول باطن' });
  };

  const filtered = subcontractors.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <HardHat className="w-8 h-8 text-primary-600" />
            المقاولون من الباطن
          </h1>
          <p className="text-sm text-gray-500 mt-1">إدارة بيانات المقاولين وتخصصاتهم وحالة العمل.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          <Plus className="w-4 h-4" />
          <span>إضافة مقاول باطن</span>
        </Button>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث باسم المقاول..." 
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Table headers={['الاسم', 'التخصص', 'رقم الجوال', 'الحالة', 'إجراءات']}>
          {filtered.map(sub => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-bold text-gray-800">{sub.name}</td>
              <td className="px-6 py-4 text-gray-600">{sub.specialty}</td>
              <td className="px-6 py-4 text-gray-600">{sub.phone}</td>
              <td className="px-6 py-4">
                <Badge variant={sub.status === 'نشط' ? 'success' : 'neutral'}>{sub.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('suppliers', sub.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-400">لا يوجد مقاولين مسجلين</td>
            </tr>
          )}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مقاول من الباطن">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="اسم المقاول / المؤسسة" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="رقم الجوال" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <Select 
            label="التخصص" 
            options={[
              { label: 'كهرباء', value: 'كهرباء' },
              { label: 'سباكة', value: 'سباكة' },
              { label: 'أعمال مدنية', value: 'أعمال مدنية' },
              { label: 'تشطيبات', value: 'تشطيبات' }
            ]}
            value={formData.specialty}
            onChange={e => setFormData({...formData, specialty: e.target.value})}
          />
          <Select 
            label="الحالة" 
            options={[
              { label: 'نشط', value: 'نشط' },
              { label: 'غير نشط', value: 'غير نشط' }
            ]}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary" type="submit">إضافة المقاول</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

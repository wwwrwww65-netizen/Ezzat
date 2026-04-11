import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { PackagePlus, Search, AlertTriangle, RefreshCw, Edit, Trash2 } from 'lucide-react';

export default function Inventory() {
  const { inventory, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    unit: 'قطعة',
    unitPrice: 0,
    waste: 0,
    supplier: '',
    status: 'متوفر'
  });

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: inventory.length,
    low: inventory.filter(i => i.status === 'منخفض').length,
    out: inventory.filter(i => i.status === 'ناقد' || i.quantity.startsWith('0')).length,
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        quantity: '',
        minQuantity: '',
        status: 'متوفر'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateItem('inventory', editingItem.id, formData);
    } else {
      addItem('inventory', { ...formData, id: Date.now() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المخزون والمواد</h1>
          <p className="text-sm text-gray-500">إدارة المواد الخام والقطع واللوازم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" /> تحديث البيانات
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <PackagePlus className="w-4 h-4" /> إضافة مادة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase">إجمالي الأصناف</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-lg text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase">مخزون منخفض</p>
            <p className="text-xl font-bold text-gray-900">{stats.low}</p>
          </div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-100 flex items-center gap-4">
          <div className="p-3 bg-red-500 rounded-lg text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-600 uppercase">نفذت الكمية</p>
            <p className="text-xl font-bold text-gray-900">{stats.out}</p>
          </div>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-lg text-white">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase">حركات النشطة</p>
            <p className="text-xl font-bold text-gray-900">{inventory.length}</p>
          </div>
        </Card>
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
              placeholder="البحث في المخزون..."
            />
          </div>
        </div>
        <Table headers={['اسم المادة', 'الفئة', 'الكمية الحالية', 'الوحدة', 'السعر', 'الحالة', 'الإجراءات']}>
          {filteredInventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{item.unit || 'قطعة'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{item.unitPrice || 0} ر.س</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={item.status === 'متوفر' ? 'success' : item.status === 'منخفض' ? 'warning' : 'danger'}>
                  {item.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(item)} className="p-1 hover:text-amber-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('inventory', item.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'تعديل مادة' : 'إضافة مادة جديدة للمخزون'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingItem ? 'حفظ التعديلات' : 'إضافة للمخزون'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="اسم المادة"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="الفئة"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الكمية الحالية"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
            <Input
              label="الوحدة"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              placeholder="قطعة، م2، كيس..."
            />
            <Input
              label="سعر الوحدة"
              type="number"
              value={formData.unitPrice}
              onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
            />
            <Input
              label="نسبة الهالك (%)"
              type="number"
              value={formData.waste}
              onChange={(e) => setFormData({...formData, waste: e.target.value})}
            />
          </div>
          <Select
            label="الحالة"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { label: 'متوفر', value: 'متوفر' },
              { label: 'منخفض', value: 'منخفض' },
              { label: 'ناقد', value: 'ناقد' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}

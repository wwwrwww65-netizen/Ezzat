import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Edit,
  Trash2,
  Download,
  Boxes,
  Layers,
  Truck
} from 'lucide-react';

export default function Inventory() {
  const { inventory, categories, suppliers, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    quantity: 0,
    unit: 'قطعة',
    buyPrice: 0,
    sellPrice: 0,
    minQuantity: 5,
    status: 'متوفر',
    defaultSupplier: ''
  });

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || item.categoryId === Number(selectedCategory))
  );

  const stats = [
    { label: 'إجمالي الأصناف', value: inventory.length, icon: Boxes, color: 'text-blue-600' },
    { label: 'أصناف منخفضة', value: inventory.filter(i => i.quantity <= i.minQuantity).length, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'إجمالي الفئات', value: categories.length, icon: Layers, color: 'text-purple-600' },
    { label: 'الموردين النشطين', value: suppliers.length, icon: Truck, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المخزون</h1>
          <p className="text-sm text-gray-500 mt-1">مراقبة كميات المواد، حركات المخزن، وتنبيهات النقص</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </Button>
          <Button variant="secondary">
            <RefreshCw className="w-4 h-4" />
            <span>جرد المخزون</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg bg-gray-50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="البحث عن صنف بالمسمى أو الرمز..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={[
                { label: 'جميع الفئات', value: '' },
                ...categories.map(c => ({ label: c.name, value: c.id }))
              ]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="md:w-auto">
            <Filter className="w-4 h-4" />
            <span>فلاتر متقدمة</span>
          </Button>
        </div>

        <Table headers={['الصنف', 'الفئة', 'الكمية الحالية', 'وحدة القياس', 'سعر الشراء', 'الحالة', 'إجراءات']}>
          {filteredItems.map((item) => {
            const category = categories.find(c => c.id === item.categoryId);
            const isLow = item.quantity <= (item.minQuantity || 0);
            return (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-400">SKU: ITEM-{item.id}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="neutral" style={{ color: category?.color }}>{category?.name || 'غير محدد'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className={cn("font-bold", isLow ? "text-red-600 flex items-center gap-1" : "text-gray-900")}>
                    {item.quantity}
                    {isLow && <AlertTriangle className="w-3 h-3" />}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 font-medium">{item.buyPrice} ر.س</td>
                <td className="px-6 py-4">
                  <Badge variant={isLow ? 'warning' : 'success'}>
                    {isLow ? 'مخزون منخفض' : 'متوفر'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ArrowUpRight className="w-4 h-4" title="صرف" /></button>
                    <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><ArrowDownLeft className="w-4 h-4" title="توريد" /></button>
                    <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem('inventory', item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة صنف جديد للمخزون">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم الصنف" required />
            <Select
              label="الفئة"
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="الكمية الافتتاحية" type="number" />
            <Input label="وحدة القياس" placeholder="مثلاً: كيس، طن، حبة" />
            <Input label="حد التنبيه (الأدنى)" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="سعر الشراء (الوحدة)" type="number" />
            <Input label="سعر البيع/التحميل" type="number" />
          </div>
          <Select
            label="المورد الافتراضي"
            options={suppliers.map(s => ({ label: s.name, value: s.id }))}
          />
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="rounded text-primary-600" /> صنف مخزني
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="rounded text-primary-600" /> قابل للشراء
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="rounded text-primary-600" /> مستهلك في المواقع
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary">حفظ الصنف</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

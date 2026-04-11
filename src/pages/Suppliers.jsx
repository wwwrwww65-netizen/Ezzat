import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Truck,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  Building2,
  Package,
  Clock,
  FileText,
  TrendingUp,
  Download,
  Edit,
  Trash2,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function Suppliers() {
  const { suppliers, purchaseOrders, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'إجمالي الموردين', value: suppliers.length, icon: Building2, color: 'text-blue-600' },
    { label: 'أوامر شراء نشطة', value: purchaseOrders.filter(po => po.status !== 'تم الاستلام').length, icon: Clock, color: 'text-amber-600' },
    { label: 'إجمالي المشتريات', value: purchaseOrders.reduce((acc, po) => acc + Number(po.totalAmount || 0), 0).toLocaleString() + ' ر.س', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'فئات التوريد', value: new Set(suppliers.map(s => s.category)).size, icon: Package, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموردين</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة جهات التوريد، أسعار المواد، وأوامر الشراء</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إضافة مورد جديد</span>
          </Button>
          <Button variant="secondary">
            <FileText className="w-4 h-4" />
            <span>أوامر الشراء</span>
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
                <p className="text-lg font-bold">{stat.value}</p>
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
              placeholder="البحث باسم المورد أو نوع المواد..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <Table headers={['المورد', 'التواصل', 'الفئة الرئيسية', 'التقييم', 'الحالة', 'إجراءات']}>
          {filteredSuppliers.map((sup) => (
            <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                    {sup.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{sup.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {sup.city}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {sup.phone}</div>
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {sup.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="neutral">{sup.category}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{sup.rating || 'N/A'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={sup.status === 'نشط' ? 'success' : 'danger'}>{sup.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" title="تفاصيل" /></button>
                  <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('suppliers', sup.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مورد جديد">
        <form className="space-y-4">
          <Input label="اسم المورد / الشركة" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم المسؤول" />
            <Input label="رقم الهاتف" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="البريد الإلكتروني" type="email" />
            <Input label="فئة المواد" placeholder="مثلاً: حديد، خرسانة" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="شروط الدفع" placeholder="مثلاً: 30 يوم، نقدي" />
            <Input label="مدة التوريد (أيام)" type="number" />
          </div>
          <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm" placeholder="عنوان المورد وملاحظات أخرى..." rows="3"></textarea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary">حفظ المورد</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

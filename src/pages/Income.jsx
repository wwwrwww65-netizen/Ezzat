import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { TrendingUp, Plus, Search, Trash2 } from 'lucide-react';

export default function Income() {
  const { income, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    method: 'تحويل بنكي',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'مؤكد'
  });

  const filteredIncome = (income || []).filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem('income', {
      ...formData,
      id: Date.now(),
      amount: `${parseInt(formData.amount).toLocaleString()} ر.س`
    });
    setIsModalOpen(false);
    setFormData({
      title: '',
      method: 'تحويل بنكي',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'مؤكد'
    });
  };

  const totalIncome = (income || []).reduce((acc, curr) => {
    const val = parseInt(curr.amount.replace(/[^0-9]/g, '')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الإيرادات</h1>
          <p className="text-sm text-gray-500">إجمالي الدخل والتدفقات النقدية الواردة</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          إضافة إيراد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-r-4 border-r-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">إجمالي الإيرادات</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalIncome.toLocaleString()} ر.س</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            تحديث مباشر
          </div>
        </Card>
        <Card className="border-r-4 border-r-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">إيرادات الأسبوع</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">84,200 ر.س</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            +15% من الأسبوع الماضي
          </div>
        </Card>
        <Card className="border-r-4 border-r-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">إيرادات الشهر</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">345,000 ر.س</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3 h-3" />
            +22% من الشهر الماضي
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
              placeholder="البحث في الإيرادات..."
            />
          </div>
        </div>

        <Table headers={['البيان / المشروع', 'طريقة الدفع', 'التاريخ', 'المبلغ', 'الحالة', 'الإجراءات']}>
          {filteredIncome.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.method}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{item.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{item.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={item.status === 'مؤكد' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button onClick={() => deleteItem('income', item.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة إيراد جديد"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">حفظ الإيراد</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="البيان / المشروع"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <Select
            label="طريقة الدفع"
            value={formData.method}
            onChange={(e) => setFormData({...formData, method: e.target.value})}
            options={[
              { label: 'تحويل بنكي', value: 'تحويل بنكي' },
              { label: 'نقدًا', value: 'نقدًا' },
              { label: 'شيك', value: 'شيك' },
              { label: 'مدى', value: 'مدى' },
            ]}
          />
          <Input
            label="المبلغ (ر.س)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
          <Input
            label="التاريخ"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
          <Select
            label="الحالة"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { label: 'مؤكد', value: 'مؤكد' },
              { label: 'قيد التحصيل', value: 'قيد التحصيل' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}

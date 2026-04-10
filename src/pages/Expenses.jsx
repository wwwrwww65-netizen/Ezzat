import React, { useState } from 'react';
import { Card, Table, Button, Modal, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { Plus, Search, Trash2 } from 'lucide-react';

export default function Expenses() {
  const { expenses, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    recipient: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredExpenses = expenses.filter(exp =>
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem('expenses', {
      ...formData,
      id: Date.now(),
      amount: `${formData.amount} ر.س`
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المصروفات</h1>
          <p className="text-sm text-gray-500">تتبع جميع المصاريف التشغيلية والمشتريات</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          تسجيل مصروف جديد
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
              placeholder="البحث في المصروفات..."
            />
          </div>
        </div>

        <Table headers={['الفئة', 'المستلم/المورد', 'المبلغ', 'التاريخ', 'الإجراءات']}>
          {filteredExpenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exp.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.recipient}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{exp.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{exp.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button onClick={() => deleteItem('expenses', exp.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تسجيل مصروف جديد"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>حفظ المصروف</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select
            label="الفئة"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            options={[
              { label: 'مواد بناء', value: 'مواد بناء' },
              { label: 'رواتب', value: 'رواتب' },
              { label: 'إيجار', value: 'إيجار' },
              { label: 'خدمات (كهرباء/ماء)', value: 'خدمات' },
              { label: 'نثريات', value: 'نثريات' },
            ]}
            required
          />
          <Input
            label="المستلم / المورد"
            value={formData.recipient}
            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
            required
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
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { FilePlus, Search, Download, Printer, Trash2 } from 'lucide-react';

export default function Invoices() {
  const { invoices, clients, addItem, deleteItem, updateItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'معلقة'
  });

  const filteredInvoices = invoices.filter(inv =>
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const invId = `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newInvoice = {
      ...formData,
      id: invId,
      amount: `${formData.amount} ر.س`
    };

    addItem('invoices', newInvoice);

    // Update client balance (logic: if unpaid, add to balance)
    if (formData.status !== 'مدفوعة') {
      const client = clients.find(c => c.name === formData.client);
      if (client) {
        const currentBalance = parseInt(client.balance.replace(/[^0-9]/g, '')) || 0;
        const newBalance = currentBalance + parseInt(formData.amount);
        updateItem('clients', client.id, { balance: `${newBalance.toLocaleString()} ر.س` });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (inv) => {
    if (inv.status !== 'مدفوعة') {
      const client = clients.find(c => c.name === inv.client);
      if (client) {
        const currentBalance = parseInt(client.balance.replace(/[^0-9]/g, '')) || 0;
        const invAmount = parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0;
        const newBalance = Math.max(0, currentBalance - invAmount);
        updateItem('clients', client.id, { balance: `${newBalance.toLocaleString()} ر.س` });
      }
    }
    deleteItem('invoices', inv.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الفواتير</h1>
          <p className="text-sm text-gray-500">إدارة فواتير المبيعات والعملاء</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <FilePlus className="w-4 h-4" />
          إنشاء فاتورة جديدة
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
              placeholder="البحث عن فاتورة..."
            />
          </div>
        </div>

        <Table headers={['رقم الفاتورة', 'العميل', 'تاريخ الإصدار', 'إجمالي المبلغ', 'الحالة', 'الإجراءات']}>
          {filteredInvoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">{inv.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.client}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{inv.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{inv.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={inv.status === 'مدفوعة' ? 'success' : inv.status === 'معلقة' ? 'warning' : 'danger'}>
                  {inv.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded transition-colors" title="تحميل"><Download className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(inv)} className="p-1.5 text-gray-500 hover:text-red-600 rounded transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء فاتورة جديدة"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>إنشاء الفاتورة</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select
            label="العميل"
            value={formData.client}
            onChange={(e) => setFormData({...formData, client: e.target.value})}
            options={clients.map(c => ({ label: c.name, value: c.name }))}
            required
          />
          <Input
            label="المبلغ الإجمالي (ر.س)"
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
              { label: 'مدفوعة', value: 'مدفوعة' },
              { label: 'معلقة', value: 'معلقة' },
              { label: 'متأخرة', value: 'متأخرة' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}

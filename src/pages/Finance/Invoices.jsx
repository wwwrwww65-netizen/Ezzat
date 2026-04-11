import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../../components/UI';
import { useData } from '../../context/DataContext';
import {
  FileText,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Building2
} from 'lucide-react';

export default function Invoices() {
  const { invoices, clients, projects, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredInvoices = invoices.filter(inv =>
    (inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || inv.status === statusFilter)
  );

  const stats = [
    { label: 'إجمالي المبالغ', value: invoices.reduce((acc, i) => acc + Number(i.total || 0), 0).toLocaleString() + ' ر.س', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'فواتير غير مدفوعة', value: invoices.filter(i => i.status !== 'مدفوعة').length, icon: Clock, color: 'text-amber-600' },
    { label: 'فواتير الشهر الحالي', value: invoices.length, icon: FileText, color: 'text-blue-600' },
    { label: 'مبالغ متأخرة', value: invoices.filter(i => i.status === 'متأخرة').reduce((acc, i) => acc + Number(i.total || 0), 0).toLocaleString() + ' ر.س', icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الفواتير</h1>
          <p className="text-sm text-gray-500 mt-1">إصدار ومتابعة فواتير العملاء والمستخلصات المالية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إنشاء فاتورة جديدة</span>
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={cn("text-lg font-bold mt-1", stat.color)}>{stat.value}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
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
              placeholder="البحث برقم الفاتورة أو اسم العميل..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={[
                { label: 'جميع الحالات', value: '' },
                { label: 'مدفوعة', value: 'مدفوعة' },
                { label: 'معلقة', value: 'معلقة' },
                { label: 'متأخرة', value: 'متأخرة' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>

        <Table headers={['رقم الفاتورة', 'العميل / المشروع', 'التاريخ', 'المبلغ الإجمالي', 'المدفوع', 'الحالة', 'إجراءات']}>
          {filteredInvoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-primary-600">{inv.id}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{inv.clientName}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> {projects.find(p => p.id === inv.projectId)?.name || 'عام'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
              <td className="px-6 py-4 font-bold text-gray-900">{Number(inv.total).toLocaleString()} ر.س</td>
              <td className="px-6 py-4 text-emerald-600 font-medium">{Number(inv.paidAmount).toLocaleString()} ر.س</td>
              <td className="px-6 py-4">
                <Badge variant={inv.status === 'مدفوعة' ? 'success' : inv.status === 'معلقة' ? 'warning' : 'danger'}>
                  {inv.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                  <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('invoices', inv.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إصدار فاتورة جديدة" className="max-w-3xl">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select label="العميل" options={clients.map(c => ({ label: c.name, value: c.id }))} required />
            <Select label="المشروع المرتبط" options={projects.map(p => ({ label: p.name, value: p.id }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم الفاتورة" defaultValue={`INV-${Date.now().toString().slice(-5)}`} />
            <Input label="تاريخ الفاتورة" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Table headers={['الوصف / البند', 'الكمية', 'سعر الوحدة', 'الإجمالي', '']}>
              <tr>
                <td className="p-2"><Input placeholder="أعمال الحفر..." /></td>
                <td className="p-2 w-24"><Input type="number" defaultValue="1" /></td>
                <td className="p-2 w-32"><Input type="number" placeholder="0.00" /></td>
                <td className="p-2 w-32 font-bold text-center">0.00</td>
                <td className="p-2 w-10 text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></td>
              </tr>
            </Table>
            <div className="p-3 bg-gray-50 flex justify-between">
              <Button variant="ghost" size="sm" type="button"><Plus className="w-3 h-3" /> إضافة بند جديد</Button>
              <div className="text-left space-y-1">
                <p className="text-xs text-gray-500">المجموع: 0.00 ر.س</p>
                <p className="text-xs text-gray-500">الضريبة (15%): 0.00 ر.س</p>
                <p className="text-sm font-bold text-primary-600">الإجمالي: 0.00 ر.س</p>
              </div>
            </div>
          </div>

          <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm" placeholder="ملاحظات وشروط الدفع..." rows="3"></textarea>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary">حفظ واعتماد الفاتورة</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

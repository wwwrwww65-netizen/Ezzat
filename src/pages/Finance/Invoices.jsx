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
  const [data, setData] = useState({ invoices: [], clients: [], projects: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: ''
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (window.electronAPI) {
      const [invoices, clients, projects] = await Promise.all([
        window.electronAPI.queryDb("SELECT * FROM invoices ORDER BY id DESC"),
        window.electronAPI.queryDb("SELECT * FROM clients"),
        window.electronAPI.queryDb("SELECT * FROM projects")
      ]);
      setData({ invoices, clients, projects });
    }
  };

  const deleteItem = async (type, id) => {
    if (window.electronAPI && confirm('هل أنت متأكد من الحذف؟')) {
      await window.electronAPI.executeDb("DELETE FROM invoices WHERE id = ?", [id]);
      fetchData();
    }
  };

  const filteredInvoices = data.invoices.filter(inv =>
    (inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || inv.status === statusFilter)
  );

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    const amount = parseFloat(formData.amount) || 0;
    const tax = amount * 0.15;
    const total = amount + tax;
    const id = `INV-${Date.now().toString().slice(-5)}`;
    const client = data.clients.find(c => c.id.toString() === formData.client_id);
    const clientName = client ? client.name : 'عام';

    await window.electronAPI.executeDb(
      "INSERT INTO invoices (id, client_id, client_name, project_id, date, amount, tax, total, paid_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, formData.client_id || null, clientName, formData.project_id || null, formData.date, amount, tax, total, 0, 'معلقة', formData.notes]
    );

    setShowAddModal(false);
    setFormData({
      client_id: '',
      project_id: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      notes: ''
    });
    fetchData();
  };

  const handleMarkAsPaid = async (inv) => {
    if (!window.electronAPI) return;
    const paymentAmount = prompt(`أدخل المبلغ المدفوع للفاتورة رقم ${inv.id}:`, inv.total - (inv.paid_amount || 0));
    if (!paymentAmount) return;
    
    const amountVal = parseFloat(paymentAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newPaid = (inv.paid_amount || 0) + amountVal;
    const newStatus = newPaid >= inv.total ? 'مدفوعة' : 'معلقة';

    await window.electronAPI.executeDb(
      "UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?",
      [newPaid, newStatus, inv.id]
    );

    // Auto record in Income
    await window.electronAPI.executeDb(
      "INSERT INTO income (title, method, date, amount, status) VALUES (?, ?, ?, ?, ?)",
      [`دفعة للفاتورة ${inv.id}`, 'تحويل بنكي', new Date().toISOString().split('T')[0], amountVal, 'مؤكد']
    );

    alert('تم تسجيل الدفعة بنجاح وتحديث حالة الفاتورة!');
    fetchData();
  };

  const stats = [
    { label: 'إجمالي المبالغ', value: data.invoices.reduce((acc, i) => acc + Number(i.total || 0), 0).toLocaleString() + ' ر.س', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'فواتير غير مدفوعة', value: data.invoices.filter(i => i.status !== 'مدفوعة').length, icon: Clock, color: 'text-amber-600' },
    { label: 'فواتير الشهر الحالي', value: data.invoices.length, icon: FileText, color: 'text-blue-600' },
    { label: 'مبالغ متأخرة', value: data.invoices.filter(i => i.status === 'متأخرة').reduce((acc, i) => acc + Number(i.total || 0), 0).toLocaleString() + ' ر.س', icon: AlertCircle, color: 'text-red-600' },
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
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> {data.projects.find(p => p.id === inv.projectId)?.name || 'عام'}</span>
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
                  <button onClick={() => handleMarkAsPaid(inv)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold" title="إضافة دفعة">
                    <Plus className="w-4 h-4" /> دفعة
                  </button>
                  <button onClick={() => deleteItem('invoices', inv.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إصدار فاتورة جديدة" className="max-w-2xl">
        <form onSubmit={handleAddInvoice} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="العميل" 
              options={[{label: '— اختر العميل —', value: ''}, ...data.clients.map(c => ({ label: c.name, value: c.id }))]} 
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              required 
            />
            <Select 
              label="المشروع المرتبط" 
              options={[{label: '— عام (بدون مشروع) —', value: ''}, ...data.projects.map(p => ({ label: p.name, value: p.id }))]} 
              value={formData.project_id}
              onChange={(e) => setFormData({...formData, project_id: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="تاريخ الفاتورة" 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input 
              label="المبلغ الأساسي (قبل الضريبة)" 
              type="number" 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>المبلغ الأساسي:</span>
              <span className="font-bold">{Number(formData.amount || 0).toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span className="font-bold">{(Number(formData.amount || 0) * 0.15).toLocaleString()} ر.س</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between text-primary-700 font-black text-lg">
              <span>الإجمالي المستحق:</span>
              <span>{(Number(formData.amount || 0) * 1.15).toLocaleString()} ر.س</span>
            </div>
          </div>

          <textarea 
            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" 
            placeholder="ملاحظات وشروط الدفع..." 
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button type="submit" variant="primary">حفظ واعتماد الفاتورة</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

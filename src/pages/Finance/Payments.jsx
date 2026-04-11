import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../../components/UI';
import { useData } from '../../context/DataContext';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  User,
  Building2,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function Payments() {
  const { payments, clients, projects, addItem, deleteItem } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الدفعات</h1>
          <p className="text-sm text-gray-500 mt-1">تسجيل ومتابعة كافة الدفعات الصادرة والواردة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>تسجيل دفعة</span>
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <Table headers={['رقم الدفعة', 'الجهة', 'المشروع', 'المبلغ', 'التاريخ', 'طريقة الدفع', 'الحالة', 'إجراءات']}>
          {payments.map((pay) => (
            <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900">{pay.id}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                   <User className="w-4 h-4 text-gray-400" />
                   <span className="text-sm font-medium">{clients.find(c => c.id === pay.entityId)?.name || 'غير معروف'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {projects.find(p => p.id === pay.projectId)?.name || 'عام'}
              </td>
              <td className="px-6 py-4 font-bold text-emerald-600">{Number(pay.amount).toLocaleString()} ر.س</td>
              <td className="px-6 py-4 text-sm text-gray-500">{pay.date}</td>
              <td className="px-6 py-4 text-sm">{pay.paymentMethod}</td>
              <td className="px-6 py-4">
                <Badge variant={pay.status === 'مؤكد' ? 'success' : 'warning'}>{pay.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <button onClick={() => deleteItem('payments', pay.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="تسجيل دفعة جديدة">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="الجهة (العميل/المورد)" options={clients.map(c => ({ label: c.name, value: c.id }))} />
            <Select label="المشروع" options={projects.map(p => ({ label: p.name, value: p.id }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="المبلغ" type="number" />
            <Input label="التاريخ" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="طريقة الدفع"
              options={[
                { label: 'تحويل بنكي', value: 'تحويل بنكي' },
                { label: 'شيك', value: 'شيك' },
                { label: 'نقداً', value: 'نقداً' },
              ]}
            />
            <Input label="رقم المرجع / العملية" />
          </div>
          <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm" placeholder="ملاحظات الدفعة..." rows="3"></textarea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary">تأكيد الدفعة</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

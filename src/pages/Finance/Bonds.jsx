import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../../components/UI';
import { useData } from '../../context/DataContext';
import {
  FileStack,
  Plus,
  Search,
  Printer,
  Download,
  FileCheck,
  FileWarning,
  Trash2,
  Edit,
  Building2,
  Calendar
} from 'lucide-react';

export default function Bonds() {
  const { bonds, projects, addItem, deleteItem } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">السندات المالية</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة سندات القبض والصرف الرسمية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إنشاء سند جديد</span>
          </Button>
          <Button variant="secondary">
            <Printer className="w-4 h-4" />
            <span>طباعة تقرير</span>
          </Button>
        </div>
      </div>

      <Card>
        <Table headers={['رقم السند', 'النوع', 'المستلم / المسلم', 'المبلغ', 'التاريخ', 'الحساب', 'الحالة', 'إجراءات']}>
          {bonds.map((bond) => (
            <tr key={bond.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900">{bond.id}</td>
              <td className="px-6 py-4">
                <Badge variant={bond.type === 'قبض' ? 'success' : 'danger'}>{bond.type}</Badge>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-800">{bond.entityName}</td>
              <td className="px-6 py-4 font-bold">{Number(bond.amount).toLocaleString()} ر.س</td>
              <td className="px-6 py-4 text-sm text-gray-500">{bond.date}</td>
              <td className="px-6 py-4 text-xs text-gray-500 font-medium">{bond.account}</td>
              <td className="px-6 py-4">
                <Badge variant="success">{bond.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('bonds', bond.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إنشاء سند جديد">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="نوع السند"
              options={[
                { label: 'سند قبض', value: 'قبض' },
                { label: 'سند صرف', value: 'صرف' },
              ]}
            />
            <Input label="رقم السند" defaultValue={`BND-${Date.now().toString().slice(-6)}`} />
          </div>
          <Input label="المستلم / المسلم" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="المبلغ" type="number" required />
            <Input label="التاريخ" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="طريقة الدفع"
              options={[
                { label: 'تحويل بنكي', value: 'bank' },
                { label: 'شيك', value: 'check' },
                { label: 'نقداً', value: 'cash' },
              ]}
            />
            <Select label="الحساب" options={[{ label: 'البنك الأهلي', value: 'snv' }, { label: 'مصرف الراجحي', value: 'rajhi' }]} />
          </div>
          <Select label="المشروع المرتبط" options={projects.map(p => ({ label: p.name, value: p.id }))} />
          <textarea className="w-full p-3 border border-gray-300 rounded-xl text-sm" placeholder="ملاحظات السند..." rows="3"></textarea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary">حفظ واعتماد</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

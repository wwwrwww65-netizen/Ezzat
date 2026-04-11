import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  HardHat,
  Plus,
  Search,
  UserCheck,
  Clock,
  DollarSign,
  Trash2,
  Edit,
  Filter,
  Users,
  Calendar,
  Download,
  Printer
} from 'lucide-react';

export default function Labor() {
  const { employees, projects, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const laborOnly = employees.filter(e => e.role === 'labor' || e.role === 'supervisor');

  const filteredLabor = laborOnly.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">إدارة العمالة والميدان</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة فرق العمل، الحضور والانصراف، والرواتب اليومية</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setShowAddModal(true)} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
             <Plus className="w-4 h-4" /> إضافة عامل
           </Button>
           <Button variant="secondary" className="rounded-xl"><Printer className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-4 flex items-center gap-4 bg-blue-50 border-none shadow-sm">
            <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Users className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي العمالة</p>
               <p className="text-xl font-black text-gray-800">{laborOnly.length}</p>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 bg-emerald-50 border-none shadow-sm">
            <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><UserCheck className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">متواجدين حالياً</p>
               <p className="text-xl font-black text-gray-800">{laborOnly.filter(l => l.status === 'على رأس العمل').length}</p>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 bg-amber-50 border-none shadow-sm">
            <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm"><Clock className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">طلبات إجازة</p>
               <p className="text-xl font-black text-gray-800">1</p>
            </div>
         </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو المهنة..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Select options={[{label: 'بناء', value: 'بناء'}, {label: 'حداد', value: 'حداد'}]} className="w-32" />
              <Button variant="secondary" size="sm" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
           </div>
        </div>

        <Table headers={['العامل', 'المهنة', 'المشروع', 'الأجر اليومي', 'الحالة', 'إجراءات']}>
           {filteredLabor.map(emp => (
             <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center font-bold text-primary-600">{emp.name.charAt(0)}</div>
                      <div>
                         <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold">{emp.nationality}</p>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-600">{emp.profession}</td>
                <td className="px-6 py-4">
                   {emp.projectId ? (
                     <Badge variant="info">{projects.find(p => p.id === emp.projectId)?.name}</Badge>
                   ) : (
                     <span className="text-xs text-gray-400 font-medium italic">غير معين</span>
                   )}
                </td>
                <td className="px-6 py-4 font-black text-gray-800">{emp.dailyRate} ر.س</td>
                <td className="px-6 py-4">
                   <Badge variant={emp.status === 'على رأس العمل' ? 'success' : 'warning'}>{emp.status}</Badge>
                </td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"><Calendar className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteItem('employees', emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
             </tr>
           ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة عامل جديد">
         <form className="space-y-4">
            <Input label="الاسم الكامل" required />
            <div className="grid grid-cols-2 gap-4">
               <Input label="المهنة" placeholder="مثلاً: بناء، سباك" />
               <Input label="الجنسية" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="الأجر اليومي" type="number" />
               <Select label="المشروع الحالي" options={projects.map(p => ({ label: p.name, value: p.id }))} />
            </div>
            <Input label="رقم الهوية / الإقامة" />
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
               <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary">حفظ البيانات</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

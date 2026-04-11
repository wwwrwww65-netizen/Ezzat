import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Construction,
  Plus,
  Search,
  Settings,
  Trash2,
  Edit,
  Truck,
  Wrench,
  Calendar,
  DollarSign,
  AlertTriangle,
  History
} from 'lucide-react';

export default function Equipment() {
  const { equipment, projects, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">إدارة المعدات والآليات</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">متابعة الأسطول، تكاليف التشغيل، وجداول الصيانة</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setShowAddModal(true)} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
             <Plus className="w-4 h-4" /> إضافة معدة
           </Button>
           <Button variant="secondary" className="rounded-xl"><History className="w-4 h-4" /> سجل الصيانة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي المعدات</p>
               <p className="text-xl font-black">{equipment.length}</p>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><UserCheckIcon className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">تعمل حالياً</p>
               <p className="text-xl font-black">{equipment.filter(e => e.status === 'في الموقع').length}</p>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Wrench className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">تحت الصيانة</p>
               <p className="text-xl font-black">0</p>
            </div>
         </Card>
         <Card className="p-4 border-none shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">تكلفة التشغيل اليومي</p>
               <p className="text-xl font-black">{equipment.reduce((acc, e) => acc + Number(e.dailyCost), 0)} ر.س</p>
            </div>
         </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث باسم المعدة أو الرقم التسلسلي..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="rounded-xl"><Settings className="w-4 h-4" /></Button>
           </div>
        </div>

        <Table headers={['المعدة / الآلية', 'الرقم التسلسلي', 'الموقع الحالي', 'التكلفة (يومي/شهري)', 'آخر صيانة', 'الحالة', 'إجراءات']}>
           {filteredEquipment.map(item => (
             <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                <td className="px-6 py-4 text-xs font-mono text-gray-400">{item.serialNumber}</td>
                <td className="px-6 py-4">
                   {item.projectId ? (
                     <Badge variant="info">{projects.find(p => p.id === item.projectId)?.name}</Badge>
                   ) : (
                     <Badge variant="neutral">المستودع العام</Badge>
                   )}
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-700">{item.dailyCost} ر.س</span>
                      <span className="text-[10px] text-gray-400 font-bold">{item.monthlyCost} ر.س / شهر</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 font-bold">{item.lastMaintenance}</td>
                <td className="px-6 py-4">
                   <Badge variant={item.status === 'متوفر' ? 'success' : 'warning'}>{item.status}</Badge>
                </td>
                <td className="px-6 py-4 text-gray-400">
                   <div className="flex gap-2">
                      <button className="p-1.5 hover:text-primary-600 transition-colors"><Wrench className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
             </tr>
           ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة معدة جديدة للأسطول">
         <form className="space-y-4">
            <Input label="اسم المعدة" required />
            <div className="grid grid-cols-2 gap-4">
               <Input label="النوع" placeholder="مثلاً: رافعة، جرافة" />
               <Input label="الرقم التسلسلي" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="التكلفة اليومية" type="number" />
               <Input label="التكلفة الشهرية" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="تاريخ آخر صيانة" type="date" />
               <Select label="الموقع الحالي" options={projects.map(p => ({ label: p.name, value: p.id }))} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
               <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary">حفظ المعدة</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

function UserCheckIcon({className}) {
  return <Construction className={className} />;
}

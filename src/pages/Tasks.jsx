import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  Briefcase,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2
} from 'lucide-react';

export default function Tasks() {
  const { tasks, projects, employees, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priorityColors = {
    'عالية': 'bg-red-100 text-red-700',
    'متوسطة': 'bg-amber-100 text-amber-700',
    'منخفضة': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">إدارة المهام والمتابعة</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">توزيع المهام على الفريق ومتابعة المواعيد النهائية</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
          <Plus className="w-4 h-4" /> إضافة مهمة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><CheckSquare className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي المهام</p>
               <p className="text-xl font-black">{tasks.length}</p>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">قيد التنفيذ</p>
               <p className="text-xl font-black">{tasks.filter(t => t.status === 'قيد التنفيذ').length}</p>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">مهام متأخرة</p>
               <p className="text-xl font-black">0</p>
            </div>
         </Card>
         <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
               <p className="text-[10px] text-gray-400 font-bold uppercase">مهام مكتملة</p>
               <p className="text-xl font-black">0</p>
            </div>
         </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في المهام..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="rounded-xl"><Filter className="w-4 h-4" /> تصفية</Button>
           </div>
        </div>

        <Table headers={['المهمة', 'المشروع', 'المسؤول', 'تاريخ الاستحقاق', 'الأولوية', 'الحالة', '']}>
           {filteredTasks.map(task => (
             <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                   <p className="text-sm font-bold text-gray-800">{task.title}</p>
                </td>
                <td className="px-6 py-4">
                   <Badge variant="neutral">{projects.find(p => p.id === task.projectId)?.name || 'عام'}</Badge>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-600 font-bold">
                         {employees.find(e => e.id === task.assignedTo)?.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium">{employees.find(e => e.id === task.assignedTo)?.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.dueDate}</td>
                <td className="px-6 py-4">
                   <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", priorityColors[task.priority])}>
                      {task.priority}
                   </span>
                </td>
                <td className="px-6 py-4">
                   <Badge variant={task.status === 'قيد التنفيذ' ? 'warning' : 'neutral'}>{task.status}</Badge>
                </td>
                <td className="px-6 py-4">
                   <button className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
             </tr>
           ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مهمة جديدة">
         <form className="space-y-4">
            <Input label="عنوان المهمة" required />
            <Select label="تعيين لمشروع" options={projects.map(p => ({ label: p.name, value: p.id }))} />
            <div className="grid grid-cols-2 gap-4">
               <Select label="المسؤول" options={employees.map(e => ({ label: e.name, value: e.id }))} />
               <Input label="تاريخ التسليم" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Select label="الأولوية" options={[{label: 'عالية', value: 'عالية'}, {label: 'متوسطة', value: 'متوسطة'}, {label: 'منخفضة', value: 'منخفضة'}]} />
               <Select label="الحالة" options={[{label: 'لم تبدأ', value: 'لم تبدأ'}, {label: 'قيد التنفيذ', value: 'قيد التنفيذ'}]} />
            </div>
            <textarea className="w-full p-3 border border-transparent bg-gray-50 rounded-xl text-sm" placeholder="تفاصيل المهمة..." rows="3"></textarea>
            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary">حفظ المهمة</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

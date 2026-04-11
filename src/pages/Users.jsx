import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Users as UsersIcon,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Key,
  MoreVertical,
  Mail,
  Lock,
  Edit,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function Users() {
  const { users, addItem, updateItem, deleteItem } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const roleColors = {
    'admin': 'bg-red-100 text-red-700',
    'engineer': 'bg-blue-100 text-blue-700',
    'accountant': 'bg-emerald-100 text-emerald-700',
    'supervisor': 'bg-amber-100 text-amber-700',
    'client': 'bg-purple-100 text-purple-700',
  };

  const roleNames = {
    'admin': 'مدير النظام',
    'engineer': 'مهندس',
    'accountant': 'محاسب',
    'supervisor': 'مشرف',
    'client': 'عميل',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">المستخدمون والصلاحيات</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة حسابات المستخدمين، الأدوار، وصلاحيات الوصول للنظام</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
          <Plus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center border-none shadow-sm bg-gradient-to-br from-primary-600 to-primary-700 text-white">
           <Shield className="w-10 h-10 mx-auto mb-4 opacity-50" />
           <h3 className="text-lg font-black">أدوار النظام</h3>
           <p className="text-sm opacity-80 mt-1 mb-6">يتم تحديد الوصول بناءً على الدور الممنوح لكل مستخدم</p>
           <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(roleNames).map(([key, name]) => (
                <span key={key} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase">{name}</span>
              ))}
           </div>
        </Card>

        <Card className="p-6 md:col-span-2">
           <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input
                   placeholder="البحث عن مستخدم بالاسم أو البريد..."
                   className="pr-10 rounded-xl"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <Button variant="secondary" className="rounded-xl"><ShieldAlert className="w-4 h-4" /> الصلاحيات</Button>
           </div>

           <Table headers={['المستخدم', 'الدور', 'الحالة', 'آخر ظهور', 'إجراءات']}>
              {users.filter(u => u.name.includes(searchTerm)).map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">{user.name.charAt(0)}</div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {roleNames[user.role] || user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <Badge variant={user.status === 'نشط' ? 'success' : 'danger'}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-medium italic">منذ يومين</td>
                  <td className="px-6 py-4">
                     <div className="flex gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"><Key className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteItem('users', user.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </td>
                </tr>
              ))}
           </Table>
        </Card>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مستخدم جديد">
         <form className="space-y-4">
            <Input label="الاسم الكامل" required />
            <Input label="البريد الإلكتروني" type="email" required />
            <div className="grid grid-cols-2 gap-4">
               <Select
                 label="الدور"
                 options={Object.entries(roleNames).map(([val, name]) => ({ label: name, value: val }))}
               />
               <Select
                 label="الحالة"
                 options={[{label: 'نشط', value: 'نشط'}, {label: 'معطل', value: 'معطل'}]}
               />
            </div>
            <Input label="كلمة المرور المؤقتة" type="password" />
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> صلاحيات سريعة</p>
               <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-primary-600" /> السماح بتعديل الفواتير
               </label>
               <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-primary-600" /> الوصول للتقارير المالية
               </label>
               <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="rounded text-primary-600" /> حذف السجلات
               </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary">حفظ المستخدم</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

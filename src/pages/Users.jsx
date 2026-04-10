import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { Plus, Search, User, Shield, Edit, Trash2 } from 'lucide-react';

export default function Users() {
  const { users, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'موظف',
    status: 'نشط'
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'موظف', status: 'نشط' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateItem('users', editingUser.id, formData);
    } else {
      addItem('users', { ...formData, id: Date.now() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-500">التحكم في صلاحيات الوصول للنظام</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          إضافة مستخدم جديد
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
              placeholder="البحث عن مستخدم..."
            />
          </div>
        </div>

        <Table headers={['المستخدم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'الإجراءات']}>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0] : '?'}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  {user.role}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.status === 'نشط' ? 'success' : 'danger'}>
                  {user.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(user)} className="p-1 hover:text-amber-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('users', user.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="الاسم الكامل"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Select
            label="الدور الوظيفي"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            options={[
              { label: 'مدير النظام', value: 'مدير النظام' },
              { label: 'محاسب', value: 'محاسب' },
              { label: 'مشرف مشروع', value: 'مشرف مشروع' },
              { label: 'موظف', value: 'موظف' },
            ]}
          />
          <Select
            label="الحالة"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { label: 'نشط', value: 'نشط' },
              { label: 'غير نشط', value: 'غير نشط' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}

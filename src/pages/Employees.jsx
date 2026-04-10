import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { Plus, Search, User, Briefcase, DollarSign, Edit, Trash2 } from 'lucide-react';

export default function Employees() {
  const { employees, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    salary: '',
    status: 'على رأس العمل'
  });

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({ ...employee });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        position: '',
        department: '',
        salary: '',
        status: 'على رأس العمل'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      updateItem('employees', editingEmployee.id, formData);
    } else {
      addItem('employees', { ...formData, id: Date.now() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
          <p className="text-sm text-gray-500">إدارة الكادر الوظيفي والرواتب</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          إضافة موظف جديد
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
              placeholder="البحث عن موظف..."
            />
          </div>
        </div>

        <Table headers={['الاسم', 'المسمى الوظيفي', 'القسم', 'الراتب', 'الحالة', 'الإجراءات']}>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{employee.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{employee.salary}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={employee.status === 'على رأس العمل' ? 'success' : employee.status === 'إجازة' ? 'warning' : 'danger'}>
                  {employee.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(employee)} className="p-1 hover:text-amber-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('employees', employee.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="اسم الموظف"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="المسمى الوظيفي"
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            required
          />
          <Input
            label="القسم"
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
          />
          <Input
            label="الراتب الأساسي"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
          />
          <Select
            label="الحالة"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { label: 'على رأس العمل', value: 'على رأس العمل' },
              { label: 'إجازة', value: 'إجازة' },
              { label: 'مستقيل', value: 'مستقيل' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}

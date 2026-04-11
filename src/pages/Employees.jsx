import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Users,
  Plus,
  Search,
  UserSquare2,
  HardHat,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  TrendingUp,
  Download,
  Edit,
  Trash2,
  Phone,
  CreditCard,
  History
} from 'lucide-react';

export default function Employees() {
  const { employees, projects, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter === '' || emp.role === roleFilter)
  );

  const stats = [
    { label: 'إجمالي الموظفين', value: employees.length, icon: Users, color: 'text-blue-600' },
    { label: 'في المواقع', value: employees.filter(e => e.projectId).length, icon: HardHat, color: 'text-emerald-600' },
    { label: 'إجمالي الرواتب', value: (employees.reduce((acc, e) => acc + Number(e.salary || 0), 0)).toLocaleString() + ' ر.س', icon: DollarSign, color: 'text-primary-600' },
    { label: 'طلبات إجازة', value: '2', icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الموارد البشرية</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة بيانات الموظفين، العمالة، الرواتب والمهام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إضافة موظف/عامل</span>
          </Button>
          <Button variant="secondary">
            <History className="w-4 h-4" />
            <span>سجل الحضور</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl bg-gray-50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
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
              placeholder="البحث بالاسم أو المهنة أو رقم الهوية..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={[
                { label: 'جميع الأدوار', value: '' },
                { label: 'مهندس', value: 'engineer' },
                { label: 'محاسب', value: 'accountant' },
                { label: 'مشرف', value: 'supervisor' },
                { label: 'عامل', value: 'labor' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <Table headers={['الموظف', 'المهنة / الدور', 'المشروع الحالي', 'الراتب', 'تاريخ الانضمام', 'الحالة', 'إجراءات']}>
          {filteredEmployees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {emp.phone}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-800 font-medium">{emp.profession}</span>
                  <span className="text-xs text-gray-400 uppercase">{emp.role}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {emp.projectId ? (
                  <Badge variant="info">{projects.find(p => p.id === emp.projectId)?.name}</Badge>
                ) : (
                  <span className="text-xs text-gray-400">مقر الشركة</span>
                )}
              </td>
              <td className="px-6 py-4 font-bold text-gray-900">
                {Number(emp.salary).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">ر.س</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{emp.joinDate}</td>
              <td className="px-6 py-4">
                <Badge variant={emp.status === 'على رأس العمل' ? 'success' : 'warning'}>{emp.status}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('employees', emp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة موظف أو عامل جديد" className="max-w-2xl">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="الاسم الكامل" required />
            <Input label="رقم الجوال" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الجنسية"
              options={[
                { label: 'سعودي', value: 'سعودي' },
                { label: 'مصري', value: 'مصري' },
                { label: 'هندي', value: 'هندي' },
                { label: 'باكستاني', value: 'باكستاني' },
              ]}
            />
            <Input label="رقم الهوية / الإقامة" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="المسمى الوظيفي" placeholder="مثلاً: مهندس موقع" />
            <Select
              label="الدور في النظام"
              options={[
                { label: 'مهندس', value: 'engineer' },
                { label: 'محاسب', value: 'accountant' },
                { label: 'مشرف', value: 'supervisor' },
                { label: 'عامل', value: 'labor' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="الراتب الشهري" type="number" />
            <Input label="الأجر اليومي (للمياومة)" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاريخ الانضمام" type="date" />
            <Select
              label="تعيين لمشروع"
              options={projects.map(p => ({ label: p.name, value: p.id }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary">حفظ الموظف</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

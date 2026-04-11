import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, clients, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'نشط',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ ...project });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        client: '',
        status: 'نشط',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateItem('projects', editingProject.id, formData);
    } else {
      addItem('projects', { ...formData, id: Date.now() });

      // Update client project count (simple logic)
      const client = clients.find(c => c.name === formData.client);
      if (client) {
        updateItem('clients', client.id, { projects: (client.projects || 0) + 1 });
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المشاريع</h1>
          <p className="text-sm text-gray-500">إدارة وتتبع جميع مشاريع الشركة</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          إضافة مشروع جديد
        </Button>
      </div>

      <Card className="p-4 overflow-hidden" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="البحث عن مشروع..."
            />
          </div>
        </div>

        <Table headers={['اسم المشروع', 'العميل', 'الحالة', 'تاريخ البدء', 'الإنجاز', 'الإجراءات']}>
          {filteredProjects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{project.name}</span>
                  <span className="text-xs text-gray-500">ID: PRJ-{project.id.toString().slice(-3)}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.client}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={project.status === 'نشط' ? 'success' : project.status === 'مكتمل' ? 'info' : project.status === 'متأخر' ? 'danger' : 'warning'}>
                  {project.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{project.startDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{project.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/projects/${project.id}`)} className="p-1 hover:text-primary-600 transition-colors" title="عرض"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleOpenModal(project)} className="p-1 hover:text-amber-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('projects', project.id)} className="p-1 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingProject ? 'حفظ التعديلات' : 'إضافة المشروع'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="اسم المشروع"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Select
            label="العميل"
            value={formData.client}
            onChange={(e) => setFormData({...formData, client: e.target.value})}
            options={clients.map(c => ({ label: c.name, value: c.name }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الحالة"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              options={[
                { label: 'نشط', value: 'نشط' },
                { label: 'مكتمل', value: 'مكتمل' },
                { label: 'متأخر', value: 'متأخر' },
                { label: 'قيد الانتظار', value: 'قيد الانتظار' },
              ]}
            />
            <Input
              label="نسبة الإنجاز (%)"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
            />
          </div>
          <Input
            label="تاريخ البدء"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}

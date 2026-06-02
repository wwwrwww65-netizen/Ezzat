import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Archive,
  Building2,
  DollarSign,
  TrendingUp,
  User,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const emptyForm = {
    name: '',
    project_number: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    client_id: '',
    type: 'فيلا',
    location: '',
    city: 'الرياض',
    budget: 0,
    contract_value: 0,
    start_date: '',
    end_date: '',
    status: 'نشط',
    description: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!window.electronAPI) return;
    try {
      // Fetch Projects with Client Name
      const prjs = await window.electronAPI.queryDb(`
        SELECT p.*, c.name as client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.id DESC
      `);
      setProjects(prjs || []);

      // Fetch Clients for Dropdown
      const cls = await window.electronAPI.queryDb('SELECT id, name FROM clients ORDER BY name ASC');
      setClients(cls || []);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProjects = projects.filter(prj =>
    ((prj.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (prj.project_number || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || prj.status === statusFilter) &&
    (showArchived ? prj.status === 'مكتمل' : prj.status !== 'مكتمل')
  );

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    await window.electronAPI.executeDb(
      `INSERT INTO projects (name, project_number, client_id, type, location, city, budget, contract_value, start_date, end_date, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.name,
        formData.project_number,
        formData.client_id ? Number(formData.client_id) : null,
        formData.type,
        formData.location,
        formData.city,
        formData.budget,
        formData.contract_value,
        formData.start_date,
        formData.end_date,
        formData.status,
        formData.description
      ]
    );

    setShowAddModal(false);
    fetchData();
    setFormData(emptyForm);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      project_number: project.project_number || '',
      client_id: project.client_id || '',
      type: project.type || 'فيلا',
      location: project.location || '',
      city: project.city || 'الرياض',
      budget: project.budget || 0,
      contract_value: project.contract_value || 0,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      status: project.status || 'نشط',
      description: project.description || ''
    });
    setShowEditModal(true);
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!window.electronAPI || !editingProject) return;
    await window.electronAPI.executeDb(
      `UPDATE projects SET name=?, project_number=?, client_id=?, type=?, location=?, city=?, budget=?, contract_value=?, start_date=?, end_date=?, status=?, description=? WHERE id=?`,
      [
        formData.name, formData.project_number,
        formData.client_id ? Number(formData.client_id) : null,
        formData.type, formData.location, formData.city,
        Number(formData.budget), Number(formData.contract_value),
        formData.start_date, formData.end_date,
        formData.status, formData.description,
        editingProject.id
      ]
    );
    setShowEditModal(false);
    setEditingProject(null);
    setFormData(emptyForm);
    fetchData();
  };

  const handleDeleteClick = (id) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      await window.electronAPI.executeDb('DELETE FROM projects WHERE id=?', [projectToDelete]);
      setProjectToDelete(null);
      fetchData();
    }
  };

  const copyProject = async (project) => {
    await window.electronAPI.executeDb(
      `INSERT INTO projects (name, project_number, client_id, type, location, city, budget, contract_value, start_date, end_date, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${project.name} (نسخة)`,
        `PRJ-${Date.now().toString().slice(-4)}`,
        project.client_id,
        project.type,
        project.location,
        project.city,
        project.budget,
        project.contract_value,
        project.start_date,
        project.end_date,
        project.status,
        project.description
      ]
    );
    fetchData();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'نشط': return 'success';
      case 'مكتمل': return 'info';
      case 'متأخر': return 'danger';
      case 'قيد الانتظار': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-600" />
            إدارة المشاريع
          </h1>
          <p className="text-sm text-gray-500 mt-1">متابعة سير العمل، الميزانيات، والجداول الزمنية لكافة المشاريع</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-200 border-none">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مشروع جديد
          </Button>
          <Button onClick={() => setShowArchived(!showArchived)} variant={showArchived ? 'primary' : 'secondary'} className="font-bold border-none shadow-sm">
            <Archive className="w-4 h-4 ml-2" />
            {showArchived ? 'العودة للمشاريع' : 'الأرشيف'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-none">إجمالي القيمة</Badge>
          </div>
          <h4 className="text-sm font-medium opacity-80">قيمة العقود الإجمالية</h4>
          <h2 className="text-3xl font-black mt-1">
            {projects.reduce((acc, p) => acc + Number(p.contract_value || 0), 0).toLocaleString()} <span className="text-sm font-bold opacity-80">ر.س</span>
          </h2>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">المشاريع النشطة</p>
              <h3 className="text-2xl font-black text-gray-800">{projects.filter(p => p.status === 'نشط').length}</h3>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">المشاريع المكتملة</p>
              <h3 className="text-2xl font-black text-gray-800">{projects.filter(p => p.status === 'مكتمل').length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="بحث باسم المشروع أو رقم العقد..."
            className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            className="w-40 bg-gray-50/50"
            options={[
              { label: 'جميع الحالات', value: '' },
              { label: 'نشط', value: 'نشط' },
              { label: 'قيد الانتظار', value: 'قيد الانتظار' },
              { label: 'مكتمل', value: 'مكتمل' },
              { label: 'متأخر', value: 'متأخر' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
           <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-400 font-bold bg-white rounded-xl border border-dashed border-gray-200">
             لا توجد مشاريع مضافة حالياً.
           </div>
        ) : filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 p-0 overflow-hidden border-none bg-white">
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(project)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="تعديل المشروع"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => copyProject(project)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="نسخ المشروع"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteClick(project.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="حذف المشروع"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <Link to={`/projects/${project.id}`} className="block">
                <h3 className="text-xl font-black text-gray-800 group-hover:text-primary-600 transition-colors mb-1">{project.name}</h3>
                <p className="text-xs font-mono text-gray-400 mb-5">{project.project_number}</p>
              </Link>

              <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-primary-400 shrink-0" />
                  <span className="font-bold">{project.client_name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{project.location} {project.city && ` - ${project.city}`}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>التسليم: {project.end_date || 'غير محدد'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-bold">نسبة الإنجاز</span>
                  <span className="text-primary-600 font-black">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 transition-all duration-500 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/80 px-6 py-4 flex justify-between items-center border-t border-gray-100">
              <div className="text-xs">
                <p className="text-gray-400 font-bold mb-0.5">التكلفة الفعلية</p>
                <p className="font-black text-gray-700 text-sm">{Number(project.actual_cost || 0).toLocaleString()} <span className="text-[10px] text-gray-400">ر.س</span></p>
              </div>
              <Link to={`/projects/${project.id}`}>
                <Button size="sm" variant="ghost" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-black">
                  عرض التفاصيل <Eye className="w-4 h-4 mr-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setFormData(emptyForm); }} title="تعديل بيانات المشروع" className="max-w-4xl">
        <form className="space-y-4" onSubmit={handleEditProject}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">اسم المشروع <span className="text-red-500">*</span></label>
               <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">العميل</label>
               <Select
                 options={[{label: '— اختر العميل —', value: ''}, ...clients.map(c => ({ label: c.name, value: c.id }))]}
                 value={formData.client_id}
                 onChange={e => setFormData({...formData, client_id: e.target.value})}
               />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">نوع المشروع</label>
               <Select
                 options={[
                   { label: 'فيلا', value: 'فيلا' },
                   { label: 'عمارة', value: 'عمارة' },
                   { label: 'مجمع تجاري', value: 'مجمع تجاري' },
                   { label: 'ترميم', value: 'ترميم' },
                 ]}
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">الموقع / الحي</label>
               <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">المدينة</label>
               <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
               <Select
                 options={[
                   { label: 'نشط', value: 'نشط' },
                   { label: 'قيد الانتظار', value: 'قيد الانتظار' },
                   { label: 'مكتمل', value: 'مكتمل' },
                   { label: 'متأخر', value: 'متأخر' },
                 ]}
                 value={formData.status}
                 onChange={e => setFormData({...formData, status: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">قيمة العقد</label>
               <Input type="number" value={formData.contract_value} onChange={e => setFormData({...formData, contract_value: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">الميزانية التقديرية</label>
               <Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البدء</label>
               <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التسليم المتوقع</label>
               <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">وصف المشروع وملاحظات</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
              rows="3"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => { setShowEditModal(false); setFormData(emptyForm); }} className="flex-1 font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold border-none shadow-md">حفظ التعديلات ✓</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مشروع جديد" className="max-w-4xl">
        <form className="space-y-4" onSubmit={handleAddProject}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">اسم المشروع <span className="text-red-500">*</span></label>
               <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">العميل</label>
               <Select
                 options={[{label: '— اختر العميل —', value: ''}, ...clients.map(c => ({ label: c.name, value: c.id }))]}
                 value={formData.client_id}
                 onChange={e => setFormData({...formData, client_id: e.target.value})}
               />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">نوع المشروع</label>
               <Select
                 options={[
                   { label: 'فيلا', value: 'فيلا' },
                   { label: 'عمارة', value: 'عمارة' },
                   { label: 'مجمع تجاري', value: 'مجمع تجاري' },
                   { label: 'ترميم', value: 'ترميم' },
                 ]}
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">الموقع / الحي</label>
               <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">المدينة</label>
               <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">قيمة العقد (المتفق عليها)</label>
               <Input type="number" value={formData.contract_value} onChange={e => setFormData({...formData, contract_value: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">الميزانية التقديرية (التكلفة)</label>
               <Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البدء</label>
               <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التسليم المتوقع</label>
               <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">وصف المشروع وأي ملاحظات فنية</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
              rows="3"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="flex-1 font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold border-none shadow-md">إنشاء المشروع</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!projectToDelete} 
        onClose={() => setProjectToDelete(null)} 
        title="تأكيد الحذف" 
        className="max-w-md"
      >
        <div className="p-2 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-800 mb-2">هل أنت متأكد من حذف هذا المشروع؟</h3>
          <p className="text-sm text-gray-500 font-bold mb-6">لا يمكن التراجع عن هذه الخطوة بعد تنفيذها.</p>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => setProjectToDelete(null)} className="font-bold flex-1">إلغاء</Button>
            <Button variant="danger" onClick={confirmDeleteProject} className="font-bold flex-1 shadow-none">نعم، احذف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

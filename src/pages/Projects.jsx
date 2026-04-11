import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Calendar,
  Clock,
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
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const { projects, clients, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    clientId: '',
    type: 'فيلا',
    location: '',
    city: 'الرياض',
    budget: 0,
    contractValue: 0,
    startDate: '',
    endDate: '',
    status: 'نشط',
    description: ''
  });

  const filteredProjects = projects.filter(prj =>
    (prj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     prj.projectNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || prj.status === statusFilter)
  );

  const handleAddProject = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === Number(formData.clientId));
    addItem('projects', {
      ...formData,
      id: Date.now(),
      clientName: client?.name || 'غير محدد',
      progress: 0,
      actualCost: 0
    });
    setShowAddModal(false);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المشاريع</h1>
          <p className="text-sm text-gray-500 mt-1">متابعة سير العمل، الميزانيات، والجداول الزمنية لكافة المشاريع</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>إضافة مشروع جديد</span>
          </Button>
          <Button variant="secondary">
            <Archive className="w-4 h-4" />
            <span>الأرشيف</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-none">إجمالي القيمة</Badge>
          </div>
          <h4 className="text-sm font-medium opacity-80">قيمة العقود الإجمالية</h4>
          <h2 className="text-3xl font-bold mt-1">
            {projects.reduce((acc, p) => acc + Number(p.contractValue || 0), 0).toLocaleString()} <span className="text-sm font-normal opacity-80">ر.س</span>
          </h2>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">المشاريع النشطة</p>
              <h3 className="text-xl font-bold text-gray-800">{projects.filter(p => p.status === 'نشط').length}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">المشاريع المكتملة</p>
              <h3 className="text-xl font-bold text-gray-800">{projects.filter(p => p.status === 'مكتمل').length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="بحث باسم المشروع، رقم العقد، أو العميل..."
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            className="w-40"
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
          <Button variant="secondary"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-md transition-shadow p-0 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem('projects', project.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <Link to={`/projects/${project.id}`} className="block">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors mb-1">{project.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{project.projectNumber}</p>
              </Link>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{project.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>تاريخ التسليم: {project.endDate}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-medium">نسبة الإنجاز</span>
                  <span className="text-primary-600 font-bold">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
              <div className="text-xs">
                <p className="text-gray-400">التكلفة الفعلية</p>
                <p className="font-bold text-gray-700">{Number(project.actualCost || 0).toLocaleString()} ر.س</p>
              </div>
              <Link to={`/projects/${project.id}`}>
                <Button size="sm" variant="ghost" className="text-primary-600 hover:text-primary-700 font-bold">عرض التفاصيل <Eye className="w-4 h-4" /></Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مشروع جديد" className="max-w-4xl">
        <form className="space-y-4" onSubmit={handleAddProject}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="اسم المشروع" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Select
              label="العميل"
              options={clients.map(c => ({ label: c.name, value: c.id }))}
              value={formData.clientId}
              onChange={e => setFormData({...formData, clientId: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="نوع المشروع"
              options={[
                { label: 'فيلا', value: 'فيلا' },
                { label: 'عمارة', value: 'عمارة' },
                { label: 'مجمع تجاري', value: 'مجمع تجاري' },
                { label: 'ترميم', value: 'ترميم' },
              ]}
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            />
            <Input label="الموقع / الحي" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            <Input label="المدينة" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="قيمة العقد (المتفق عليها)" type="number" value={formData.contractValue} onChange={e => setFormData({...formData, contractValue: e.target.value})} />
            <Input label="الميزانية التقديرية (التكلفة)" type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="تاريخ البدء" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            <Input label="تاريخ التسليم المتوقع" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
          </div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-xl text-sm"
            placeholder="وصف المشروع وأي ملاحظات فنية..."
            rows="3"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          ></textarea>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary" type="submit">إنشاء المشروع</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

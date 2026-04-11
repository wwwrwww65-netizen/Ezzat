import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Layers,
  FileText,
  Users,
  Settings,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calculator,
  HardHat,
  Truck
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    projectStages,
    projectFiles,
    inventory,
    addItem,
    updateItem,
    deleteItem,
    currentRole
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const project = projects.find(p => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">المشروع غير موجود</p>
        <Button onClick={() => navigate('/projects')}>العودة للمشاريع</Button>
      </div>
    );
  }

  const stages = projectStages.filter(s => s.projectId === project.id);
  const files = projectFiles.filter(f => f.projectId === project.id);

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: Layers },
    { id: 'stages', name: 'مراحل التنفيذ', icon: Clock },
    { id: 'quantities', name: 'الحصر والكميات', icon: Calculator },
    { id: 'files', name: 'المخططات والملفات', icon: FileText },
    { id: 'labor', name: 'العمالة والمعدات', icon: HardHat },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
              <Badge variant={project.status === 'نشط' ? 'success' : project.status === 'مكتمل' ? 'info' : 'warning'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {project.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Settings className="w-4 h-4" /> تعديل المشروع
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4" /> تحديث التقدم
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <Overview project={project} stages={stages} />}
        {activeTab === 'stages' && <Stages stages={stages} projectId={project.id} />}
        {activeTab === 'quantities' && <Quantities inventory={inventory} />}
        {activeTab === 'files' && <Files files={files} />}
        {activeTab === 'labor' && <Labor />}
      </div>
    </div>
  );
}

function Overview({ project, stages }) {
  const stats = [
    { label: 'المساحة', value: `${project.area} م2`, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'عدد الأدوار', value: project.floors, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'الميزانية المخططة', value: `${project.budget.toLocaleString()} ر.س`, icon: Calculator, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'التكلفة الفعلية', value: `${project.actualCost.toLocaleString()} ر.س`, icon: Calculator, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="p-4 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
          </div>
        </Card>
      ))}

      <Card className="md:col-span-2 p-6" title="تفاصيل المشروع">
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">نوع المشروع</span>
            <span className="text-sm font-semibold">{project.type}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">تاريخ البداية</span>
            <span className="text-sm font-semibold">{project.startDate}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">تاريخ التسليم المتوقع</span>
            <span className="text-sm font-semibold">{project.endDate}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">العميل</span>
            <span className="text-sm font-semibold">{project.client}</span>
          </div>
        </div>
      </Card>

      <Card className="md:col-span-2 p-6" title="التقدم العام">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
               <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * project.progress / 100)} className="text-primary-600" />
             </svg>
             <span className="absolute text-2xl font-bold">{project.progress}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-4">تم إنجاز {project.progress}% من إجمالي بنود المشروع</p>
        </div>
      </Card>
    </div>
  );
}

function Stages({ stages, projectId }) {
  const { addItem, updateItem } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="p-0 overflow-hidden" title="مراحل التنفيذ"
      footer={
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> إضافة مرحلة
        </Button>
      }
    >
      <Table headers={['المرحلة', 'الحالة', 'التقدم', 'تاريخ البدء', 'تاريخ الانتهاء', 'الإجراءات']}>
        {stages.map(stage => (
          <tr key={stage.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{stage.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant={stage.status === 'مكتمل' ? 'success' : stage.status === 'نشط' ? 'warning' : 'neutral'}>
                {stage.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: `${stage.progress}%` }}></div>
                </div>
                <span className="text-xs">{stage.progress}%</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{stage.startDate}</td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{stage.endDate}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
               <Button variant="ghost" size="sm">تعديل</Button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Quantities({ inventory }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">حصر المواد والتكاليف</h3>
        <Button size="sm"><Calculator className="w-4 h-4" /> بدء حصر جديد</Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <Table headers={['الصنف', 'الوحدة', 'الكمية المطلوبة', 'سعر الوحدة', 'الهالك (%)', 'إجمالي التكلفة']}>
          {inventory.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{item.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{item.unitPrice} ر.س</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">%{item.waste}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                {(item.quantity * item.unitPrice * (1 + item.waste / 100)).toLocaleString()} ر.س
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function Files({ files }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {files.map(file => (
        <Card key={file.id} className="p-4 hover:border-primary-300 transition-colors group">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-lg ${file.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <button className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <h4 className="font-bold text-gray-800 truncate">{file.name}</h4>
            <div className="flex items-center gap-2 mt-1">
               <Badge variant="neutral" className="text-[10px]">{file.type}</Badge>
               <span className="text-[10px] text-gray-500">{file.size}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">إصدار: {file.version}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
               <Download className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
      <button className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-all gap-2">
        <Plus className="w-8 h-8" />
        <span className="text-sm font-medium">رفع ملف جديد</span>
      </button>
    </div>
  );
}

function Labor() {
  const { laborTeams, equipment } = useData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="الفرق العاملة في الموقع" className="p-0 overflow-hidden">
        <Table headers={['الفريق', 'القائد', 'العدد', 'اليومية']}>
          {laborTeams.map(team => (
             <tr key={team.id}>
               <td className="px-6 py-4 text-sm font-bold">{team.name}</td>
               <td className="px-6 py-4 text-sm">{team.leader}</td>
               <td className="px-6 py-4 text-sm">{team.members} عمال</td>
               <td className="px-6 py-4 text-sm font-mono">{team.dailyRate} ر.س</td>
             </tr>
          ))}
        </Table>
      </Card>
      <Card title="المعدات والآليات" className="p-0 overflow-hidden">
        <Table headers={['المعدة', 'النوع', 'الحالة', 'التكلفة اليومية']}>
          {equipment.map(item => (
             <tr key={item.id}>
               <td className="px-6 py-4 text-sm font-bold">{item.name}</td>
               <td className="px-6 py-4 text-sm">{item.type}</td>
               <td className="px-6 py-4 text-sm">
                 <Badge variant={item.status === 'متوفر' ? 'success' : 'warning'}>{item.status}</Badge>
               </td>
               <td className="px-6 py-4 text-sm font-mono">{item.dailyCost} ر.س</td>
             </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

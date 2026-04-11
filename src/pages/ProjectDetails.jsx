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
  Truck,
  Building2,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  MessageSquare,
  ClipboardList,
  Activity,
  Printer,
  FileSearch,
  CheckSquare
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
    currentRole,
    invoices,
    expenses,
    employees,
    equipment
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
  const projectInvoices = invoices.filter(i => i.projectId === project.id);
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const projectTeam = employees.filter(e => e.projectId === project.id);
  const projectEquipment = equipment.filter(e => e.projectId === project.id);

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: Layers },
    { id: 'contract', name: 'العقد والمالية', icon: DollarSign },
    { id: 'stages', name: 'مراحل التنفيذ', icon: Clock },
    { id: 'quantities', name: 'الحصر والكميات', icon: Calculator },
    { id: 'files', name: 'المخططات', icon: FileText },
    { id: 'labor', name: 'الفريق والمعدات', icon: HardHat },
    { id: 'reports', name: 'التقارير اليومية', icon: ClipboardList },
    { id: 'photos', name: 'الصور', icon: ImageIcon },
    { id: 'changes', name: 'أوامر التغيير', icon: Activity },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/projects')} className="p-2.5 hover:bg-gray-50 rounded-xl transition-all border border-gray-100 shadow-sm">
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-gray-800 tracking-tight">{project.name}</h1>
                  <Badge variant={project.status === 'نشط' ? 'success' : 'warning'}>{project.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {project.location}</span>
                  <span className="text-sm text-gray-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {project.projectNumber}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" className="rounded-xl"><Printer className="w-4 h-4" /> طباعة البروفايل</Button>
              <Button size="md" className="rounded-xl shadow-lg shadow-primary-200"><Plus className="w-4 h-4" /> تحديث الحالة</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'overview' && <Overview project={project} team={projectTeam} />}
        {activeTab === 'contract' && <Contract project={project} invoices={projectInvoices} expenses={projectExpenses} />}
        {activeTab === 'stages' && <Stages stages={stages} projectId={project.id} />}
        {activeTab === 'quantities' && <Quantities projectId={project.id} />}
        {activeTab === 'files' && <Files files={files} />}
        {activeTab === 'labor' && <Labor team={projectTeam} equipment={projectEquipment} />}
        {activeTab === 'reports' && <DailyReports projectId={project.id} />}
        {activeTab === 'photos' && <ProjectPhotos projectId={project.id} />}
        {activeTab === 'changes' && <ChangeOrders projectId={project.id} />}
      </div>
    </div>
  );
}

// Sub-components
function Overview({ project, team }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <p className="text-xs font-bold text-blue-600 uppercase">قيمة العقد</p>
            <h3 className="text-2xl font-black mt-1">{project.contractValue?.toLocaleString()} ر.س</h3>
          </Card>
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-xs font-bold text-emerald-600 uppercase">التكلفة الفعلية</p>
            <h3 className="text-2xl font-black mt-1">{project.actualCost?.toLocaleString()} ر.س</h3>
          </Card>
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <p className="text-xs font-bold text-amber-600 uppercase">المساحة الإجمالية</p>
            <h3 className="text-2xl font-black mt-1">{project.area} م2</h3>
          </Card>
        </div>

        <Card title="وصف المشروع وأهدافه" className="p-6">
          <p className="text-gray-600 leading-relaxed text-sm">{project.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div>
               <p className="text-xs text-gray-400">تاريخ البدء</p>
               <p className="font-bold text-gray-700">{project.startDate}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400">التسليم المتوقع</p>
               <p className="font-bold text-gray-700">{project.endDate}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400">مدير المشروع</p>
               <p className="font-bold text-gray-700">{project.projectManager}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400">المهندس المسؤول</p>
               <p className="font-bold text-gray-700">{project.engineerInCharge}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="إحصائيات التقدم" className="p-6 text-center">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
               <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={464} strokeDashoffset={464 - (464 * project.progress / 100)} className="text-primary-600 transition-all duration-1000" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-gray-800">{project.progress}%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">إنجاز</span>
             </div>
          </div>
          <p className="text-sm text-gray-500 mt-6 leading-tight">المشروع حالياً في مرحلة <span className="font-bold text-gray-800">أعمدة الدور الأرضي</span></p>
        </Card>

        <Card title="طاقم العمل بالموقع" noPadding>
          <div className="divide-y divide-gray-50">
            {team.map(emp => (
              <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700">{emp.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">{emp.profession}</p>
                  </div>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-primary-600"><Plus className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Contract({ project, invoices, expenses }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="تفاصيل العقد المالي" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
               <span className="text-sm text-gray-500 font-bold">قيمة العقد الإجمالية</span>
               <span className="font-black text-gray-800 text-lg">{project.contractValue?.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
               <span className="text-sm text-emerald-700 font-bold">إجمالي المحصل</span>
               <span className="font-black text-emerald-800 text-lg">{invoices.filter(i => i.status === 'مدفوعة').reduce((acc, i) => acc + Number(i.total), 0).toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
               <span className="text-sm text-red-700 font-bold">المبالغ المستحقة</span>
               <span className="font-black text-red-800 text-lg">{invoices.filter(i => i.status !== 'مدفوعة').reduce((acc, i) => acc + Number(i.total), 0).toLocaleString()} ر.س</span>
            </div>
            <div className="mt-6">
               <Button variant="primary" className="w-full">تعديل شروط العقد <Edit className="w-4 h-4" /></Button>
            </div>
          </div>
        </Card>

        <Card title="ملخص التكاليف" className="p-6">
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
             <div className="text-center">
                <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">الرسم البياني لتكاليف المشروع</p>
             </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
               <p className="text-xs text-gray-400">نسبة الربح المتوقعة</p>
               <p className="text-xl font-black text-primary-600">{project.profitMargin}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
               <p className="text-xs text-gray-400">الانحراف المالي</p>
               <p className="text-xl font-black text-emerald-600">-2.4%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="أحدث المعاملات المالية" noPadding>
        <Table headers={['البيان', 'التاريخ', 'المبلغ', 'النوع', 'الحالة']}>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td className="px-6 py-4 text-sm font-bold text-gray-800">{inv.id} - مستخلص</td>
              <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
              <td className="px-6 py-4 font-black">{Number(inv.total).toLocaleString()} ر.س</td>
              <td className="px-6 py-4"><Badge variant="info">دخل</Badge></td>
              <td className="px-6 py-4"><Badge variant={inv.status === 'مدفوعة' ? 'success' : 'warning'}>{inv.status}</Badge></td>
            </tr>
          ))}
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td className="px-6 py-4 text-sm font-bold text-gray-800">{exp.category}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{exp.date}</td>
              <td className="px-6 py-4 font-black text-red-600">{Number(exp.amount).toLocaleString()} ر.س</td>
              <td className="px-6 py-4"><Badge variant="danger">مصروف</Badge></td>
              <td className="px-6 py-4"><Badge variant="success">معتمد</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function Stages({ stages, projectId }) {
  return (
    <Card className="p-0 overflow-hidden" title="الجدول الزمني ومراحل الإنجاز"
      footer={
        <div className="flex justify-between items-center">
           <span className="text-xs text-gray-400">آخر تحديث: منذ ساعتين</span>
           <Button size="sm" variant="primary">إضافة مرحلة جديدة <Plus className="w-4 h-4" /></Button>
        </div>
      }
    >
      <Table headers={['المرحلة', 'الحالة', 'التقدم', 'المسؤول', 'البداية', 'النهاية', '']}>
        {stages.map(stage => (
          <tr key={stage.id} className="hover:bg-gray-50 group">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-800">{stage.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant={stage.status === 'مكتمل' ? 'success' : stage.status === 'نشط' ? 'warning' : 'neutral'}>{stage.status}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: `${stage.progress}%` }}></div>
                </div>
                <span className="text-xs font-bold">{stage.progress}%</span>
              </div>
            </td>
            <td className="px-6 py-4 text-xs font-medium text-gray-600 italic underline underline-offset-4 decoration-primary-200">م. خالد إبراهيم</td>
            <td className="px-6 py-4 text-xs font-bold text-gray-500">{stage.startDate}</td>
            <td className="px-6 py-4 text-xs font-bold text-gray-500">{stage.endDate}</td>
            <td className="px-6 py-4">
               <button className="p-1.5 text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Quantities({ projectId }) {
  const { inventory } = useData();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800">حصر الكميات (BOQ)</h3>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> تصدير</Button>
           <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> إضافة بند حصر</Button>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm">
        <Table headers={['البند / المادة', 'الوحدة', 'الكمية المخططة', 'الكمية المنفذة', 'السعر التقديري', 'الإجمالي التقديري']}>
          {inventory.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-bold text-gray-800 block">{item.name}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">مرحلة العظم</span>
              </td>
              <td className="px-6 py-4 text-sm font-medium">{item.unit}</td>
              <td className="px-6 py-4 text-sm font-black">{item.quantity}</td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-emerald-600">{Math.floor(item.quantity * 0.6)}</span>
                    <Badge variant="neutral" className="text-[8px]">60%</Badge>
                 </div>
              </td>
              <td className="px-6 py-4 text-sm font-bold">{item.buyPrice} ر.س</td>
              <td className="px-6 py-4 text-sm font-black">{(item.quantity * item.buyPrice).toLocaleString()} ر.س</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function Files({ files }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h3 className="text-lg font-black text-gray-800">مركز المخططات والوثائق المعتمدة</h3>
         <Button variant="primary"><Plus className="w-4 h-4" /> رفع مخطط جديد</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map(file => (
          <Card key={file.id} className="p-4 hover:shadow-lg transition-all border-gray-100 group cursor-pointer relative overflow-hidden">
            <div className={`p-4 rounded-2xl mb-4 inline-block ${file.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="font-black text-gray-800 text-sm leading-tight mb-1 group-hover:text-primary-600 transition-colors">{file.name}</h4>
            <div className="flex items-center gap-2 mb-4">
               <Badge variant="neutral" className="text-[10px]">{file.category}</Badge>
               <span className="text-[10px] text-gray-400 font-bold">{file.size}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
               <span className="text-[10px] text-gray-400 font-medium italic">إصدار {file.version}</span>
               <div className="flex gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-primary-600 bg-gray-50 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg transition-colors"><FileSearch className="w-4 h-4" /></button>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Labor({ team, equipment }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="فريق العمل الميداني" className="p-0 overflow-hidden" footer={<Button variant="ghost" className="w-full text-xs text-primary-600">إضافة عضو للفريق <Plus className="w-3 h-3" /></Button>}>
        <Table headers={['الموظف', 'المهنة', 'الحضور اليوم', '']}>
          {team.map(emp => (
             <tr key={emp.id}>
               <td className="px-6 py-4">
                 <div className="flex items-center gap-2 font-bold text-gray-800">
                    <div className="w-7 h-7 bg-primary-50 rounded-full flex items-center justify-center text-[10px] text-primary-600">{emp.name.charAt(0)}</div>
                    {emp.name}
                 </div>
               </td>
               <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">{emp.profession}</td>
               <td className="px-6 py-4"><Badge variant="success">حاضر</Badge></td>
               <td className="px-6 py-4"><button className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
             </tr>
          ))}
        </Table>
      </Card>
      <Card title="المعدات والآليات الثقيلة" className="p-0 overflow-hidden" footer={<Button variant="ghost" className="w-full text-xs text-primary-600">طلب معدة إضافية <Truck className="w-3 h-3" /></Button>}>
        <Table headers={['المعدة', 'الحالة', 'تكلفة يومية', '']}>
          {equipment.map(item => (
             <tr key={item.id}>
               <td className="px-6 py-4 text-sm font-black text-gray-800">{item.name}</td>
               <td className="px-6 py-4"><Badge variant={item.status === 'في الموقع' ? 'info' : 'warning'}>{item.status}</Badge></td>
               <td className="px-6 py-4 text-sm font-bold">{item.dailyCost} ر.س</td>
               <td className="px-6 py-4 text-gray-300"><Settings className="w-4 h-4" /></td>
             </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function DailyReports({ projectId }) {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800">سجل التقارير اليومية للموقع</h3>
          <Button variant="primary"><Plus className="w-4 h-4" /> إضافة تقرير جديد</Button>
       </div>
       <div className="space-y-3">
          {[1, 2, 3].map(i => (
             <Card key={i} className="p-5 flex items-center justify-between hover:border-primary-200 cursor-pointer group transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      {10 + i} <br/> <span className="text-[8px] uppercase">ديسمبر</span>
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-800">تقرير يوم {10 + i} ديسمبر 2023</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><CheckSquare className="w-3.5 h-3.5" /> تم إنجاز صب أعمدة الدور الأرضي بنجاح</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-left hidden md:block">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">بواسطة</p>
                      <p className="text-sm font-bold text-gray-700">م. خالد إبراهيم</p>
                   </div>
                   <Button variant="ghost" size="sm" className="bg-gray-50 group-hover:bg-primary-600 group-hover:text-white transition-all rounded-xl">عرض التقرير</Button>
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
}

function ProjectPhotos({ projectId }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
       {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="aspect-square bg-gray-100 rounded-2xl border border-gray-100 relative overflow-hidden group cursor-pointer">
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white rounded-xl text-primary-600 scale-75 group-hover:scale-100 transition-transform"><FileSearch className="w-5 h-5" /></button>
                <button className="p-2 bg-white rounded-xl text-red-600 scale-75 group-hover:scale-100 transition-transform"><Trash2 className="w-5 h-5" /></button>
             </div>
             <div className="absolute bottom-2 right-2 left-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-bold text-gray-800 truncate">صورة التأسيس رقم {i}</div>
             <ImageIcon className="w-8 h-8 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
       ))}
       <button className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-all gap-2">
          <Plus className="w-8 h-8" />
          <span className="text-xs font-bold uppercase tracking-widest">رفع صور</span>
       </button>
    </div>
  );
}

function ChangeOrders({ projectId }) {
  return (
    <Card className="p-0 overflow-hidden" title="سجل أوامر التغيير والموافقات الفنية">
       <Table headers={['رقم الأمر', 'البيان والتعديل', 'التكلفة الإضافية', 'الحالة', 'تاريخ الطلب', '']}>
          <tr className="hover:bg-red-50/30">
             <td className="px-6 py-4 text-sm font-black">CO-2023-01</td>
             <td className="px-6 py-4 text-sm text-gray-700 font-medium">تعديل مساحة المسبح وزيادة العمق</td>
             <td className="px-6 py-4 font-black text-red-600">+12,500 ر.س</td>
             <td className="px-6 py-4"><Badge variant="warning">في انتظار العميل</Badge></td>
             <td className="px-6 py-4 text-xs font-bold text-gray-400">2023-12-05</td>
             <td className="px-6 py-4"><Button size="sm" variant="secondary">التفاصيل</Button></td>
          </tr>
          <tr>
             <td className="px-6 py-4 text-sm font-black">CO-2023-02</td>
             <td className="px-6 py-4 text-sm text-gray-700 font-medium">تغيير نوع الرخام للمجالس (إيطالي درجة أولى)</td>
             <td className="px-6 py-4 font-black text-emerald-600">+45,000 ر.س</td>
             <td className="px-6 py-4"><Badge variant="success">معتمد</Badge></td>
             <td className="px-6 py-4 text-xs font-bold text-gray-400">2023-11-28</td>
             <td className="px-6 py-4"><Button size="sm" variant="secondary">التفاصيل</Button></td>
          </tr>
       </Table>
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import {
  ArrowRight, Calendar, MapPin, Layers, FileText, Users, Settings, Plus, Download, Trash2, CheckCircle2, Clock, AlertTriangle, Calculator, HardHat, Truck, Building2, DollarSign, TrendingUp, Image as ImageIcon, MessageSquare, ClipboardList, Activity, Printer, FileSearch, CheckSquare, Edit, MoreVertical
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [boq, setBoq] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeForm, setFinanceForm] = useState({ contract_value: 0, budget: 0, actual_cost: 0, description: '' });

  const handleOpenFinance = () => {
    if (!project) return;
    setFinanceForm({
      contract_value: project.contract_value || 0,
      budget: project.budget || 0,
      actual_cost: project.actual_cost || 0,
      description: project.description || ''
    });
    setShowFinanceModal(true);
  };

  const handleSaveFinance = async (e) => {
    e.preventDefault();
    await window.electronAPI.executeDb(
      'UPDATE projects SET contract_value=?, budget=?, actual_cost=?, description=? WHERE id=?',
      [financeForm.contract_value, financeForm.budget, financeForm.actual_cost, financeForm.description, project.id]
    );
    setShowFinanceModal(false);
    fetchProjectDetails();
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    if (!window.electronAPI) return;
    setLoading(true);
    try {
      // جلب بيانات المشروع
      const projectRes = await window.electronAPI.queryDb('SELECT * FROM projects WHERE id = ?', [id]);
      if (projectRes.length > 0) setProject(projectRes[0]);
      
      // جلب المخططات
      const filesRes = await window.electronAPI.queryDb('SELECT * FROM project_files WHERE project_id = ?', [id]);
      setFiles(filesRes);
      
      // جلب بنود الحصر (BOQ)
      const boqRes = await window.electronAPI.queryDb('SELECT * FROM boq_items WHERE project_id = ?', [id]);
      setBoq(boqRes);

      // جلب اليوميات
      const logsRes = await window.electronAPI.queryDb('SELECT * FROM daily_logs WHERE project_id = ?', [id]);
      setLogs(logsRes);

      // جلب المهام
      const tasksRes = await window.electronAPI.queryDb('SELECT * FROM tasks WHERE project_id = ?', [id]);
      setTasks(tasksRes);

      // جلب المصروفات
      const expensesRes = await window.electronAPI.queryDb('SELECT * FROM expenses WHERE project_id = ?', [id]);
      setExpenses(expensesRes);

      // جلب الفواتير (Income) والمشتريات لمعرفة التكلفة الكلية إذا أمكن
      const purchasesRes = await window.electronAPI.queryDb('SELECT * FROM purchases WHERE project_id = ?', [id]);

      if (projectRes.length > 0) {
        let dynamicProject = { ...projectRes[0] };

        // 1. حساب نسبة الإنجاز بناءً على المهام
        if (tasksRes.length > 0) {
          const totalProgress = tasksRes.reduce((acc, t) => acc + (t.progress || 0), 0);
          dynamicProject.progress = Math.round(totalProgress / tasksRes.length);

          const validStartDates = tasksRes.map(t => t.start_date).filter(Boolean).sort();
          if (validStartDates.length > 0 && !dynamicProject.start_date) {
            dynamicProject.start_date = validStartDates[0];
          }

          const validEndDates = tasksRes.map(t => t.end_date).filter(Boolean).sort().reverse();
          if (validEndDates.length > 0 && !dynamicProject.end_date) {
            dynamicProject.end_date = validEndDates[0];
          }
        }

        // 2. حساب التكلفة الفعلية (المصروفات + المشتريات)
        let totalCost = 0;
        if (expensesRes.length > 0) {
          totalCost += expensesRes.reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);
        }
        if (purchasesRes && purchasesRes.length > 0) {
          totalCost += purchasesRes.reduce((acc, pur) => acc + (parseFloat(pur.total) || 0), 0);
        }
        // تحديث التكلفة الفعلية إذا لم يضعها المستخدم يدوياً أو اجعلها تلقائية دائماً
        dynamicProject.actual_cost = totalCost > 0 ? totalCost : dynamicProject.actual_cost;

        setProject(dynamicProject);
      }

    } catch (e) {
      console.error('Error fetching project details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">المشروع غير موجود</p>
        <Button onClick={() => navigate('/projects')}>العودة للمشاريع</Button>
      </div>
    );
  }

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
                  <span className="text-sm text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {project.location || project.city}</span>
                  <span className="text-sm text-gray-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {project.project_number}</span>
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
        {activeTab === 'overview' && <Overview project={project} />}
        {activeTab === 'contract' && <Contract project={project} expenses={expenses} onEdit={handleOpenFinance} />}
        {activeTab === 'stages' && <Stages tasks={tasks} projectId={project.id} navigate={navigate} />}
        {activeTab === 'quantities' && <Quantities boq={boq} projectId={project.id} navigate={navigate} />}
        {activeTab === 'files' && <Files files={files} navigate={navigate} />}
        {activeTab === 'labor' && <Labor />}
        {activeTab === 'reports' && <DailyReports logs={logs} projectId={project.id} navigate={navigate} />}
        {activeTab === 'photos' && <ProjectPhotos />}
        {activeTab === 'changes' && <ChangeOrders />}
      </div>

      {/* Edit Finance Modal */}
      <Modal isOpen={showFinanceModal} onClose={() => setShowFinanceModal(false)} title="تعديل تفاصيل العقد والمالية" className="max-w-xl">
        <form onSubmit={handleSaveFinance} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">قيمة العقد الإجمالية</label>
              <Input type="number" value={financeForm.contract_value} onChange={e => setFinanceForm({...financeForm, contract_value: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الميزانية التقديرية</label>
              <Input type="number" value={financeForm.budget} onChange={e => setFinanceForm({...financeForm, budget: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">التكلفة الفعلية (المصروفات)</label>
              <Input type="number" value={financeForm.actual_cost} onChange={e => setFinanceForm({...financeForm, actual_cost: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">شروط العقد وملاحظات المشروع</label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                rows="4"
                value={financeForm.description}
                onChange={e => setFinanceForm({...financeForm, description: e.target.value})}
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setShowFinanceModal(false)} className="font-bold">إلغاء</Button>
            <Button type="submit" className="font-bold shadow-none">حفظ التعديلات</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Sub-components
function Overview({ project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <p className="text-xs font-bold text-blue-600 uppercase">قيمة العقد</p>
            <h3 className="text-2xl font-black mt-1">{project.contract_value?.toLocaleString() || 0} ر.س</h3>
          </Card>
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-xs font-bold text-emerald-600 uppercase">التكلفة الفعلية</p>
            <h3 className="text-2xl font-black mt-1">{project.actual_cost?.toLocaleString() || 0} ر.س</h3>
          </Card>
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <p className="text-xs font-bold text-amber-600 uppercase">الميزانية</p>
            <h3 className="text-2xl font-black mt-1">{project.budget?.toLocaleString() || 0} ر.س</h3>
          </Card>
        </div>

        <Card title="وصف المشروع وأهدافه" className="p-6">
          <p className="text-gray-600 leading-relaxed text-sm">{project.description || 'لا يوجد وصف للمشروع'}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div>
               <p className="text-xs text-gray-400">تاريخ البدء</p>
               <p className="font-bold text-gray-700">{project.start_date || 'غير محدد'}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400">التسليم المتوقع</p>
               <p className="font-bold text-gray-700">{project.end_date || 'غير محدد'}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400">نوع المشروع</p>
               <p className="font-bold text-gray-700">{project.type || 'غير محدد'}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400">المدينة</p>
               <p className="font-bold text-gray-700">{project.city || 'الرياض'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="إحصائيات التقدم" className="p-6 text-center">
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
               <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={464} strokeDashoffset={464 - (464 * (project.progress || 0) / 100)} className="text-primary-600 transition-all duration-1000" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-gray-800">{project.progress || 0}%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">إنجاز</span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Contract({ project, expenses, onEdit }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="تفاصيل العقد المالي" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
               <span className="text-sm text-gray-500 font-bold">قيمة العقد الإجمالية</span>
               <span className="font-black text-gray-800 text-lg">{project.contract_value?.toLocaleString() || 0} ر.س</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
               <span className="text-sm text-red-700 font-bold">المصروفات الفعلية</span>
               <span className="font-black text-red-800 text-lg">{project.actual_cost?.toLocaleString() || 0} ر.س</span>
            </div>
            <div className="mt-6">
               <Button onClick={onEdit} variant="primary" className="w-full">تعديل شروط العقد والمالية <Edit className="w-4 h-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
      <Card title="أحدث المعاملات المالية" noPadding>
        <Table headers={['البيان', 'التاريخ', 'المبلغ', 'النوع']}>
          {expenses && expenses.map(exp => (
            <tr key={exp.id}>
              <td className="px-6 py-4 text-sm font-bold text-gray-800">{exp.description || exp.category}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{exp.expense_date}</td>
              <td className="px-6 py-4 font-black text-red-600">{Number(exp.amount).toLocaleString()} ر.س</td>
              <td className="px-6 py-4"><Badge variant="danger">مصروف</Badge></td>
            </tr>
          ))}
          {(!expenses || expenses.length === 0) && (
            <tr><td colSpan="4" className="text-center py-4 text-gray-500">لا توجد حركات مالية</td></tr>
          )}
        </Table>
      </Card>
    </div>
  );
}

function Stages({ tasks, projectId, navigate }) {
  return (
    <Card className="p-0 overflow-hidden" title="الجدول الزمني ومراحل الإنجاز"
      footer={
        <div className="flex justify-between items-center">
           <Button onClick={() => navigate('/tasks')} size="sm" variant="primary">إدارة المهام والمراحل <Plus className="w-4 h-4" /></Button>
        </div>
      }
    >
      <Table headers={['المرحلة / المهمة', 'الحالة', 'التقدم', 'البداية', 'النهاية', '']}>
        {tasks && tasks.map(task => (
          <tr key={task.id} className="hover:bg-gray-50 group">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-800">{task.title}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant={task.status === 'مكتمل' ? 'success' : task.status === 'قيد التنفيذ' ? 'warning' : 'neutral'}>{task.status}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: `${task.progress || 0}%` }}></div>
                </div>
                <span className="text-xs font-bold">{task.progress || 0}%</span>
              </div>
            </td>
            <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.start_date}</td>
            <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.end_date}</td>
            <td className="px-6 py-4">
               <button className="p-1.5 text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></button>
            </td>
          </tr>
        ))}
        {(!tasks || tasks.length === 0) && (
          <tr><td colSpan="6" className="text-center py-4 text-gray-500">لا توجد مهام أو مراحل مضافة</td></tr>
        )}
      </Table>
    </Card>
  );
}

function Quantities({ boq, projectId, navigate }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800">حصر الكميات (BOQ)</h3>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> تصدير</Button>
           <Button onClick={() => navigate('/boq')} variant="primary" size="sm">إدارة جدول الكميات <ArrowRight className="w-4 h-4 mr-1" /></Button>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm">
        <Table headers={['البند', 'الوحدة', 'الكمية', 'السعر التقديري', 'الإجمالي التقديري']}>
          {boq && boq.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-bold text-gray-800 block">{item.description}</span>
              </td>
              <td className="px-6 py-4 text-sm font-medium">{item.unit}</td>
              <td className="px-6 py-4 text-sm font-black">{item.qty}</td>
              <td className="px-6 py-4 text-sm font-bold">{item.est_rate} ر.س</td>
              <td className="px-6 py-4 text-sm font-black">{(item.qty * item.est_rate).toLocaleString()} ر.س</td>
            </tr>
          ))}
          {(!boq || boq.length === 0) && (
            <tr><td colSpan="5" className="text-center py-4 text-gray-500">جدول الكميات فارغ</td></tr>
          )}
        </Table>
      </Card>
    </div>
  );
}

function Files({ files, navigate }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h3 className="text-lg font-black text-gray-800">مركز المخططات والوثائق</h3>
         <Button onClick={() => navigate('/files')} variant="primary">إدارة الملفات والمخططات <ArrowRight className="w-4 h-4 mr-1" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files && files.map(file => (
          <Card key={file.id} className="p-4 hover:shadow-lg transition-all border-gray-100 group cursor-pointer relative overflow-hidden">
            <div className={`p-4 rounded-2xl mb-4 inline-block ${file.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="font-black text-gray-800 text-sm leading-tight mb-1 group-hover:text-primary-600 transition-colors">{file.name}</h4>
            <div className="flex items-center gap-2 mb-4">
               <Badge variant="neutral" className="text-[10px]">{file.type}</Badge>
               <span className="text-[10px] text-gray-400 font-bold">{file.size}</span>
            </div>
          </Card>
        ))}
        {(!files || files.length === 0) && (
          <div className="col-span-full py-8 text-center text-gray-500">لا توجد ملفات مرفوعة للمشروع</div>
        )}
      </div>
    </div>
  );
}

function Labor() {
  return (
    <Card className="py-8 text-center text-gray-500">
      <HardHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p>إدارة الفريق والمعدات قيد التطوير للربط مع قواعد البيانات الجديدة</p>
    </Card>
  );
}

function DailyReports({ logs, projectId, navigate }) {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800">سجل التقارير اليومية للموقع</h3>
          <Button onClick={() => navigate('/daily-logs')} variant="primary">إدارة التقارير اليومية <ArrowRight className="w-4 h-4 mr-1" /></Button>
       </div>
       <div className="space-y-3">
          {logs && logs.map(log => (
             <Card key={log.id} className="p-5 flex items-center justify-between hover:border-primary-200 cursor-pointer group transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      {log.log_date?.split('-')[2] || '00'}
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-800">تقرير يوم {log.log_date}</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><CheckSquare className="w-3.5 h-3.5" /> التقدم: {log.progress}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <Button variant="ghost" size="sm" className="bg-gray-50 group-hover:bg-primary-600 group-hover:text-white transition-all rounded-xl">عرض التقرير</Button>
                </div>
             </Card>
          ))}
          {(!logs || logs.length === 0) && (
             <div className="py-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">لا توجد تقارير يومية</div>
          )}
       </div>
    </div>
  );
}

function ProjectPhotos() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
       <button className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-all gap-2">
          <Plus className="w-8 h-8" />
          <span className="text-xs font-bold uppercase tracking-widest">رفع صور</span>
       </button>
    </div>
  );
}

function ChangeOrders() {
  return (
    <Card className="py-8 text-center text-gray-500">
      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p>لا توجد أوامر تغيير مسجلة حالياً</p>
    </Card>
  );
}

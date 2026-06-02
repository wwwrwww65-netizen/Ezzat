import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Briefcase,
  Wallet,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  Clock,
  Download,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Building2,
  Camera
} from 'lucide-react';

export default function ClientPanel() {
  const [data, setData] = useState({ clients: [], projects: [], tasks: [], invoices: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (window.electronAPI) {
        const [clients, projects, tasks, invoices] = await Promise.all([
          window.electronAPI.queryDb("SELECT * FROM clients"),
          window.electronAPI.queryDb("SELECT * FROM projects"),
          window.electronAPI.queryDb("SELECT * FROM tasks"),
          window.electronAPI.queryDb("SELECT * FROM invoices")
        ]);
        setData({ clients, projects, tasks: tasks || [], invoices: invoices || [] });
        if (clients && clients.length > 0) {
          setSelectedClientId(clients[0].id.toString());
        }
      }
    };
    fetchData();
  }, []);

  const currentClient = data.clients.find(c => c.id.toString() === selectedClientId) || data.clients[0] || { id: 0, name: 'شركة الأفق للمقاولات', email: 'info@horizon.com', phone: '0501234567' };
  
  // Get projects related to this client
  const clientProjects = data.projects.filter(p => p.client_id === currentClient.id);
  const fallbackProjects = [
    { id: 'mock1', name: 'مشروع مجمع الرياض السكني', progress: 75, status: 'قيد التنفيذ', contract_value: 2500000, actual_cost: 1500000, start_date: '2023-01-15', end_date: '2024-06-30' },
    { id: 'mock2', name: 'فيلا خاصة - الدمام', progress: 100, status: 'مكتمل', contract_value: 800000, actual_cost: 800000, start_date: '2022-05-01', end_date: '2023-02-28' }
  ];
  const displayProjects = clientProjects.length > 0 ? clientProjects : fallbackProjects;

  const activeProject = displayProjects.find(p => p.id.toString() === selectedProjectId) || displayProjects[0];
  const projectTasks = data.tasks.filter(t => t.project_id === activeProject?.id);

  // Sort tasks: Completed first, In Progress second, Not Started last
  const sortedTasks = [...projectTasks].sort((a, b) => {
    const statusOrder = {
      'مكتملة': 1,
      'قيد التنفيذ': 2,
      'لم تبدأ': 3
    };
    const orderA = statusOrder[a.status] || 4;
    const orderB = statusOrder[b.status] || 4;
    
    if (orderA !== orderB) return orderA - orderB;
    
    // If same status, sort by start_date
    return new Date(a.start_date || 0) - new Date(b.start_date || 0);
  });

  // Derive dates from tasks if project dates are empty
  const validTaskStartDates = projectTasks.map(t => t.start_date).filter(Boolean);
  const validTaskEndDates = projectTasks.map(t => t.end_date).filter(Boolean);
  
  const derivedStartDate = activeProject?.start_date || 
    (validTaskStartDates.length > 0 ? validTaskStartDates.sort()[0] : 'غير محدد');
    
  const derivedEndDate = activeProject?.end_date || 
    (validTaskEndDates.length > 0 ? validTaskEndDates.sort().reverse()[0] : 'غير محدد');

  const projectInvoices = data.invoices.filter(i => i.projectId === activeProject?.id || i.project_id === activeProject?.id);

  return (
    <div className="space-y-6">
      {/* Admin Selectors */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex w-full md:w-auto gap-4 flex-1 max-w-2xl">
          <div className="flex-1">
            <Select 
              label="عرض العميل"
              options={data.clients.map(c => ({ label: c.name, value: c.id.toString() }))}
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Select 
              label="المشروع المعروض"
              options={displayProjects.map(p => ({ label: p.name, value: p.id.toString() }))}
              value={activeProject?.id?.toString() || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            />
          </div>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          هذه الشاشة تعرض لك ما يراه العميل من زاويته.
        </div>
      </div>

      {/* Header Profile */}
      <div className="bg-gradient-to-l from-primary-900 to-primary-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 bg-white/10 border-4 border-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center text-4xl font-bold">
            {currentClient.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{currentClient.name}</h1>
            <p className="text-primary-100 mt-1 font-medium text-lg">بوابة العميل الرقمية</p>
            <div className="flex gap-4 mt-3 text-sm text-primary-50">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {currentClient.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {currentClient.email}</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-3">
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowUpdateModal(true)}>تحديث البيانات</Button>
          <Button className="bg-white text-primary-900 hover:bg-primary-50" onClick={() => setShowSupportModal(true)}>تواصل مع الدعم</Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Project Highlight */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-2 h-full bg-primary-500"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge variant="primary" className="mb-2">المشروع الحالي</Badge>
                <h2 className="text-2xl font-black text-gray-800">{activeProject?.name || 'لا يوجد مشروع نشط'}</h2>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 font-bold mb-1">نسبة الإنجاز</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-primary-600">{activeProject?.progress || 0}%</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${activeProject?.progress || 0}%` }}></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">تاريخ البدء</p>
                <p className="font-bold text-gray-800">{derivedStartDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Clock className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">تاريخ التسليم</p>
                <p className="font-bold text-gray-800">{derivedEndDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Wallet className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">قيمة العقد</p>
                <p className="font-bold text-gray-800">{Number(activeProject?.contract_value || 0).toLocaleString()} ر.س</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <TrendingUp className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">المدفوع</p>
                <p className="font-bold text-gray-800">{Number(activeProject?.actual_cost || 0).toLocaleString()} ر.س</p>
              </div>
            </div>
          </Card>

          {/* Project Tasks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-500" /> إنجاز المهام
              </h3>
            </div>
            <div className="space-y-3">
              {sortedTasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">لا توجد مهام مسجلة لهذا المشروع بعد.</div>
              ) : (
                sortedTasks.map(task => (
                  <div key={task.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-1">من {task.start_date || 'غير محدد'} إلى {task.end_date || 'غير محدد'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={task.status === 'مكتملة' ? 'success' : task.status === 'قيد التنفيذ' ? 'warning' : 'neutral'}>
                        {task.status}
                      </Badge>
                      <span className="text-[10px] font-black text-gray-400">{task.progress || 0}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" /> آخر المستخلصات والفواتير
            </h3>
            <div className="space-y-3">
              {projectInvoices.length === 0 ? (
                <div className="text-center py-6 text-gray-500">لا توجد فواتير أو مستخلصات مسجلة لهذا المشروع.</div>
              ) : (
                projectInvoices.map((invoice, i) => (
                  <div key={invoice.id || i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-primary-100 hover:bg-primary-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${invoice.status === 'مدفوعة' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{invoice.id || `فاتورة ${i+1}`}</p>
                        <p className="text-xs text-gray-500">{invoice.date || 'تاريخ غير محدد'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-gray-900">{Number(invoice.total || 0).toLocaleString()} ر.س</p>
                      <Badge variant={invoice.status === 'مدفوعة' ? 'success' : invoice.status === 'معلقة' ? 'warning' : 'danger'} className="mt-1">{invoice.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowStatementModal(true)}>عرض كشف الحساب بالكامل</Button>
          </Card>

          <Card className="p-6 bg-primary-900 text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <h3 className="text-lg font-bold mb-2 relative z-10">هل لديك استفسار أو طلب تعديل؟</h3>
            <p className="text-sm text-primary-200 mb-6 relative z-10">يمكنك إرسال طلبات التعديل الهندسي أو الاستفسارات مباشرة إلى مدير المشروع.</p>
            <Button className="w-full bg-white text-primary-900 hover:bg-primary-50 relative z-10" onClick={() => setShowRequestModal(true)}>إرسال طلب جديد</Button>
          </Card>
        </div>

      </div>

      {/* Modals */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="تحديث بيانات العميل">
        <div className="space-y-4">
          <Input label="اسم الشركة / العميل" defaultValue={currentClient.name} />
          <Input label="البريد الإلكتروني" defaultValue={currentClient.email} />
          <Input label="رقم الجوال" defaultValue={currentClient.phone} />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>إلغاء</Button>
            <Button variant="primary" onClick={() => setShowUpdateModal(false)}>حفظ التحديثات</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} title="تواصل مع الدعم الفني">
        <div className="space-y-4">
          <Select label="نوع المشكلة" options={[{label:'استفسار مالي', value:'1'}, {label:'مشكلة فنية', value:'2'}]} />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">تفاصيل الرسالة</label>
            <textarea className="w-full p-3 border border-gray-200 rounded-xl" rows="4"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowSupportModal(false)}>إلغاء</Button>
            <Button variant="primary" onClick={() => setShowSupportModal(false)}>إرسال للدعم</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} title="معرض صور الموقع">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-bold">
              صورة الموقع {i}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setShowGalleryModal(false)}>إغلاق</Button>
        </div>
      </Modal>

      <Modal isOpen={showStatementModal} onClose={() => setShowStatementModal(false)} title="كشف الحساب المفصل">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <h3 className="font-bold text-gray-800">إجمالي المستحقات: {activeProject?.contractValue?.toLocaleString()} ر.س</h3>
            <p className="text-gray-500 text-sm">المدفوع: {activeProject?.paid?.toLocaleString()} ر.س</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={() => { window.print(); setShowStatementModal(false); }}>طباعة (PDF)</Button>
            <Button variant="secondary" onClick={() => setShowStatementModal(false)}>إغلاق</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="إرسال طلب جديد للإدارة">
        <div className="space-y-4">
          <Input label="عنوان الطلب" placeholder="مثال: طلب تعديل مخطط الواجهة" />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">تفاصيل الطلب</label>
            <textarea className="w-full p-3 border border-gray-200 rounded-xl" rows="4"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowRequestModal(false)}>إلغاء</Button>
            <Button variant="primary" onClick={() => setShowRequestModal(false)}>إرسال الطلب</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

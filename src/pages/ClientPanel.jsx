import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal } from '../components/UI';
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
  const { clients, projects } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // For demonstration, we assume the logged-in client is the first client
  const currentClient = clients[0] || { name: 'شركة الأفق للمقاولات', email: 'info@horizon.com', phone: '0501234567' };
  
  // Get projects related to this client
  const clientProjects = projects.filter(p => p.clientId === currentClient.id) || [
    { id: 1, name: 'مشروع مجمع الرياض السكني', progress: 75, status: 'قيد التنفيذ', contractValue: 2500000, paid: 1500000, startDate: '2023-01-15', endDate: '2024-06-30' },
    { id: 2, name: 'فيلا خاصة - الدمام', progress: 100, status: 'مكتمل', contractValue: 800000, paid: 800000, startDate: '2022-05-01', endDate: '2023-02-28' }
  ];

  const activeProject = clientProjects[0];

  return (
    <div className="space-y-6">
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
                <p className="font-bold text-gray-800">{activeProject?.startDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Clock className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">تاريخ التسليم</p>
                <p className="font-bold text-gray-800">{activeProject?.endDate}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Wallet className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">قيمة العقد</p>
                <p className="font-bold text-gray-800">{activeProject?.contractValue?.toLocaleString()} ر.س</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <TrendingUp className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">المدفوع</p>
                <p className="font-bold text-gray-800">{activeProject?.paid?.toLocaleString()} ر.س</p>
              </div>
            </div>
          </Card>

          {/* Site Photos Gallery */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-500" /> آخر صور الموقع
              </h3>
              <Button variant="secondary" size="sm" onClick={() => setShowGalleryModal(true)}>عرض الكل</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((img) => (
                <div key={img} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-200">
                  <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
                  {/* Placeholder for real images */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">صورة الموقع {img}</div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="primary" size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center" onClick={() => setShowGalleryModal(true)}><Camera className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
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
              {[
                { title: 'مستخلص رقم 3 - أعمال العظم', amount: '150,000 ر.س', status: 'مستحق', date: '2023-11-01' },
                { title: 'فاتورة دفعة مقدمة', amount: '500,000 ر.س', status: 'مدفوع', date: '2023-01-20' },
                { title: 'مستخلص رقم 2 - القواعد', amount: '200,000 ر.س', status: 'مدفوع', date: '2023-05-15' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-primary-100 hover:bg-primary-50/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${invoice.status === 'مدفوع' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{invoice.title}</p>
                      <p className="text-xs text-gray-500">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">{invoice.amount}</p>
                    <Badge variant={invoice.status === 'مدفوع' ? 'success' : 'danger'} className="mt-1">{invoice.status}</Badge>
                  </div>
                </div>
              ))}
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

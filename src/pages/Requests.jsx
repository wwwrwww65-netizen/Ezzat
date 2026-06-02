import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Badge, Button, Input, Modal, Select } from '../components/UI';
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Briefcase,
  PlaneTakeoff,
  Eye,
  Check,
  X,
  Trash2
} from 'lucide-react';

export default function Requests() {
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [requestType, setRequestType] = useState('purchase'); // purchase, leave, pettyCash

  useEffect(() => {
    fetchInitialData();
    fetchRequests();
  }, []);

  const fetchInitialData = async () => {
    if (!window.electronAPI) return;
    try {
      const prjs = await window.electronAPI.queryDb('SELECT id, name FROM projects ORDER BY id DESC');
      setProjects(prjs || []);
    } catch(e) {
      console.error(e);
    }
  };

  const fetchRequests = async () => {
    if (!window.electronAPI) return;
    try {
      const rows = await window.electronAPI.queryDb(`
        SELECT r.*, p.name as project_name 
        FROM requests r 
        LEFT JOIN projects p ON r.project_id = p.id 
        ORDER BY r.id DESC
      `);
      setRequests(rows || []);
    } catch(e) {
      console.error(e);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    amount: '',
    supplier: '',
    leaveType: 'annual',
    startDate: '',
    endDate: ''
  });

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    let reqTypeName = 'شراء مواد';
    let finalAmount = `${formData.amount} ر.س`;
    
    if (requestType === 'pettyCash') {
      reqTypeName = 'صرف عهدة';
    } else if (requestType === 'leave') {
      reqTypeName = 'إجازة';
      finalAmount = '-';
    }

    try {
      await window.electronAPI.executeDb(
        `INSERT INTO requests (req_type, applicant, project_id, req_date, status, amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [reqTypeName, 'مدير النظام', formData.project_id || null, new Date().toISOString().split('T')[0], 'قيد الانتظار', finalAmount]
      );
      
      setShowAddModal(false);
      setFormData({ title: '', project_id: '', amount: '', supplier: '', leaveType: 'annual', startDate: '', endDate: '' });
      fetchRequests();
    } catch(e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.executeDb('UPDATE requests SET status = ? WHERE id = ?', [newStatus, id]);
      fetchRequests();
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (await confirmDialog('هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟') && window.electronAPI) {
      await window.electronAPI.executeDb('DELETE FROM requests WHERE id = ?', [id]);
      fetchRequests();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'معتمد': return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> معتمد</Badge>;
      case 'مرفوض': return <Badge variant="danger" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> مرفوض</Badge>;
      default: return <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" /> قيد الانتظار</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    if ((type || '').includes('شراء')) return <Briefcase className="w-5 h-5 text-blue-500" />;
    if ((type || '').includes('إجازة')) return <PlaneTakeoff className="w-5 h-5 text-teal-500" />;
    if ((type || '').includes('عهدة')) return <Banknote className="w-5 h-5 text-emerald-500" />;
    return <FileSignature className="w-5 h-5 text-indigo-500" />;
  };

  const filteredRequests = requests.filter(req => 
    (activeTab === 'all' || req.status === activeTab) &&
    ((req.applicant || '').includes(searchQuery) || String(req.id).includes(searchQuery) || (req.req_type || '').includes(searchQuery))
  );

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <FileSignature className="w-8 h-8 text-primary-600" />
             مسار <span className="text-primary-600">الطلبات والاعتمادات</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة ومتابعة الموافقات على المشتريات، الإجازات، والعهد المالية</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none"
        >
          <Plus className="w-5 h-5 ml-2" /> إنشاء طلب جديد
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className={`p-4 flex items-center gap-4 bg-white border shadow-sm cursor-pointer hover:shadow-md transition-all ${activeTab === 'all' ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100'}`} onClick={() => setActiveTab('all')}>
          <div className="p-3 bg-gray-50 text-gray-600 rounded-2xl"><FileSignature className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي الطلبات</p>
            <p className="text-2xl font-black text-gray-800">{requests.length}</p>
          </div>
        </Card>
        <Card className={`p-4 flex items-center gap-4 bg-white border shadow-sm cursor-pointer hover:shadow-md transition-all ${activeTab === 'قيد الانتظار' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-gray-100'}`} onClick={() => setActiveTab('قيد الانتظار')}>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">بانتظار الموافقة</p>
            <p className="text-2xl font-black text-amber-600">{requests.filter(r => r.status === 'قيد الانتظار').length}</p>
          </div>
        </Card>
        <Card className={`p-4 flex items-center gap-4 bg-white border shadow-sm cursor-pointer hover:shadow-md transition-all ${activeTab === 'معتمد' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'}`} onClick={() => setActiveTab('معتمد')}>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">طلبات معتمدة</p>
            <p className="text-2xl font-black text-emerald-600">{requests.filter(r => r.status === 'معتمد').length}</p>
          </div>
        </Card>
        <Card className={`p-4 flex items-center gap-4 bg-white border shadow-sm cursor-pointer hover:shadow-md transition-all ${activeTab === 'مرفوض' ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-100'}`} onClick={() => setActiveTab('مرفوض')}>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><XCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">طلبات مرفوضة</p>
            <p className="text-2xl font-black text-red-600">{requests.filter(r => r.status === 'مرفوض').length}</p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث برقم الطلب، اسم الموظف..." 
              className="pr-10 w-full rounded-xl border-gray-200 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" className="rounded-xl bg-white w-full sm:w-auto font-bold"><Filter className="w-4 h-4 ml-2" /> تصفية متقدمة</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold">رقم الطلب</th>
                <th className="px-6 py-4 font-bold">نوع الطلب</th>
                <th className="px-6 py-4 font-bold">مقدم الطلب</th>
                <th className="px-6 py-4 font-bold">المشروع المرتبط</th>
                <th className="px-6 py-4 font-bold">القيمة/التفاصيل</th>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">حالة الاعتماد</th>
                <th className="px-6 py-4 font-bold w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 font-bold">لا توجد طلبات لعرضها في هذا التصنيف.</td>
                </tr>
              ) : filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 font-black text-gray-800 font-mono">REQ-{req.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">{getTypeIcon(req.req_type)}</div>
                      <span className="font-bold text-gray-800">{req.req_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 font-black flex items-center justify-center text-xs">
                        {req.applicant?.charAt(0) || '?'}
                      </div>
                      <span className="font-bold text-gray-700">{req.applicant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-bold">
                    <Badge variant="neutral">{req.project_id ? req.project_name : 'عام / غير مرتبط'}</Badge>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-800">{req.amount}</td>
                  <td className="px-6 py-4 text-gray-500 font-bold">{req.req_date}</td>
                  <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {req.status === 'قيد الانتظار' && (
                        <>
                          <button onClick={() => handleUpdateStatus(req.id, 'معتمد')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="اعتماد"><Check className="w-5 h-5" /></button>
                          <button onClick={() => handleUpdateStatus(req.id, 'مرفوض')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="رفض"><X className="w-5 h-5" /></button>
                        </>
                      )}
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="عرض التفاصيل"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteRequest(req.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Request Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إنشاء طلب جديد" className="max-w-xl">
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button 
              onClick={() => setRequestType('purchase')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${requestType === 'purchase' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              طلب شراء
            </button>
            <button 
              onClick={() => setRequestType('pettyCash')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${requestType === 'pettyCash' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              صرف عهدة
            </button>
            <button 
              onClick={() => setRequestType('leave')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${requestType === 'leave' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              طلب إجازة
            </button>
          </div>

          <form onSubmit={handleAddRequest} className="space-y-4">
            {requestType === 'purchase' && (
              <>
                <Select label="ربط بالمشروع (اختياري)" options={[{label: 'بدون ارتباط (عام)', value: ''}, ...projects.map(p => ({label: p.name, value: p.id}))]} value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})} />
                <Input label="عنوان الطلب / وصف المواد" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="القيمة التقديرية (ر.س)" type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                  <Input label="المورد المقترح (إن وجد)" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
                </div>
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                  <FileSignature className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-500">انقر هنا لإرفاق عرض السعر (PDF, JPG)</p>
                </div>
              </>
            )}

            {requestType === 'pettyCash' && (
              <>
                <Select label="نوع العهدة" options={[{label:'موقع', value:'site'}, {label:'إدارية', value:'admin'}]} />
                <Input label="المبلغ المطلوب (ر.س)" type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                <Input label="سبب صرف العهدة بالتفصيل" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </>
            )}

            {requestType === 'leave' && (
              <>
                <Select label="نوع الإجازة" options={[{label:'سنوية', value:'annual'}, {label:'مرضية', value:'sick'}, {label:'اضطرارية', value:'emergency'}]} value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="من تاريخ" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                  <Input label="إلى تاريخ" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>
                <Input label="البديل المقترح أثناء الإجازة (اختياري)" />
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold text-gray-600">إلغاء</Button>
              <Button type="submit" className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">تقديم الطلب للاعتماد</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

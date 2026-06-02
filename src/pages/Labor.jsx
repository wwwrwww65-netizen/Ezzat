import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  HardHat,
  Plus,
  Search,
  UserCheck,
  Clock,
  DollarSign,
  Trash2,
  Edit,
  Filter,
  Users,
  Calendar,
  Download,
  Printer
} from 'lucide-react';

export default function Labor() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    nationality: '',
    dailyRate: 0,
    projectId: '',
    idNumber: '',
    status: 'على رأس العمل',
    role: 'labor'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!window.electronAPI) return;
    setLoading(true);
    try {
      const staffData = await window.electronAPI.queryDb("SELECT * FROM staff WHERE role IN ('labor', 'supervisor')");
      const projData = await window.electronAPI.queryDb("SELECT * FROM projects");
      setEmployees(staffData);
      setProjects(projData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditLabor = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    try {
      if (editingId) {
        await window.electronAPI.executeDb(
          'UPDATE staff SET name=?, profession=?, nationality=?, daily_rate=?, project_id=?, id_number=?, status=?, role=? WHERE id=?',
          [formData.name, formData.profession, formData.nationality, formData.dailyRate, formData.projectId || null, formData.idNumber, formData.status, formData.role, editingId]
        );
      } else {
        await window.electronAPI.executeDb(
          'INSERT INTO staff (name, profession, nationality, daily_rate, project_id, id_number, status, role) VALUES (?,?,?,?,?,?,?,?)',
          [formData.name, formData.profession, formData.nationality, formData.dailyRate, formData.projectId || null, formData.idNumber, formData.status, formData.role]
        );
      }
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '', profession: '', nationality: '', dailyRate: 0, projectId: '', idNumber: '', status: 'على رأس العمل', role: 'labor'
    });
  };

  const deleteLabor = async (id) => {
    if (!window.electronAPI) return;
    if (confirm('هل أنت متأكد من حذف هذا العامل؟')) {
      await window.electronAPI.executeDb('DELETE FROM staff WHERE id = ?', [id]);
      fetchData();
    }
  };

  const filteredLabor = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (emp.profession && emp.profession.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">إدارة العمالة والميدان</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة فرق العمل، الحضور والانصراف، والرواتب اليومية</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => { resetForm(); setShowAddModal(true); }} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
             <Plus className="w-4 h-4" /> إضافة عامل
           </Button>
           <Button onClick={() => window.print()} variant="secondary" className="rounded-xl" title="طباعة الكشف"><Printer className="w-4 h-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="p-4 flex items-center gap-4 bg-blue-50 border-none shadow-sm">
                <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Users className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي العمالة</p>
                   <p className="text-xl font-black text-gray-800">{employees.length}</p>
                </div>
             </Card>
             <Card className="p-4 flex items-center gap-4 bg-emerald-50 border-none shadow-sm">
                <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><UserCheck className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">متواجدين حالياً</p>
                   <p className="text-xl font-black text-gray-800">{employees.filter(l => l.status === 'على رأس العمل').length}</p>
                </div>
             </Card>
             <Card className="p-4 flex items-center gap-4 bg-amber-50 border-none shadow-sm">
                <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm"><Clock className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">طلبات إجازة</p>
                   <p className="text-xl font-black text-gray-800">{employees.filter(l => l.status === 'مجاز').length}</p>
                </div>
             </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="relative flex-1 w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="البحث بالاسم أو المهنة..."
                    className="pr-10 rounded-xl"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-2">
                  <Select options={[{label: 'الكل', value: ''}, {label: 'على رأس العمل', value: 'على رأس العمل'}, {label: 'مجاز', value: 'مجاز'}]} className="w-40" />
                  <Button onClick={() => {
                    const searchInput = document.querySelector('input[placeholder="البحث بالاسم أو المهنة..."]');
                    if (searchInput) searchInput.focus();
                  }} variant="secondary" size="sm" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
               </div>
            </div>

            <Table headers={['العامل', 'المهنة', 'المشروع', 'الأجر اليومي', 'الحالة', 'إجراءات']}>
               {filteredLabor.map(emp => (
                 <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center font-bold text-primary-600">{emp.name.charAt(0)}</div>
                          <div>
                             <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                             <p className="text-[10px] text-gray-400 font-bold">{emp.nationality}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{emp.profession}</td>
                    <td className="px-6 py-4">
                       {emp.project_id ? (
                         <Badge variant="info">{projects.find(p => p.id === emp.project_id)?.name}</Badge>
                       ) : (
                         <span className="text-xs text-gray-400 font-medium italic">غير معين</span>
                       )}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800">{emp.daily_rate} ر.س</td>
                    <td className="px-6 py-4">
                       <Badge variant={emp.status === 'على رأس العمل' ? 'success' : 'warning'}>{emp.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2">
                          <button onClick={() => window.print()} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" title="سجل الحضور"><Calendar className="w-4 h-4" /></button>
                          <button onClick={() => {
                            setEditingId(emp.id);
                            setFormData({
                              name: emp.name,
                              profession: emp.profession || '',
                              nationality: emp.nationality || '',
                              dailyRate: emp.daily_rate || 0,
                              projectId: emp.project_id || '',
                              idNumber: emp.id_number || '',
                              status: emp.status || 'على رأس العمل',
                              role: emp.role || 'labor'
                            });
                            setShowAddModal(true);
                          }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="تعديل بيانات العامل"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteLabor(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="حذف العامل"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                 </tr>
               ))}
            </Table>
          </Card>
        </>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingId ? "تعديل بيانات العامل" : "إضافة عامل جديد"}>
         <form noValidate className="space-y-4" onSubmit={handleAddOrEditLabor}>
            <Input label="الاسم الكامل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
               <Input label="المهنة" placeholder="مثلاً: بناء، سباك" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} required />
               <Input label="الجنسية" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="الأجر اليومي" type="number" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: e.target.value})} required />
               <Select label="المشروع الحالي" options={[{label: 'بدون مشروع', value: ''}, ...projects.map(p => ({ label: p.name, value: p.id }))]} value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="رقم الهوية / الإقامة" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} required />
               <Select label="حالة العامل" options={[{label: 'على رأس العمل', value: 'على رأس العمل'}, {label: 'مجاز', value: 'مجاز'}, {label: 'منقطع', value: 'منقطع'}]} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
               <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary" type="submit">حفظ البيانات</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

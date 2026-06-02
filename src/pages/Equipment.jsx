import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { Construction, Plus, Search, Settings, Trash2, Edit, Truck, Wrench, Calendar, DollarSign, AlertTriangle, History } from 'lucide-react';

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serialNumber: '',
    dailyCost: 0,
    monthlyCost: 0,
    lastMaintenance: '',
    projectId: '',
    status: 'متوفر'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!window.electronAPI) return;
    setLoading(true);
    try {
      const eqData = await window.electronAPI.queryDb("SELECT * FROM equipment");
      const projData = await window.electronAPI.queryDb("SELECT * FROM projects");
      setEquipment(eqData);
      setProjects(projData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditEquipment = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    try {
      if (editingId) {
        await window.electronAPI.executeDb(
          'UPDATE equipment SET name=?, type=?, serial_number=?, daily_cost=?, monthly_cost=?, last_maintenance=?, project_id=?, status=? WHERE id=?',
          [formData.name, formData.type, formData.serialNumber, formData.dailyCost, formData.monthlyCost, formData.lastMaintenance, formData.projectId || null, formData.status, editingId]
        );
      } else {
        await window.electronAPI.executeDb(
          'INSERT INTO equipment (name, type, serial_number, daily_cost, monthly_cost, last_maintenance, project_id, status) VALUES (?,?,?,?,?,?,?,?)',
          [formData.name, formData.type, formData.serialNumber, formData.dailyCost, formData.monthlyCost, formData.lastMaintenance, formData.projectId || null, formData.status]
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
      name: '', type: '', serialNumber: '', dailyCost: 0, monthlyCost: 0, lastMaintenance: '', projectId: '', status: 'متوفر'
    });
  };

  const deleteEquipment = async (id) => {
    if (!window.electronAPI) return;
    if (confirm('هل أنت متأكد من حذف هذه المعدة؟')) {
      await window.electronAPI.executeDb('DELETE FROM equipment WHERE id = ?', [id]);
      fetchData();
    }
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.serial_number && item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">إدارة المعدات والآليات</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">متابعة الأسطول، تكاليف التشغيل، وجداول الصيانة</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => { resetForm(); setShowAddModal(true); }} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
             <Plus className="w-4 h-4" /> إضافة معدة
           </Button>
           <Button onClick={() => window.print()} variant="secondary" className="rounded-xl" title="طباعة السجل"><History className="w-4 h-4" /> سجل الصيانة</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card className="p-4 border-none shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي المعدات</p>
                   <p className="text-xl font-black">{equipment.length}</p>
                </div>
             </Card>
             <Card className="p-4 border-none shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><UserCheckIcon className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">تعمل حالياً</p>
                   <p className="text-xl font-black">{equipment.filter(e => e.status === 'في الموقع').length}</p>
                </div>
             </Card>
             <Card className="p-4 border-none shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Wrench className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">تحت الصيانة</p>
                   <p className="text-xl font-black">{equipment.filter(e => e.status === 'صيانة').length}</p>
                </div>
             </Card>
             <Card className="p-4 border-none shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">تكلفة التشغيل اليومي</p>
                   <p className="text-xl font-black">{equipment.reduce((acc, e) => acc + Number(e.daily_cost || 0), 0)} ر.س</p>
                </div>
             </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="البحث باسم المعدة أو الرقم التسلسلي..."
                    className="pr-10 rounded-xl"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <Table headers={['المعدة / الآلية', 'الرقم التسلسلي', 'الموقع الحالي', 'التكلفة (يومي/شهري)', 'آخر صيانة', 'الحالة', 'إجراءات']}>
               {filteredEquipment.map(item => (
                 <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{item.serial_number}</td>
                    <td className="px-6 py-4">
                       {item.project_id ? (
                         <Badge variant="info">{projects.find(p => p.id === item.project_id)?.name}</Badge>
                       ) : (
                         <Badge variant="neutral">المستودع العام</Badge>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-700">{item.daily_cost} ر.س</span>
                          <span className="text-[10px] text-gray-400 font-bold">{item.monthly_cost} ر.س / شهر</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-bold">{item.last_maintenance}</td>
                    <td className="px-6 py-4">
                       <Badge variant={item.status === 'متوفر' ? 'success' : item.status === 'في الموقع' ? 'info' : 'warning'}>{item.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                       <div className="flex gap-2">
                          <button onClick={() => {
                            setEditingId(item.id);
                            setFormData({
                              name: item.name,
                              type: item.type || '',
                              serialNumber: item.serial_number || '',
                              dailyCost: item.daily_cost || 0,
                              monthlyCost: item.monthly_cost || 0,
                              lastMaintenance: item.last_maintenance || '',
                              projectId: item.project_id || '',
                              status: item.status || 'متوفر'
                            });
                            setShowAddModal(true);
                          }} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" title="صيانة وتعديل"><Wrench className="w-4 h-4" /></button>
                          <button onClick={() => deleteEquipment(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                 </tr>
               ))}
            </Table>
          </Card>
        </>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingId ? "تعديل بيانات المعدة" : "إضافة معدة جديدة للأسطول"}>
         <form noValidate className="space-y-4" onSubmit={handleAddOrEditEquipment}>
            <Input label="اسم المعدة" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
               <Input label="النوع" placeholder="مثلاً: رافعة، جرافة" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
               <Input label="الرقم التسلسلي" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="التكلفة اليومية" type="number" value={formData.dailyCost} onChange={e => setFormData({...formData, dailyCost: e.target.value})} />
               <Input label="التكلفة الشهرية" type="number" value={formData.monthlyCost} onChange={e => setFormData({...formData, monthlyCost: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="تاريخ آخر صيانة" type="date" value={formData.lastMaintenance} onChange={e => setFormData({...formData, lastMaintenance: e.target.value})} />
               <Select label="الموقع الحالي" options={[{label: 'بدون مشروع', value: ''}, ...projects.map(p => ({ label: p.name, value: p.id }))]} value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} />
            </div>
            <Select label="الحالة" options={[{label: 'متوفر', value: 'متوفر'}, {label: 'في الموقع', value: 'في الموقع'}, {label: 'صيانة', value: 'صيانة'}]} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} />
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
               <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>إلغاء</Button>
               <Button variant="primary" type="submit">حفظ المعدة</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

function UserCheckIcon({className}) {
  return <Construction className={className} />;
}

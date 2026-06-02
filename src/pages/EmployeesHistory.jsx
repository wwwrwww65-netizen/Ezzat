import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Table, Input, Select, Button, Badge, Modal } from '../components/UI';
import { History, ListOrdered, Printer, Download, Filter, Search, List, DollarSign, HandCoins, Gift, ShieldAlert, Landmark, Trash2, Eye, Edit } from 'lucide-react';

export default function EmployeesHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, amount: '', reason: '', pureReason: '', payment_method: 'cash', originalType: '' });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    if (window.electronAPI) {
      // Fetch advances/deductions
      const rows = await window.electronAPI.queryDb(`
        SELECT a.id, a.staff_id, s.name as staff_name, a.amount, a.reason, a.date as created_at,
               CASE WHEN a.reason LIKE '%خصم/جزاء%' THEN 'خصم / جزاء' ELSE 'سلفة' END as type
        FROM staff_advances a
        LEFT JOIN staff s ON CAST(a.staff_id AS INTEGER) = s.id
        ORDER BY a.id DESC
      `);
      setHistory(rows || []);
    }
    setLoading(false);
  };

  const filtered = history.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery && !item.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) && !item.reason?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id) => {
    if (!await confirmDialog('هل أنت متأكد من حذف هذه العملية؟ سيتم إزالتها من رصيد الموظف.')) return;
    if (window.electronAPI) {
      await window.electronAPI.executeDb('DELETE FROM staff_advances WHERE id = ?', [id]);
      fetchHistory();
    }
  };

  const handleOpenEdit = (row) => {
    let pMethod = 'cash';
    let pure = row.reason;
    if (pure.includes('تحويل بنكي')) pMethod = 'bank';
    
    // Clean up reason string to just show the user input
    pure = pure.replace('(الخزينة/كاش)', '').replace('(تحويل بنكي)', '').trim();
    pure = pure.replace(/^راتب\s*:\s*/, '').replace(/^مكافأة\s*:\s*/, '').replace(/^سلفة\s*:\s*/, '').replace(/^خصم\/جزاء\s*:\s*/, '').replace(/^:\s*/, '').trim();

    setEditData({ 
      id: row.id, 
      amount: row.amount, 
      reason: row.reason,
      pureReason: pure,
      payment_method: pMethod,
      originalType: row.type
    });
    setShowEditModal(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (window.electronAPI && editData.id) {
      let finalReason = editData.pureReason;
      
      // Reconstruct the reason string if it's not a penalty
      if (editData.originalType !== 'خصم / جزاء') {
        const paymentText = editData.payment_method === 'cash' ? 'الخزينة/كاش' : 'تحويل بنكي';
        finalReason = `${editData.originalType} (${paymentText}): ${editData.pureReason}`;
      } else {
        finalReason = `خصم/جزاء: ${editData.pureReason}`;
      }

      await window.electronAPI.executeDb('UPDATE staff_advances SET amount = ?, reason = ? WHERE id = ?', [Number(editData.amount), finalReason, editData.id]);
      setShowEditModal(false);
      fetchHistory();
    }
  };

  const totalAdvances = filtered.reduce((acc, item) => item.type === 'سلفة' ? acc + item.amount : acc, 0);
  const totalSalaries = filtered.reduce((acc, item) => item.type === 'راتب' ? acc + item.amount : acc, 0);
  const totalBonuses = filtered.reduce((acc, item) => item.type === 'مكافأة' ? acc + item.amount : acc, 0);
  const totalDeductions = filtered.reduce((acc, item) => item.type === 'خصم / جزاء' ? acc + item.amount : acc, 0);
  const totalNet = totalSalaries + totalBonuses - totalAdvances - totalDeductions;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-600" />
            السجل الكامل لعمليات الموظفين
          </h1>
          <p className="text-sm text-gray-500 mt-1">عرض وتتبع جميع العمليات: الرواتب، السلف، الخصومات، الجزاءات، والمكافآت</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-bold border-gray-200">
            <ListOrdered className="w-4 h-4 ml-2" /> إجماليات الموظفين
          </Button>
          <Button className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border-none shadow-none">
            <Printer className="w-4 h-4 ml-2" /> تصدير PDF
          </Button>
          <Button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold border-none shadow-none">
            <Download className="w-4 h-4 ml-2" /> تصدير Excel
          </Button>
        </div>
      </div>

      <Card className="p-6 border-none shadow-sm bg-slate-900/40 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 relative">
             <label className="block text-xs font-bold text-gray-400 mb-2">بحث</label>
             <Search className="absolute right-3 top-9 text-gray-500 w-4 h-4" />
             <Input 
               placeholder="رقم السند، البيان، الموظف..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="pl-4 pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-500"
             />
           </div>
           <div className="w-full md:w-72">
             <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400">نوع العملية</label>
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Filter className="w-3 h-3" /> الفلاتر والبحث المتقدم</span>
             </div>
             <Select 
               value={filterType}
               onChange={e => setFilterType(e.target.value)}
               options={[
                 {label: 'جميع العمليات', value: 'all'},
                 {label: 'راتب', value: 'راتب'},
                 {label: 'سلفة', value: 'سلفة'},
                 {label: 'مكافأة', value: 'مكافأة'},
                 {label: 'خصم / جزاء', value: 'خصم / جزاء'}
               ]}
               className="bg-slate-800/50 border-slate-700/50 text-white"
             />
           </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-slate-900/40 border-t-4 border-t-pink-500 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center shrink-0">
             <List className="w-7 h-7 text-pink-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">إجمالي العمليات</p>
            <h3 className="text-2xl font-black text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">{filtered.length}</h3>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-slate-900/40 border-t-4 border-t-indigo-500 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
             <DollarSign className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">إجمالي الرواتب</p>
            <h3 className="text-2xl font-black text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">{totalSalaries.toLocaleString()} <span className="text-sm">ر.س</span></h3>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-slate-900/40 border-t-4 border-t-amber-500 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
             <HandCoins className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">إجمالي السلف</p>
            <h3 className="text-2xl font-black text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{totalAdvances.toLocaleString()} <span className="text-sm">ر.س</span></h3>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-slate-900/40 border-t-4 border-t-emerald-500 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
             <Gift className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">إجمالي المكافآت</p>
            <h3 className="text-2xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{totalBonuses.toLocaleString()} <span className="text-sm">ر.س</span></h3>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-slate-900/40 border-t-4 border-t-red-500 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
             <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">إجمالي الخصومات</p>
            <h3 className="text-2xl font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{totalDeductions.toLocaleString()} <span className="text-sm">ر.س</span></h3>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-slate-900/40 border-t-4 border-t-blue-500 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
             <Landmark className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1">صافي الرصيد</p>
            <h3 className="text-2xl font-black text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" dir="ltr">{totalNet.toLocaleString()} <span className="text-sm">ر.س</span></h3>
          </div>
        </Card>
      </div>

      <Card className="p-0 border-none shadow-sm overflow-hidden bg-white">
        <Table headers={['رقم السند', 'التاريخ', 'الموظف', 'نوع العملية', 'المبلغ', 'البيان / السبب', 'الإجراءات']}>
          {loading ? (
             <tr><td colSpan="7" className="text-center py-8">جاري التحميل...</td></tr>
          ) : filtered.length === 0 ? (
             <tr><td colSpan="7" className="text-center py-8 text-gray-400 font-bold">لا توجد عمليات مطابقة</td></tr>
          ) : (
            filtered.map(row => (
              <tr key={row.id}>
                <td className="px-6 py-4 font-bold text-gray-900">#{row.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{row.created_at?.split(' ')[0] || '-'}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{row.staff_name}</td>
                <td className="px-6 py-4">
                  <Badge variant={row.type === 'سلفة' ? 'warning' : row.type === 'خصم / جزاء' ? 'danger' : row.type === 'مكافأة' ? 'success' : 'primary'}>{row.type}</Badge>
                </td>
                <td className="px-6 py-4 font-black text-gray-800">{row.amount.toLocaleString()} ر.س</td>
                <td className="px-6 py-4 text-sm text-gray-700">{row.reason}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="عرض السند / طباعة">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenEdit(row)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="تعديل العملية">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف العملية">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل تفاصيل العملية" className="max-w-md">
        <form onSubmit={submitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ (ر.س)</label>
            <Input type="number" step="any" min="1" value={editData.amount} onChange={e => setEditData({...editData, amount: e.target.value})} required className="text-xl font-black text-amber-600" />
          </div>
          
          {editData.originalType !== 'خصم / جزاء' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">جهة الصرف</label>
              <Select 
                value={editData.payment_method} 
                onChange={e => setEditData({...editData, payment_method: e.target.value})} 
                options={[
                  { value: 'cash', label: 'الخزينة / كاش' },
                  { value: 'bank', label: 'حساب بنكي / تحويل' }
                ]}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">البيان / السبب</label>
            <Input value={editData.pureReason} onChange={e => setEditData({...editData, pureReason: e.target.value})} required />
          </div>
          
          <div className="pt-4 flex gap-2 border-t border-gray-100">
             <Button type="button" onClick={() => setShowEditModal(false)} variant="ghost" className="flex-1 font-bold text-gray-600">إلغاء</Button>
             <Button type="submit" className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white font-bold border-none shadow-md shadow-amber-200">حفظ التعديلات</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

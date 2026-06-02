import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../../utils/confirmDialog';
import { Card, Button, Input, Select, Table, Badge, Modal } from '../../components/UI';
import { Receipt, Plus, FileText, CreditCard, Search, Calendar, FileDown, Printer, Wallet, CheckCircle, Eye, Trash2, Pencil } from 'lucide-react';
import { cn } from '../../components/UI';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  
  const [newExpense, setNewExpense] = useState({ project_id: '', category: '', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0], payment_method: 'cash' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (window.electronAPI) {
      try {
        const exp = await window.electronAPI.queryDb(`
          SELECT e.*, p.name as project_name 
          FROM expenses e 
          LEFT JOIN projects p ON e.project_id = p.id 
          ORDER BY e.expense_date DESC, e.id DESC
        `);
        setExpenses(exp || []);
        
        const proj = await window.electronAPI.queryDb('SELECT id, name FROM projects');
        setProjects(proj || []);
      } catch (err) {
        console.error("Error fetching expenses data:", err);
      }
    }
  };

  const handlePrintVoucher = (exp) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند صرف EXP-${String(exp.id).padStart(4, '0')}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial; direction: rtl; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { font-size: 26px; color: #e11d48; margin-bottom: 5px; }
          .subtitle { color: #64748b; font-size: 14px; font-weight: bold; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
          .row { display: flex; margin-bottom: 15px; }
          .row:last-child { margin-bottom: 0; }
          .label { width: 120px; font-weight: bold; color: #64748b; font-size: 14px; }
          .value { font-weight: 900; color: #0f172a; font-size: 15px; flex: 1; }
          .amount { font-size: 20px; color: #e11d48; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; }
          .sig-box { border-top: 2px dashed #cbd5e1; padding-top: 10px; width: 200px; text-align: center; color: #64748b; font-weight: bold; font-size: 14px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>سند صرف (مصروفات)</h1>
            <p class="subtitle">نظام إدارة المقاولات</p>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 18px; font-weight: 900; color: #0f172a;">رقم السند: EXP-${String(exp.id).padStart(4, '0')}</div>
            <div style="color: #64748b; margin-top: 5px; font-weight: bold;">التاريخ: ${new Date(exp.expense_date || new Date()).toLocaleDateString('ar-SA')}</div>
          </div>
        </div>
        
        <div class="info-box">
          <div class="row">
            <div class="label">المشروع المستفيد:</div>
            <div class="value">${exp.project_name || 'مصروف عام (إدارة)'}</div>
          </div>
          <div class="row">
            <div class="label">تصنيف المصروف:</div>
            <div class="value">${exp.category || '-'}</div>
          </div>
          <div class="row">
            <div class="label">البيان / الوصف:</div>
            <div class="value">${exp.description || '-'}</div>
          </div>
          <div class="row">
            <div class="label">المبلغ المدفوع:</div>
            <div class="value amount">${(exp.amount || 0).toLocaleString()} ريال سعودي</div>
          </div>
        </div>

        <div class="footer">
          <div class="sig-box">توقيع المستلم</div>
          <div class="sig-box">توقيع المحاسب</div>
          <div class="sig-box">الختم والاعتماد</div>
        </div>
        <script>window.onload = function(){ window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category) return;
    
    if (window.electronAPI) {
      const amountNum = Number(newExpense.amount) || 0;
      const expDate = newExpense.expense_date || new Date().toISOString().split('T')[0];

      // 1. تسجيل المصروف
      await window.electronAPI.executeDb(
        'INSERT INTO expenses (project_id, category, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)',
        [newExpense.project_id || null, newExpense.category, amountNum, newExpense.description || '', expDate]
      );
      
      // 2. تسجيل القيد المحاسبي المزدوج (Double Entry)
      const desc = `مصروف (${newExpense.category}) - ${newExpense.description || ''}`;
      // المدين (المصروفات زادت)
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        ['5001', amountNum, 0, desc, expDate]
      );
      // الدائن (النقدية/البنك نقصت)
      const creditAccount = newExpense.payment_method === 'bank' ? '1002' : '1001';
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        [creditAccount, 0, amountNum, desc, expDate]
      );

      setNewExpense({ project_id: '', category: '', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0], payment_method: 'cash' });
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteExpense = async (exp) => {
    if (!await confirmDialog('هل أنت متأكد من حذف هذا المصروف؟ سيتم حذف القيود المحاسبية المرتبطة به أيضاً.')) return;
    if (window.electronAPI) {
      const desc = `مصروف (${exp.category}) - ${exp.description || ''}`;
      
      // حذف القيود المحاسبية المرتبطة
      await window.electronAPI.executeDb(
        'DELETE FROM accounting_journal WHERE description = ? AND entry_date = ?',
        [desc, exp.expense_date]
      );
      
      // حذف المصروف
      await window.electronAPI.executeDb('DELETE FROM expenses WHERE id = ?', [exp.id]);
      fetchData();
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editExpense.amount || !editExpense.category) return;

    if (window.electronAPI) {
      const amountNum = Number(editExpense.amount) || 0;
      const expDate = editExpense.expense_date || new Date().toISOString().split('T')[0];

      // 1. حذف القيود المحاسبية القديمة
      const oldDesc = `مصروف (${editExpense.old_category}) - ${editExpense.old_description || ''}`;
      await window.electronAPI.executeDb(
        'DELETE FROM accounting_journal WHERE description = ? AND entry_date = ?',
        [oldDesc, editExpense.old_expense_date]
      );

      // 2. تحديث المصروف
      await window.electronAPI.executeDb(
        'UPDATE expenses SET project_id = ?, category = ?, amount = ?, description = ?, expense_date = ? WHERE id = ?',
        [editExpense.project_id || null, editExpense.category, amountNum, editExpense.description || '', expDate, editExpense.id]
      );

      // 3. إنشاء قيود محاسبية جديدة
      const newDesc = `مصروف (${editExpense.category}) - ${editExpense.description || ''}`;
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        ['5001', amountNum, 0, newDesc, expDate]
      );
      
      const creditAccount = editExpense.payment_method === 'bank' ? '1002' : '1001';
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        [creditAccount, 0, amountNum, newDesc, expDate]
      );

      setEditExpense(null);
      fetchData();
    }
  };

  const openEditModal = (exp) => {
    setEditExpense({
      ...exp,
      old_category: exp.category,
      old_description: exp.description,
      old_expense_date: exp.expense_date,
      payment_method: 'cash' // Defaulting to cash since we don't store payment method in expenses table yet
    });
  };

  // KPIs calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpenses = expenses.filter(exp => {
    if (!exp.expense_date) return false;
    const d = new Date(exp.expense_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const todayExpenses = expenses.filter(exp => {
    if (!exp.expense_date) return false;
    const d = new Date(exp.expense_date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const totalMonthAmount = thisMonthExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalTodayAmount = todayExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const filteredExpenses = expenses.filter(exp => 
    (exp.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (exp.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exp.project_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-rose-600" />
            المصروفات وسندات الصرف
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">سجل مصروفات التشغيل (رواتب، إيجارات، نثريات) وترحيلها محاسبياً.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200">
            <Plus className="w-5 h-5 ml-1" /> إصدار سند صرف جديد
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-sm flex items-center gap-4 bg-gradient-to-l from-rose-50 to-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">إجمالي مصروفات الشهر</p>
            <h3 className="text-2xl font-black text-rose-700 mt-1">{totalMonthAmount.toLocaleString()} <span className="text-xs font-medium text-gray-500">ر.س</span></h3>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">مصروفات اليوم</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{totalTodayAmount.toLocaleString()} <span className="text-xs font-medium text-gray-500">ر.س</span></h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <FileText className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">إجمالي المصروفات (كلي)</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{totalAmount.toLocaleString()} <span className="text-xs font-medium text-gray-500">ر.س</span></h3>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="p-0 border-none shadow-sm overflow-hidden" 
            headerAction={
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="ابحث بالبيان أو التصنيف..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-10 py-2.5 bg-gray-50 border-gray-100 focus:bg-white" 
                  />
                </div>
                <Button variant="outline" className="border-gray-200 bg-white font-bold text-gray-700 hidden md:flex">
                  <FileDown className="w-4 h-4 ml-2" /> تصدير
                </Button>
              </div>
            }>
        <Table headers={['رقم السند', 'التاريخ', 'المشروع', 'تصنيف المصروف', 'البيان', 'المبلغ', 'إجراءات']}>
          {filteredExpenses.length === 0 ? (
             <tr><td colSpan="7" className="text-center py-8 text-gray-500 font-bold">لا توجد مصروفات مسجلة</td></tr>
          ) : (
            filteredExpenses.map(exp => {
              let displayDate = '-';
              if (exp.expense_date) {
                try {
                  displayDate = new Date(exp.expense_date).toLocaleDateString('ar-SA');
                } catch (e) {
                  displayDate = 'تاريخ غير صالح';
                }
              }
              
              return (
                <tr key={exp.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-black text-xs text-gray-400">EXP-{String(exp.id).padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-medium text-sm text-gray-500" dir="ltr">{displayDate}</td>
                  <td className="px-6 py-4 font-bold text-sm text-gray-800">{exp.project_name || 'مصروف عام (إدارة)'}</td>
                  <td className="px-6 py-4 font-bold text-sm text-indigo-600">{exp.category || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={exp.description || ''}>{exp.description || '-'}</td>
                  <td className="px-6 py-4 font-black text-sm text-rose-600">{(exp.amount || 0).toLocaleString()} ر.س</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 items-center">
                      <button onClick={() => setViewExpense(exp)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="عرض السند">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(exp)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="تعديل">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteExpense(exp)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </Table>
      </Card>

      {/* Add Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إصدار سند صرف جديد" className="max-w-2xl">
        <form onSubmit={handleAddExpense} className="space-y-6">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-800 text-sm font-bold flex items-center gap-3">
            <Receipt className="w-5 h-5 text-rose-600" />
            سيتم خصم هذا المبلغ من الخزينة وتوليد قيد محاسبي آلياً.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تصنيف المصروف / البند</label>
              <Select 
                value={newExpense.category} 
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                options={[
                  {label: 'اختر تصنيفاً...', value: ''},
                  {label: 'رواتب وأجور عاملين', value: 'رواتب وأجور عاملين'},
                  {label: 'إيجار مقر أو مستودع', value: 'إيجار مقر أو مستودع'},
                  {label: 'فواتير (كهرباء، ماء، اتصالات)', value: 'فواتير (كهرباء، ماء، اتصالات)'},
                  {label: 'وقود ومواصلات', value: 'وقود ومواصلات'},
                  {label: 'صيانة وإصلاح', value: 'صيانة وإصلاح'},
                  {label: 'ضيافة وبوفيه', value: 'ضيافة وبوفيه'},
                  {label: 'رسوم حكومية ورخص', value: 'رسوم حكومية ورخص'},
                  {label: 'مواد نظافة وتغليف', value: 'مواد نظافة وتغليف'},
                  {label: 'مصروفات نثرية عامة', value: 'مصروفات نثرية عامة'}
                ]}
                required
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الارتباط بمشروع (اختياري)</label>
              <Select 
                value={newExpense.project_id} 
                onChange={e => setNewExpense({...newExpense, project_id: e.target.value})}
                options={[{label: 'مصروف عام (لا يتبع مشروع)', value: ''}, ...projects.map(p => ({label: p.name, value: p.id}))]}
                className="bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">البيان / الوصف (سبب الصرف)</label>
            <Input 
              value={newExpense.description} 
              onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
              placeholder="اكتب سبب الصرف بدقة..." 
              required
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع (من حساب)</label>
              <Select 
                value={newExpense.payment_method} 
                onChange={e => setNewExpense({...newExpense, payment_method: e.target.value})}
                options={[
                  {label: 'الصندوق النقدي (كاش)', value: 'cash'},
                  {label: 'حوالة بنكية (البنك)', value: 'bank'}
                ]}
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ السند</label>
              <Input 
                type="date"
                value={newExpense.expense_date} 
                onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})} 
                required
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ (<span className="text-gray-400">ر.س</span>)</label>
              <Input 
                type="number" 
                step="any"
                min="0.01"
                value={newExpense.amount} 
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                placeholder="0.00" 
                required
                className="bg-white text-xl font-black text-rose-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="px-6 font-bold">إلغاء</Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 shadow-lg shadow-rose-200">
              <CheckCircle className="w-5 h-5 ml-2" /> اعتماد سند الصرف
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Expense Modal */}
      {editExpense && (
        <Modal isOpen={!!editExpense} onClose={() => setEditExpense(null)} title="تعديل سند مصروف" className="max-w-2xl">
          <form onSubmit={handleUpdateExpense} className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-sm font-bold flex items-center gap-3">
              <Pencil className="w-5 h-5 text-amber-600" />
              تعديل المصروف سيقوم بتعديل القيد المحاسبي المرتبط به أيضاً.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تصنيف المصروف / البند</label>
                <Select 
                  value={editExpense.category} 
                  onChange={e => setEditExpense({...editExpense, category: e.target.value})}
                  options={[
                    {label: 'اختر تصنيفاً...', value: ''},
                    {label: 'رواتب وأجور عاملين', value: 'رواتب وأجور عاملين'},
                    {label: 'إيجار مقر أو مستودع', value: 'إيجار مقر أو مستودع'},
                    {label: 'فواتير (كهرباء، ماء، اتصالات)', value: 'فواتير (كهرباء، ماء، اتصالات)'},
                    {label: 'وقود ومواصلات', value: 'وقود ومواصلات'},
                    {label: 'صيانة وإصلاح', value: 'صيانة وإصلاح'},
                    {label: 'ضيافة وبوفيه', value: 'ضيافة وبوفيه'},
                    {label: 'رسوم حكومية ورخص', value: 'رسوم حكومية ورخص'},
                    {label: 'مواد نظافة وتغليف', value: 'مواد نظافة وتغليف'},
                    {label: 'مصروفات نثرية عامة', value: 'مصروفات نثرية عامة'}
                  ]}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الارتباط بمشروع (اختياري)</label>
                <Select 
                  value={editExpense.project_id || ''} 
                  onChange={e => setEditExpense({...editExpense, project_id: e.target.value})}
                  options={[{label: 'مصروف عام (لا يتبع مشروع)', value: ''}, ...projects.map(p => ({label: p.name, value: p.id}))]}
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البيان / الوصف (سبب الصرف)</label>
              <Input 
                value={editExpense.description} 
                onChange={e => setEditExpense({...editExpense, description: e.target.value})} 
                placeholder="اكتب سبب الصرف بدقة..." 
                required
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع (من حساب)</label>
                <Select 
                  value={editExpense.payment_method} 
                  onChange={e => setEditExpense({...editExpense, payment_method: e.target.value})}
                  options={[
                    {label: 'الصندوق النقدي (كاش)', value: 'cash'},
                    {label: 'حوالة بنكية (البنك)', value: 'bank'}
                  ]}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ السند</label>
                <Input 
                  type="date"
                  value={editExpense.expense_date} 
                  onChange={e => setEditExpense({...editExpense, expense_date: e.target.value})} 
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ (<span className="text-gray-400">ر.س</span>)</label>
                <Input 
                  type="number" 
                  step="any"
                  min="0.01"
                  value={editExpense.amount} 
                  onChange={e => setEditExpense({...editExpense, amount: e.target.value})} 
                  required
                  className="bg-white text-xl font-black text-rose-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={() => setEditExpense(null)} className="px-6 font-bold">إلغاء</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 shadow-lg shadow-amber-200">
                <CheckCircle className="w-5 h-5 ml-2" /> حفظ التعديلات
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Expense Modal */}
      {viewExpense && (
        <Modal isOpen={!!viewExpense} onClose={() => setViewExpense(null)} title={`تفاصيل سند الصرف: EXP-${String(viewExpense.id).padStart(4, '0')}`} className="max-w-2xl">
          <div className="space-y-6 p-2">
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-rose-800/70 mb-1">المبلغ الإجمالي</p>
                <p className="text-3xl font-black text-rose-700">{(viewExpense.amount || 0).toLocaleString()} <span className="text-sm">ر.س</span></p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-rose-800/70 mb-1">تاريخ السند</p>
                <p className="font-black text-rose-700">{new Date(viewExpense.expense_date || new Date()).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 mb-1">المشروع المرتبط</p>
                <p className="font-black text-gray-800">{viewExpense.project_name || 'مصروف عام (إدارة)'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 mb-1">التصنيف المحاسبي</p>
                <p className="font-black text-indigo-600">{viewExpense.category || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                <p className="text-xs font-bold text-gray-400 mb-1">البيان / الوصف</p>
                <p className="font-bold text-gray-700">{viewExpense.description || '-'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={() => setViewExpense(null)} className="px-6 font-bold">إغلاق</Button>
              <Button onClick={() => handlePrintVoucher(viewExpense)} className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-8 shadow-lg">
                <Printer className="w-5 h-5 ml-2" /> طباعة السند
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

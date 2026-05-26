import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../../components/UI';
import { Receipt, Plus, FileText, CreditCard } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newExpense, setNewExpense] = useState({ project_id: '', category: '', amount: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (window.electronAPI) {
      const exp = await window.electronAPI.queryDb(`
        SELECT e.*, p.name as project_name 
        FROM expenses e 
        LEFT JOIN projects p ON e.project_id = p.id 
        ORDER BY e.id DESC
      `);
      setExpenses(exp);
      
      const proj = await window.electronAPI.queryDb('SELECT id, name FROM projects');
      setProjects(proj);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.category) return;
    
    if (window.electronAPI) {
      // 1. تسجيل المصروف
      await window.electronAPI.executeDb(
        'INSERT INTO expenses (project_id, category, amount, description) VALUES (?, ?, ?, ?)',
        [newExpense.project_id || null, newExpense.category, Number(newExpense.amount), newExpense.description]
      );
      
      // 2. تسجيل القيد المحاسبي المزدوج (Double Entry)
      const desc = `مصروف (${newExpense.category}) - ${newExpense.description}`;
      // المدين (المصروفات زادت)
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description) VALUES (?, ?, ?, ?)',
        ['5001', Number(newExpense.amount), 0, desc]
      );
      // الدائن (النقدية/البنك نقصت)
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description) VALUES (?, ?, ?, ?)',
        ['1001', 0, Number(newExpense.amount), desc]
      );

      setNewExpense({ project_id: '', category: '', amount: '', description: '' });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-rose-600" />
          المصروفات النثرية
        </h1>
        <p className="text-gray-500 mt-2">تسجيل المصاريف وربطها بالمشاريع مع ترحيلها محاسبياً بشكل آلي.</p>
      </div>

      <Card className="p-6 border-t-4 border-t-rose-500 shadow-sm bg-white">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-rose-600" /> إضافة مصروف جديد
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">المشروع (اختياري)</label>
            <Select 
              value={newExpense.project_id} 
              onChange={e => setNewExpense({...newExpense, project_id: e.target.value})}
              options={[{label: 'مصروف عام (إدارة)', value: ''}, ...projects.map(p => ({label: p.name, value: p.id}))]}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">نوع المصروف</label>
            <Select 
              value={newExpense.category} 
              onChange={e => setNewExpense({...newExpense, category: e.target.value})}
              options={[
                {label: 'اختر...', value: ''},
                {label: 'وقود ومواصلات', value: 'وقود ومواصلات'},
                {label: 'ضيافة وبوفيه', value: 'ضيافة وبوفيه'},
                {label: 'صيانة معدات', value: 'صيانة معدات'},
                {label: 'رسوم حكومية', value: 'رسوم حكومية'},
                {label: 'مصاريف أخرى', value: 'مصاريف أخرى'}
              ]}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ (ر.س)</label>
            <Input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">البيان / الوصف</label>
            <Input value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="تفاصيل المصروف..." />
          </div>
          <div className="md:col-span-1">
            <Button onClick={handleAddExpense} variant="primary" className="w-full bg-rose-600 hover:bg-rose-700 border-none shadow-lg shadow-rose-200">
              اعتماد وترحيل
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden shadow-sm bg-white">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            سجل المصروفات
          </h3>
          <p className="text-sm font-bold text-gray-500">
            إجمالي المصروفات: <span className="text-rose-600 font-black">{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} ر.س</span>
          </p>
        </div>
        <table className="w-full text-right text-sm">
          <thead className="bg-white text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold">التاريخ</th>
              <th className="p-4 font-bold">المشروع</th>
              <th className="p-4 font-bold">التصنيف</th>
              <th className="p-4 font-bold">البيان</th>
              <th className="p-4 font-bold">المبلغ</th>
              <th className="p-4 font-bold">الحالة المحاسبية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500 text-xs">{new Date(exp.expense_date).toLocaleString('ar-SA')}</td>
                <td className="p-4 font-bold text-gray-700">{exp.project_name || 'مصروف عام (إدارة)'}</td>
                <td className="p-4 font-bold text-indigo-600">{exp.category}</td>
                <td className="p-4 text-gray-600">{exp.description}</td>
                <td className="p-4 font-black text-rose-600">{exp.amount.toLocaleString()} ر.س</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase flex items-center gap-1 w-max">
                    <CreditCard className="w-3 h-3" /> تم الترحيل (قيد مزدوج)
                  </span>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">لا توجد مصروفات مسجلة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

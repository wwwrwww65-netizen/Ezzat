import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../components/UI';
import { Users, UserPlus, DollarSign, Briefcase, HandCoins } from 'lucide-react';

export default function Employees() {
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', basic_salary: '' });
  
  // Advance/Deduction Modal State
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [advanceData, setAdvanceData] = useState({ amount: '', reason: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    if (window.electronAPI) {
      // نجلب الموظفين مع مجموع سلفهم لحساب الراتب الصافي
      const rows = await window.electronAPI.queryDb(`
        SELECT s.*, COALESCE(SUM(a.amount), 0) as total_advances
        FROM staff s
        LEFT JOIN staff_advances a ON s.id = a.staff_id
        GROUP BY s.id
        ORDER BY s.id DESC
      `);
      setStaff(rows);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.basic_salary) return;
    if (window.electronAPI) {
      await window.electronAPI.executeDb(
        'INSERT INTO staff (name, role, basic_salary) VALUES (?, ?, ?)',
        [newStaff.name, newStaff.role, Number(newStaff.basic_salary)]
      );
      setNewStaff({ name: '', role: '', basic_salary: '' });
      fetchStaff();
    }
  };

  const handleAddAdvance = async () => {
    if (!advanceData.amount || !selectedStaff) return;
    if (window.electronAPI) {
      await window.electronAPI.executeDb(
        'INSERT INTO staff_advances (staff_id, amount, reason) VALUES (?, ?, ?)',
        [selectedStaff.id, Number(advanceData.amount), advanceData.reason]
      );
      setAdvanceData({ amount: '', reason: '' });
      setShowAdvanceModal(false);
      fetchStaff();
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* نافذة تسجيل السلف (Advance Modal) */}
      {showAdvanceModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 max-w-full">
            <h3 className="text-xl font-black text-gray-800 mb-2 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-amber-500" /> تسجيل سلفة / خصم
            </h3>
            <p className="text-sm text-gray-500 mb-4 font-bold">الموظف: <span className="text-primary-600">{selectedStaff?.name}</span></p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المبلغ (ر.س)</label>
                <Input type="number" value={advanceData.amount} onChange={e => setAdvanceData({...advanceData, amount: e.target.value})} placeholder="مثال: 500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">السبب / الملاحظات</label>
                <Input value={advanceData.reason} onChange={e => setAdvanceData({...advanceData, reason: e.target.value})} placeholder="مثال: سلفة منتصف الشهر" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddAdvance} variant="primary" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold border-none">اعتماد السلفة</Button>
              <Button onClick={() => setShowAdvanceModal(false)} variant="outline" className="flex-1 text-gray-700 font-bold">إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-600" />
            شؤون الموظفين
          </h1>
          <p className="text-gray-500 mt-2">إدارة المهندسين، الإداريين، الرواتب، وتسجيل السلف والخصومات.</p>
        </div>
      </div>

      <Card className="p-6 border-t-4 border-t-primary-500 shadow-sm bg-white">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary-600" /> إضافة موظف جديد
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم الموظف</label>
            <Input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="الاسم الرباعي" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">المسمى الوظيفي</label>
            <Select 
              value={newStaff.role} 
              onChange={e => setNewStaff({...newStaff, role: e.target.value})}
              options={[
                {label: 'اختر...', value: ''},
                {label: 'مهندس موقع', value: 'مهندس موقع'},
                {label: 'مهندس حصر كميات', value: 'مهندس حصر كميات'},
                {label: 'محاسب', value: 'محاسب'},
                {label: 'مدير مشروع', value: 'مدير مشروع'},
                {label: 'إداري', value: 'إداري'}
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الراتب الأساسي (ر.س)</label>
            <Input type="number" value={newStaff.basic_salary} onChange={e => setNewStaff({...newStaff, basic_salary: e.target.value})} placeholder="الراتب الشهري" />
          </div>
          <Button onClick={handleAddStaff} variant="primary" className="w-full">
            حفظ الموظف
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staff.map(emp => (
          <Card key={emp.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow bg-white">
            <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-black text-gray-800 text-lg">{emp.name}</h3>
                <p className="text-sm font-bold text-primary-600 mt-1">{emp.role || 'غير محدد'}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm"><Users className="w-5 h-5 text-gray-400" /></div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-500">الراتب الأساسي</span>
                <span className="font-black text-gray-700">{emp.basic_salary.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-4">
                <span className="font-bold text-red-500 flex items-center gap-1">السلفيات والخصومات</span>
                <span className="font-black text-red-600">{emp.total_advances.toLocaleString()} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-gray-800 text-sm">صافي الراتب المستحق</span>
                <span className="font-black text-green-600 text-xl">{(emp.basic_salary - emp.total_advances).toLocaleString()} ر.س</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <Button 
                onClick={() => { setSelectedStaff(emp); setShowAdvanceModal(true); }}
                variant="secondary" 
                className="w-full bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
              >
                تسجيل سلفة مالية
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

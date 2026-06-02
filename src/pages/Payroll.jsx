import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Button, Table, Badge, Input, Select } from '../components/UI';
import { Wallet, Printer, CheckCircle, RefreshCcw, DollarSign, Calendar, Clock, Settings2 } from 'lucide-react';

export default function Payroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Cycle controls state
  const [cycleStart, setCycleStart] = useState('2024-01-01');
  const [cycleDuration, setCycleDuration] = useState('30');
  const [autoReset, setAutoReset] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    if (window.electronAPI) {
      const rows = await window.electronAPI.queryDb(`
        SELECT s.id, s.name, s.role, s.basic_salary, COALESCE(SUM(a.amount), 0) as total_advances
        FROM staff s
        LEFT JOIN staff_advances a ON s.id = a.staff_id
        GROUP BY s.id
        ORDER BY s.name ASC
      `);
      setPayrollData(rows || []);
    }
    setLoading(false);
  };

  const totalBasic = payrollData.reduce((acc, emp) => acc + (emp.basic_salary || 0), 0);
  const totalAdvances = payrollData.reduce((acc, emp) => acc + (emp.total_advances || 0), 0);
  const totalNet = totalBasic - totalAdvances;

  const handlePrint = () => {
    window.print();
  };

  const handleCloseCycle = async () => {
    if(!await confirmDialog('هل أنت متأكد من إقفال الدورة وتصفير جميع السلفيات؟ (سيتم ترحيل مسير الرواتب)')) return;
    
    if (window.electronAPI) {
      // Create journal entry for total payroll
      const desc = `صرف مسير رواتب الشهر بإجمالي: ${totalNet}`;
      const entryDate = new Date().toISOString().split('T')[0];
      
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        ['1001', 0, totalNet, desc, entryDate] // الخزينة تنقص
      );

      // Clear all advances
      await window.electronAPI.executeDb('DELETE FROM staff_advances');
      
      alert('تم إقفال الدورة بنجاح وتصفير السلف والترحيل المحاسبي.');
      fetchPayroll();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-600" />
            مسير الرواتب الشهري المجمع
          </h1>
          <p className="text-sm text-gray-500 mt-1">تجميع استحقاقات الموظفين، السلف، وإصدار أوامر الدفع الدورية.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPayroll} className="bg-white">
            <RefreshCcw className="w-4 h-4 ml-2" /> تحديث
          </Button>
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">
            <Printer className="w-4 h-4 ml-2" /> طباعة المسير
          </Button>
        </div>
      </div>

      {/* Cycle Controls (Mr Cashier Style) */}
      <Card className="p-6 border-none shadow-sm bg-slate-900/40 rounded-2xl mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-400" /> إعدادات دورة الرواتب
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
           <div>
             <label className="block text-xs font-bold text-gray-400 mb-2">بداية الدورة</label>
             <div className="relative">
               <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
               <Input type="date" value={cycleStart} onChange={e => setCycleStart(e.target.value)} className="pl-4 pr-10 bg-slate-800/50 border-slate-700/50 text-white" />
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-400 mb-2">المدة (بالأيام)</label>
             <div className="relative">
               <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
               <Input type="number" min="1" max="365" value={cycleDuration} onChange={e => setCycleDuration(e.target.value)} className="pl-4 pr-10 bg-slate-800/50 border-slate-700/50 text-white" />
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-400 mb-2">التصفير التلقائي للسلف</label>
             <Select 
               value={autoReset ? 'yes' : 'no'} 
               onChange={e => setAutoReset(e.target.value === 'yes')}
               options={[{label: 'مفعل (تلقائي بنهاية الدورة)', value: 'yes'}, {label: 'معطل (يدوي فقط)', value: 'no'}]}
               className="bg-slate-800/50 border-slate-700/50 text-white"
             />
           </div>
           <div className="flex gap-2">
             <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-none">حفظ الإعدادات</Button>
           </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 bg-gradient-to-l from-indigo-50 to-white border-none shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">إجمالي الرواتب الأساسية</p>
              <h3 className="text-2xl font-black text-indigo-700">{totalBasic.toLocaleString()} <span className="text-xs">ر.س</span></h3>
            </div>
         </Card>
         <Card className="p-6 bg-gradient-to-l from-red-50 to-white border-none shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <RefreshCcw className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">إجمالي السلف والخصومات</p>
              <h3 className="text-2xl font-black text-red-600">{totalAdvances.toLocaleString()} <span className="text-xs">ر.س</span></h3>
            </div>
         </Card>
         <Card className="p-6 bg-gradient-to-l from-emerald-50 to-white border-none shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">صافي الرواتب المستحقة (الصرف)</p>
              <h3 className="text-2xl font-black text-emerald-600">{totalNet.toLocaleString()} <span className="text-xs">ر.س</span></h3>
            </div>
         </Card>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm bg-white print-container">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="font-black text-gray-800">كشف الرواتب المفصل</h3>
           <Button onClick={handleCloseCycle} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold no-print shadow-md shadow-emerald-200">
             <CheckCircle className="w-4 h-4 ml-2" /> إقفال دورة الرواتب (تصفير الكل)
           </Button>
        </div>
        
        <Table headers={['الموظف', 'الوظيفة', 'الراتب الأساسي', 'السلف المخصومة', 'صافي الراتب', 'الحالة']}>
          {loading ? (
             <tr><td colSpan="6" className="text-center py-8">جاري التحميل...</td></tr>
          ) : payrollData.length === 0 ? (
             <tr><td colSpan="6" className="text-center py-8 text-gray-400 font-bold">لا يوجد موظفين حالياً.</td></tr>
          ) : (
            payrollData.map(emp => {
              const net = emp.basic_salary - emp.total_advances;
              return (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{emp.name.charAt(0)}</div>
                        <span className="font-bold text-gray-900">{emp.name}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600">{emp.role || 'غير محدد'}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-800">{emp.basic_salary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-black text-red-500">{emp.total_advances.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600">{net.toLocaleString()}</td>
                  <td className="px-6 py-4">
                     <Badge variant={net > 0 ? 'success' : (net < 0 ? 'danger' : 'neutral')}>
                       {net > 0 ? 'مستحق للصرف' : (net < 0 ? 'مطلوب للمؤسسة' : 'مُصَفّر')}
                     </Badge>
                  </td>
                </tr>
              )
            })
          )}
        </Table>
      </Card>
    </div>
  );
}

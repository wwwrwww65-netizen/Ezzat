import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Button, Input, Select, Table, Modal, Badge } from '../components/UI';
import { Users, UserPlus, DollarSign, Briefcase, HandCoins, CheckCircle, Clock, Trash2, Pencil, Search, FileText, Wallet, CreditCard, Calculator, ArrowRight, Activity, Paperclip, Camera, MapPin, XCircle, Flag, Printer, RefreshCcw, History, ShieldAlert } from 'lucide-react';
import { cn } from '../components/UI';

export default function Employees() {
  const [staff, setStaff] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views: 'list', 'add', 'profile'
  const [currentView, setCurrentView] = useState('list');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [profileTab, setProfileTab] = useState('attendance'); // 'attendance', 'finances', 'personal'
  const [empAdvances, setEmpAdvances] = useState([]);
  const [empAttendance, setEmpAttendance] = useState([]);
  
  // State for forms
  const [newStaff, setNewStaff] = useState({ 
    name: '', nationality: '', phone: '', iqama: '', iqama_expiry: '',
    role: '', branch: 'الفرع الرئيسي', status: 'نشط', start_date: '', shift: 'صباحي', working_hours: '8', 
    basic_salary: '', housing_allowance: '0', transport_allowance: '0', other_allowances: '0',
    username: '', password: '', notes: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  // Advance/Deduction Modal
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceData, setAdvanceData] = useState({ employee_id: '', amount: '', reason: '', payment_method: 'cash', type: 'advance' });

  // Penalty Modal
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyData, setPenaltyData] = useState({ employee_id: '', amount: '', reason: '' });
  const [penaltyRules, setPenaltyRules] = useState([]);

  // Removed duplicate empAttendance

  useEffect(() => {
    initAndFetch();
  }, []);

  const initAndFetch = async () => {
    if (window.electronAPI) {
      await window.electronAPI.executeDb(`
        CREATE TABLE IF NOT EXISTS staff_attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          staff_id INTEGER,
          date TEXT,
          time TEXT,
          status TEXT,
          created_by TEXT DEFAULT 'مدير النظام'
        )
      `);
      // Ensure new columns exist
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN phone TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN iqama TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN nationality TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN iqama_expiry TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN start_date TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN shift TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN working_hours INTEGER"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN system_username TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN system_password TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN notes TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN branch TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN status TEXT"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN housing_allowance REAL"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN transport_allowance REAL"); } catch(e){}
      try { await window.electronAPI.executeDb("ALTER TABLE staff ADD COLUMN other_allowances REAL"); } catch(e){}

      // Create attendance table if not exists
      await window.electronAPI.executeDb(`
        CREATE TABLE IF NOT EXISTS staff_attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          staff_id INTEGER,
          date TEXT,
          time TEXT,
          status TEXT,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Load penalty rules for auto-fill in penalty modal
      try {
        const pr = await window.electronAPI.queryDb('SELECT * FROM penalty_rules ORDER BY is_system DESC, id ASC');
        setPenaltyRules(pr || []);
      } catch(e) { setPenaltyRules([]); }

      // Load job roles for employee form
      try {
        const jr = await window.electronAPI.queryDb('SELECT name FROM job_roles ORDER BY id ASC');
        setJobRoles((jr || []).map(r => r.name));
      } catch(e) { setJobRoles([]); }

      const rows = await window.electronAPI.queryDb(`
        SELECT s.*, COALESCE(SUM(a.amount), 0) as total_advances
        FROM staff s
        LEFT JOIN staff_advances a ON s.id = a.staff_id
        GROUP BY s.id
        ORDER BY s.id DESC
      `);
      setStaff(rows || []);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (window.electronAPI) {
      if (editingId) {
        await window.electronAPI.executeDb(
          `UPDATE staff SET 
            name=?, nationality=?, phone=?, iqama=?, iqama_expiry=?, role=?, branch=?, status=?, start_date=?, shift=?, working_hours=?, 
            basic_salary=?, housing_allowance=?, transport_allowance=?, other_allowances=?, system_username=?, system_password=?, notes=?
          WHERE id=?`,
          [
            newStaff.name, newStaff.nationality, newStaff.phone, newStaff.iqama, newStaff.iqama_expiry,
            newStaff.role, newStaff.branch, newStaff.status, newStaff.start_date, newStaff.shift, Number(newStaff.working_hours), 
            Number(newStaff.basic_salary), Number(newStaff.housing_allowance), Number(newStaff.transport_allowance), Number(newStaff.other_allowances),
            newStaff.username, newStaff.password, newStaff.notes,
            editingId
          ]
        );
      } else {
        await window.electronAPI.executeDb(
          `INSERT INTO staff (
            name, nationality, phone, iqama, iqama_expiry, role, branch, status, start_date, shift, working_hours, 
            basic_salary, housing_allowance, transport_allowance, other_allowances, system_username, system_password, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newStaff.name, newStaff.nationality, newStaff.phone, newStaff.iqama, newStaff.iqama_expiry,
            newStaff.role, newStaff.branch, newStaff.status, newStaff.start_date, newStaff.shift, Number(newStaff.working_hours), 
            Number(newStaff.basic_salary), Number(newStaff.housing_allowance), Number(newStaff.transport_allowance), Number(newStaff.other_allowances),
            newStaff.username, newStaff.password, newStaff.notes
          ]
        );
      }
      setNewStaff({ 
        name: '', nationality: '', phone: '', iqama: '', iqama_expiry: '',
        role: '', branch: 'الفرع الرئيسي', status: 'نشط', start_date: '', shift: 'صباحي', working_hours: '8', 
        basic_salary: '', housing_allowance: '0', transport_allowance: '0', other_allowances: '0',
        username: '', password: '', notes: '' 
      });
      setEditingId(null);
      setCurrentView('list');
      initAndFetch();
    }
  };

  const startEditStaff = (emp) => {
    setNewStaff({
      name: emp.name || '', nationality: emp.nationality || '', phone: emp.phone || '', iqama: emp.iqama || '', iqama_expiry: emp.iqama_expiry || '',
      role: emp.role || '', branch: emp.branch || 'الفرع الرئيسي', status: emp.status || 'نشط', start_date: emp.start_date || '', shift: emp.shift || 'صباحي', working_hours: emp.working_hours || '8', 
      basic_salary: emp.basic_salary || '', housing_allowance: emp.housing_allowance || '0', transport_allowance: emp.transport_allowance || '0', other_allowances: emp.other_allowances || '0',
      username: emp.system_username || '', password: emp.system_password || '', notes: emp.notes || '' 
    });
    setEditingId(emp.id);
    setCurrentView('add');
  };

  const handleDeleteStaff = async (id) => {
    if(!await confirmDialog('هل أنت متأكد من حذف هذا الموظف وملفاته المرتبطة؟')) return;
    if (window.electronAPI) {
      await window.electronAPI.executeDb('DELETE FROM staff_advances WHERE staff_id = ?', [id]);
      await window.electronAPI.executeDb('DELETE FROM staff WHERE id = ?', [id]);
      initAndFetch();
    }
  };

  const handleAddAdvance = async (e) => {
    e.preventDefault();
    if (!advanceData.employee_id || !window.electronAPI) return;
    
    const amountNum = Number(advanceData.amount);
    if (amountNum > 0) {
      const typeText = advanceData.type === 'salary' ? 'راتب' : advanceData.type === 'bonus' ? 'مكافأة' : 'سلفة';
      const paymentText = advanceData.payment_method === 'cash' ? 'الخزينة/كاش' : 'تحويل بنكي';
      const finalReason = `${typeText} (${paymentText}): ${advanceData.reason}`;
      
      await window.electronAPI.executeDb(
        'INSERT INTO staff_advances (staff_id, amount, reason, date) VALUES (?, ?, ?, ?)',
        [Number(advanceData.employee_id), amountNum, finalReason, new Date().toISOString().split('T')[0]]
      );
      
      const targetStaff = staff.find(s => s.id === Number(advanceData.employee_id));
      const desc = `${advanceData.type === 'advance' ? 'سلفة' : advanceData.type === 'salary' ? 'راتب' : 'مكافأة'} للموظف: ${targetStaff?.name || ''} - ${advanceData.reason}`;
      const entryDate = new Date().toISOString().split('T')[0];
      
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        [advanceData.payment_method === 'cash' ? '1001' : '1002', 0, amountNum, desc, entryDate]
      );

      setAdvanceData({ employee_id: '', amount: '', reason: '', payment_method: 'cash', type: 'advance' });
      setShowAdvanceModal(false);
      
      if (currentView === 'profile' && selectedStaff) {
         fetchProfileData(selectedStaff.id);
      }
      initAndFetch();
    }
  };

  const handleAddPenalty = async (e) => {
    e.preventDefault();
    if (!penaltyData.employee_id || !window.electronAPI) return;
    
    const amountNum = Number(penaltyData.amount);
    if (amountNum > 0) {
      await window.electronAPI.executeDb(
        'INSERT INTO staff_advances (staff_id, amount, reason, date) VALUES (?, ?, ?, ?)',
        [Number(penaltyData.employee_id), amountNum, `خصم/جزاء: ${penaltyData.reason}`, new Date().toISOString().split('T')[0]]
      );
      
      const targetStaff = staff.find(s => s.id === Number(penaltyData.employee_id));
      const desc = `جزاء مالي على الموظف: ${targetStaff?.name || ''} - ${penaltyData.reason}`;
      const entryDate = new Date().toISOString().split('T')[0];
      
      // الترحيل المحاسبي للجزاءات (تخفيض الالتزامات / الرواتب المستحقة)
      await window.electronAPI.executeDb(
        'INSERT INTO accounting_journal (account_code, debit, credit, description, entry_date) VALUES (?, ?, ?, ?, ?)',
        ['2001', amountNum, 0, desc, entryDate] // الرواتب المستحقة مدين (نقص الالتزام)
      );

      setPenaltyData({ employee_id: '', amount: '', reason: '' });
      setShowPenaltyModal(false);
      
      if (currentView === 'profile' && selectedStaff) {
         fetchProfileData(selectedStaff.id);
      }
      initAndFetch();
    }
  };

  const fetchProfileData = async (staffId) => {
    if (window.electronAPI) {
      const advances = await window.electronAPI.queryDb('SELECT * FROM staff_advances WHERE staff_id = ? ORDER BY id DESC', [staffId]);
      setEmpAdvances(advances || []);
      
      const attendance = await window.electronAPI.queryDb('SELECT * FROM staff_attendance WHERE staff_id = ? ORDER BY id DESC', [staffId]);
      setEmpAttendance(attendance || []);
    }
  };

  const handleMarkAttendance = async (status) => {
    if (!selectedStaff || !window.electronAPI) return;
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);
    
    // Check for existing record
    const existing = await window.electronAPI.queryDb('SELECT id, status FROM staff_attendance WHERE staff_id = ? AND date = ?', [selectedStaff.id, dateStr]);
    
    if (existing && existing.length > 0) {
      if (!await confirmDialog(`تم تسجيل حالة (${existing[0].status}) مسبقاً لهذا اليوم. هل تريد تغييرها إلى (${status})؟`)) return;
      await window.electronAPI.executeDb('UPDATE staff_attendance SET status = ?, time = ? WHERE id = ?', [status, timeStr, existing[0].id]);
      
      // If changed to absence, deduct if not already deducted today
      if (status === 'غياب' && existing[0].status !== 'غياب') {
        const dailyRate = selectedStaff.basic_salary / 30;
        await window.electronAPI.executeDb(
          'INSERT INTO staff_advances (staff_id, amount, reason, date) VALUES (?, ?, ?, ?)',
          [selectedStaff.id, dailyRate, `خصم/جزاء (غياب آلي): غياب يوم ${dateStr}`, dateStr]
        );
      }
    } else {
      await window.electronAPI.executeDb(
        'INSERT INTO staff_attendance (staff_id, date, time, status) VALUES (?, ?, ?, ?)',
        [selectedStaff.id, dateStr, timeStr, status]
      );

      if (status === 'غياب') {
        const dailyRate = selectedStaff.basic_salary / 30;
        await window.electronAPI.executeDb(
          'INSERT INTO staff_advances (staff_id, amount, reason, date) VALUES (?, ?, ?, ?)',
          [selectedStaff.id, dailyRate, `خصم/جزاء (غياب آلي): غياب يوم ${dateStr}`, dateStr]
        );
      }
    }
    
    fetchProfileData(selectedStaff.id);
  };

  const openProfile = (emp) => {
    setSelectedStaff(emp); 
    setCurrentView('profile'); 
    setProfileTab('attendance');
    fetchProfileData(emp.id);
  };

  const totalEmployees = staff.length;
  const totalPayroll = staff.reduce((acc, emp) => acc + (emp.basic_salary || 0), 0);
  const totalAdvances = staff.reduce((acc, emp) => acc + (emp.total_advances || 0), 0);
  
  const filteredStaff = staff.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (emp.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.iqama || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            {currentView === 'add' ? (
              <><UserPlus className="w-8 h-8 text-pink-500" /> {editingId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</>
            ) : currentView === 'profile' ? (
              <><Users className="w-8 h-8 text-pink-500" /> الملف الشخصي للموظف</>
            ) : (
              <><Users className="w-8 h-8 text-pink-500" /> دليل الموظفين والطاقم</>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            {currentView === 'add' ? 'إدخال كافة بيانات الموظف والصلاحيات' : currentView === 'profile' ? 'البيانات، السلف، والحضور' : 'إدارة ومتابعة جميع الموظفين'}
          </p>
        </div>
        
        {currentView === 'list' && (
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
            <Button onClick={() => window.location.hash = '#/employees/history'} className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold h-11 px-5 rounded-xl border-none shadow-md">
              <History className="w-4 h-4 ml-2" /> السجل الكامل
            </Button>
            <Button className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold h-11 px-5 rounded-xl border border-red-500/20 shadow-none" onClick={() => setShowPenaltyModal(true)}>
              <ShieldAlert className="w-4 h-4 ml-2" /> خصم / جزاء
            </Button>
            <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-xl border-none shadow-md shadow-blue-500/20" onClick={() => setShowAdvanceModal(true)}>
              <HandCoins className="w-4 h-4 ml-2" /> صرف سلفة / راتب
            </Button>
            
            <Button onClick={() => {
              setNewStaff({ 
                name: '', nationality: '', phone: '', iqama: '', iqama_expiry: '',
                role: '', branch: 'الفرع الرئيسي', status: 'نشط', start_date: '', shift: 'صباحي', working_hours: '8', 
                basic_salary: '', housing_allowance: '0', transport_allowance: '0', other_allowances: '0',
                username: '', password: '', notes: '' 
              });
              setEditingId(null);
              setCurrentView('add');
            }} className="flex-1 md:flex-none bg-pink-600 hover:bg-pink-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-pink-500/20 md:mr-auto">
              <UserPlus className="w-5 h-5 ml-2" /> إضافة موظف جديد
            </Button>
          </div>
        )}
        
        {currentView === 'profile' && (
          <div className="flex gap-2">
            <Button onClick={() => startEditStaff(selectedStaff)} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Pencil className="w-4 h-4 ml-2" /> تعديل
            </Button>
            <Button className="bg-gray-600 text-white" onClick={() => window.print()}>
              <Printer className="w-4 h-4 ml-2" /> طباعة
            </Button>
          </div>
        )}
      </div>

      {currentView === 'list' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-none shadow-sm flex flex-col justify-center gap-2 border-t-4 border-t-pink-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">إجمالي الموظفين</p>
                  <h3 className="text-xl font-black text-gray-800">{totalEmployees}</h3>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-none shadow-sm flex flex-col justify-center gap-2 border-t-4 border-t-amber-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">المتأخرون عن الدوام</p>
                  <h3 className="text-xl font-black text-gray-800">0</h3>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-none shadow-sm flex flex-col justify-center gap-2 border-t-4 border-t-emerald-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">المجازون</p>
                  <h3 className="text-xl font-black text-gray-800">{staff.filter(s => s.status === 'مجاز').length}</h3>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-none shadow-sm flex flex-col justify-center gap-2 border-t-4 border-t-indigo-500 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">إجمالي الرواتب الأساسية</p>
                  <h3 className="text-xl font-black text-gray-800">{totalPayroll.toLocaleString()} <span className="text-xs">ر.س</span></h3>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and View Toggles */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
            <div className="flex gap-2 flex-wrap">
               <Select className="text-sm bg-gray-50/50" options={[{label: 'كل الفروع', value: ''}, {label: 'الفرع الرئيسي', value: 'main'}, {label: 'فرع المستودع', value: 'store'}]} />
               <Select className="text-sm bg-gray-50/50" options={[{label: 'كل الحالات', value: ''}, {label: 'نشط', value: 'active'}, {label: 'مجاز', value: 'leave'}, {label: 'موقوف', value: 'suspended'}]} />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="البحث بالاسم أو الهاتف..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-4 pr-9 bg-gray-50/50 border-gray-100 text-sm w-full" 
                />
              </div>
              <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                 <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md", viewMode === 'grid' ? "bg-white shadow-sm text-pink-600" : "text-gray-400")}><Briefcase className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('table')} className={cn("p-1.5 rounded-md", viewMode === 'table' ? "bg-white shadow-sm text-pink-600" : "text-gray-400")}><FileText className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Employee List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredStaff.length === 0 ? (
                 <div className="col-span-3 text-center py-12 text-gray-500 font-bold">لا يوجد موظفين مسجلين بهذا الاسم.</div>
              ) : (
                filteredStaff.map(emp => (
                  <Card key={emp.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow bg-slate-900 border border-slate-800 relative group flex flex-col items-center">
                    <div className="absolute top-4 left-4 z-10">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteStaff(emp.id); }} className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-800" title="حذف الموظف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                       <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", emp.status === 'مجاز' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}>
                          {emp.status === 'مجاز' ? 'إجازة / غائب' : 'مداوم الآن'}
                       </span>
                    </div>
                    
                    <div className="w-full pt-10 pb-6 flex flex-col items-center cursor-pointer" onClick={() => openProfile(emp)}>
                      <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-black text-3xl shadow-xl border-4 border-slate-700">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-slate-900">
                          {emp.role || 'غير محدد'}
                        </div>
                      </div>
                      <h3 className="font-black text-white text-xl mt-2">{emp.name}</h3>
                      <p className="text-slate-400 text-sm font-bold">#{emp.id}</p>
                      
                      <div className="flex gap-4 mt-4 text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1" title="الجنسية"><Flag className="w-4 h-4 text-slate-500" /> {emp.nationality || '—'}</span>
                        <span className="flex items-center gap-1" title="رقم الإقامة / الهوية"><CreditCard className="w-4 h-4 text-slate-500" /> {emp.iqama || '—'}</span>
                      </div>
                    </div>
                    
                    <div className="w-full p-4 mt-auto border-t border-slate-800 bg-slate-900/50 flex gap-2">
                      <Button onClick={() => { setSelectedStaff(emp); handleMarkAttendance('حضور'); }} className="flex-1 max-w-[48px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-white border-none p-0 flex items-center justify-center h-10 shadow-none rounded-xl" title="تسجيل حضور">
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                      <Button onClick={() => { setSelectedStaff(emp); handleMarkAttendance('غياب'); }} className="flex-1 max-w-[48px] bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-white border-none p-0 flex items-center justify-center h-10 shadow-none rounded-xl" title="تسجيل غياب">
                        <XCircle className="w-5 h-5" />
                      </Button>
                      <Button onClick={() => openProfile(emp)} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-bold h-10 shadow-none border-none rounded-xl flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> عرض الملف
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card className="p-0 border-none shadow-sm overflow-hidden bg-white">
               <Table headers={['الموظف', 'الوظيفة', 'الفرع', 'الهاتف', 'الحالة', 'إجراءات']}>
                  {filteredStaff.map(emp => (
                     <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">{emp.name.charAt(0)}</div>
                           {emp.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{emp.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{emp.branch || 'الفرع الرئيسي'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{emp.phone}</td>
                        <td className="px-6 py-4">
                           <Badge variant={emp.status === 'مجاز' ? 'warning' : 'success'}>{emp.status || 'نشط'}</Badge>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                           <button onClick={() => openProfile(emp)} className="text-pink-600 hover:bg-pink-50 p-1.5 rounded-lg font-bold text-xs border border-pink-100">الملف</button>
                           <button onClick={() => handleDeleteStaff(emp.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                     </tr>
                  ))}
               </Table>
            </Card>
          )}
        </>
      )}

      {currentView === 'add' && (
        <Card className="max-w-4xl mx-auto p-8 border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-pink-600" />
              إضافة ملف موظف جديد
            </h2>
            <Button variant="ghost" onClick={() => setCurrentView('list')} className="text-gray-500 font-bold">
              العودة للقائمة
            </Button>
          </div>

          <form onSubmit={handleAddStaff} className="space-y-8 relative z-10">
            {/* Upload Avatar Fake Box */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors max-w-xs mx-auto">
               <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                 <Camera className="w-8 h-8 text-pink-500" />
               </div>
               <span className="text-sm font-bold text-gray-600">اضغط لرفع صورة الموظف</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* القسم الشخصي */}
              <div>
                <h3 className="text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <CreditCard className="w-5 h-5" /> البيانات الشخصية
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                    <Input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="مثال: أحمد عبدالله صالح" required className="bg-gray-50/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الجنسية <span className="text-red-500">*</span></label>
                      <Input value={newStaff.nationality} onChange={e => setNewStaff({...newStaff, nationality: e.target.value})} placeholder="يمني / هندي..." required className="bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                      <Input value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} placeholder="05xxxxxxxx" dir="ltr" required className="text-right bg-gray-50/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهوية / الإقامة <span className="text-red-500">*</span></label>
                      <Input value={newStaff.iqama} onChange={e => setNewStaff({...newStaff, iqama: e.target.value})} placeholder="2xxxxxxxxx" required className="bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الانتهاء</label>
                      <Input type="date" value={newStaff.iqama_expiry} onChange={e => setNewStaff({...newStaff, iqama_expiry: e.target.value})} className="bg-gray-50/50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* الوظيفة والراتب */}
              <div>
                <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center gap-2 border-b border-pink-50 pb-2">
                  <Briefcase className="w-5 h-5" /> الوظيفة والراتب
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">القسم / الوظيفة <span className="text-red-500">*</span></label>
                      {jobRoles.length > 0 ? (
                        <Select
                          value={newStaff.role}
                          onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                          required
                          className="bg-gray-50/50"
                          options={[
                            { value: '', label: '— اختر الوظيفة —' },
                            ...jobRoles.map(r => ({ value: r, label: r }))
                          ]}
                        />
                      ) : (
                        <Input
                          value={newStaff.role}
                          onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                          placeholder="مثال: مهندس، محاسب..."
                          required
                          className="bg-gray-50/50"
                        />
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        يمكنك إضافة وظائف جديدة من{' '}
                        <button type="button" onClick={() => window.location.hash='#/employees/job-roles'} className="text-blue-500 hover:underline font-bold">
                          صفحة الوظائف والصلاحيات
                        </button>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ المباشرة</label>
                      <Input type="date" value={newStaff.start_date} onChange={e => setNewStaff({...newStaff, start_date: e.target.value})} className="bg-gray-50/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الوردية / الدوام <span className="text-red-500">*</span></label>
                      <Select 
                        value={newStaff.shift} 
                        onChange={e => setNewStaff({...newStaff, shift: e.target.value})}
                        options={[
                          {label: 'صباحي (Morning)', value: 'صباحي'},
                          {label: 'مسائي (Evening)', value: 'مسائي'},
                          {label: 'دوام كامل (Full Day)', value: 'كامل'},
                          {label: 'مفتوح / منزلي', value: 'مفتوح'}
                        ]}
                        required
                        className="bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ساعات العمل</label>
                      <Input type="number" min="1" max="24" value={newStaff.working_hours} onChange={e => setNewStaff({...newStaff, working_hours: e.target.value})} placeholder="8 ساعات" className="bg-gray-50/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الراتب الأساسي (<span className="text-gray-400">ر.س</span>) <span className="text-red-500">*</span></label>
                    <Input 
                      type="number" 
                      step="any"
                      min="0"
                      value={newStaff.basic_salary} 
                      onChange={e => setNewStaff({...newStaff, basic_salary: e.target.value})} 
                      placeholder="مثال: 4000" 
                      required 
                      className="bg-gray-50/50 text-xl font-black text-pink-600"
                    />
                  </div>

                  {/* Allowances Details */}
                  <h4 className="text-xs font-bold text-gray-400 mt-6 mb-3 border-b border-gray-100 pb-2">تفصيل بدلات الراتب (اختياري)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">بدل سكن</label>
                      <Input type="number" step="any" min="0" value={newStaff.housing_allowance} onChange={e => setNewStaff({...newStaff, housing_allowance: e.target.value})} className="bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">بدل تنقلات</label>
                      <Input type="number" step="any" min="0" value={newStaff.transport_allowance} onChange={e => setNewStaff({...newStaff, transport_allowance: e.target.value})} className="bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">بدلات أخرى</label>
                      <Input type="number" step="any" min="0" value={newStaff.other_allowances} onChange={e => setNewStaff({...newStaff, other_allowances: e.target.value})} className="bg-gray-50/50" />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-gray-400 mt-6 mb-3 border-b border-gray-100 pb-2">بيانات الدخول والنظام (مستر كاشير)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                      <Input value={newStaff.username} onChange={e => setNewStaff({...newStaff, username: e.target.value})} placeholder="مثال: ahmed123" className="bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">كلمة السر</label>
                      <Input type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} placeholder="****" className="bg-gray-50/50" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</label>
                    <textarea 
                      value={newStaff.notes} 
                      onChange={e => setNewStaff({...newStaff, notes: e.target.value})} 
                      className="w-full bg-gray-50/50 border border-transparent focus:border-pink-500 rounded-xl p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      placeholder="أي ملاحظات إضافية عن عقد الموظف..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-8">
              <Button type="button" variant="outline" onClick={() => {
                setEditingId(null);
                setCurrentView('list');
              }} className="px-8 font-bold text-gray-600 border-gray-300">إلغاء والعودة</Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-10 shadow-lg shadow-pink-200">
                <CheckCircle className="w-5 h-5 ml-2" /> {editingId ? 'حفظ التعديلات' : 'حفظ في قاعدة البيانات'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {currentView === 'profile' && selectedStaff && (
        <div className="max-w-5xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setCurrentView('list')} className="text-gray-500 font-bold bg-white border border-gray-200 shadow-sm px-4">
            <ArrowRight className="w-4 h-4 ml-2" /> العودة للقائمة
          </Button>
          
          {/* Profile Header (Premium Design) */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
            
            <div className="absolute top-6 left-6 flex gap-2 z-20">
              <button onClick={() => startEditStaff(selectedStaff)} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="تعديل الملف">
                <Pencil className="w-5 h-5" />
              </button>
              <button onClick={() => window.print()} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="طباعة كشف الحساب">
                <Printer className="w-5 h-5" />
              </button>
            </div>

            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-400 to-pink-600 border-4 border-slate-800 shadow-2xl flex items-center justify-center text-white font-black text-5xl relative z-10 shrink-0">
              {selectedStaff.name.charAt(0)}
            </div>
            
            <div className="flex-1 text-center md:text-right relative z-10">
              <h1 className="text-3xl font-black text-white mb-2">{selectedStaff.name}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-pink-300">
                  {selectedStaff.role || 'غير محدد'}
                </span>
                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-slate-300 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> {selectedStaff.iqama || 'لا يوجد إقامة'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 font-bold mb-1">الراتب الأساسي</p>
                  <p className="text-xl font-black text-white">{selectedStaff.basic_salary.toLocaleString()} <span className="text-sm">ر.س</span></p>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 font-bold mb-1">صافي المستحق</p>
                  <p className="text-xl font-black text-emerald-400">{(selectedStaff.basic_salary - selectedStaff.total_advances).toLocaleString()} <span className="text-sm">ر.س</span></p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Tabs */}
          <Card className="p-0 border-none shadow-sm overflow-hidden bg-white">
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setProfileTab('attendance')}
                className={cn("px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2", profileTab === 'attendance' ? "border-pink-600 text-pink-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-800")}
              >
                <Clock className="w-4 h-4" /> سجل الحضور والغياب
              </button>
              <button 
                onClick={() => setProfileTab('finances')}
                className={cn("px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2", profileTab === 'finances' ? "border-pink-600 text-pink-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-800")}
              >
                <Wallet className="w-4 h-4" /> السجل المالي والسندات
              </button>
              <button 
                onClick={() => setProfileTab('personal')}
                className={cn("px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2", profileTab === 'personal' ? "border-pink-600 text-pink-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-800")}
              >
                <CreditCard className="w-4 h-4" /> البيانات والمرفقات
              </button>
            </div>
            
            <div className="p-6">
              {profileTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-gray-800">سجل البصمة / التحضير الذكي</h3>
                     <div className="flex gap-2">
                       <Button onClick={() => handleMarkAttendance('حضور')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"><CheckCircle className="w-4 h-4 ml-2" /> تسجيل حضور الآن</Button>
                       <Button onClick={() => handleMarkAttendance('غياب')} className="bg-red-500 hover:bg-red-600 text-white font-bold"><Users className="w-4 h-4 ml-2" /> تسجيل غياب</Button>
                     </div>
                  </div>
                  <Table headers={['التاريخ', 'الوقت', 'الحالة', 'بواسطة']}>
                    {empAttendance.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-400 font-bold">لم يتم تسجيل أي حضور أو غياب بعد.</td></tr>
                    ) : (
                      empAttendance.map(record => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={record.status === 'حضور' ? 'success' : 'danger'}>{record.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.created_by}</td>
                        </tr>
                      ))
                    )}
                  </Table>
                </div>
              )}

              {profileTab === 'finances' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-gray-800">السندات المالية (سلف، خصم، مكافأة)</h3>
                     <Button onClick={() => setShowAdvanceModal(true)} className="bg-pink-600 hover:bg-pink-700 text-white font-bold">
                       <HandCoins className="w-4 h-4 ml-2" /> إصدار سند جديد
                     </Button>
                  </div>
                  <Table headers={['رقم السند', 'التاريخ', 'المبلغ', 'البيان', 'إجراء']}>
                    {empAdvances.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-bold">لا يوجد أي سندات مالية مسجلة لهذا الموظف.</td></tr>
                    ) : (
                      empAdvances.map(adv => (
                        <tr key={adv.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{adv.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{adv.created_at?.split(' ')[0] || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-red-600">{adv.amount} ر.س</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{adv.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </Table>
                </div>
              )}
              
              {profileTab === 'personal' && (
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-gray-800">معلومات إضافية</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-bold mb-1">رقم الهاتف</p>
                        <p className="text-gray-800 font-black">{selectedStaff.phone || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-bold mb-1">الجنسية</p>
                        <p className="text-gray-800 font-black">{selectedStaff.nationality || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-bold mb-1">تاريخ المباشرة</p>
                        <p className="text-gray-800 font-black">{selectedStaff.start_date || '-'}</p>
                      </div>
                   </div>
                   <div className="bg-gray-50 rounded-xl p-4">
                     <p className="text-xs text-gray-400 font-bold mb-2">الملاحظات الإدارية لشؤون الموظفين</p>
                     <p className="text-gray-700">{selectedStaff.notes || 'لا توجد ملاحظات...'}</p>
                   </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* نافذة إصدار سند مالي (Advance/Voucher Modal) */}
      <Modal isOpen={showAdvanceModal} onClose={() => setShowAdvanceModal(false)} title="إصدار سند مالي" className="max-w-md bg-slate-900 border-slate-800 text-white">
        <form onSubmit={handleAddAdvance} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">اختر الموظف المستفيد</label>
            <Select 
              value={advanceData.employee_id} 
              onChange={e => setAdvanceData({...advanceData, employee_id: e.target.value})} 
              required 
              className="bg-black/30 border-slate-700 text-white"
              options={staff.map(emp => ({ value: emp.id, label: emp.name }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">قيمة المبلغ (<span className="text-emerald-400">ر.س</span>)</label>
            <Input type="number" step="any" min="1" value={advanceData.amount} onChange={e => setAdvanceData({...advanceData, amount: e.target.value})} placeholder="0.00" required className="text-2xl font-black text-emerald-400 bg-black/30 border-slate-700 text-right" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">البيان / السبب</label>
            <Input value={advanceData.reason} onChange={e => setAdvanceData({...advanceData, reason: e.target.value})} placeholder="مثال: سلفة نقدية..." required className="bg-black/30 border-slate-700 text-white" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">صرف المبلغ من</label>
            <Select 
              value={advanceData.payment_method} 
              onChange={e => setAdvanceData({...advanceData, payment_method: e.target.value})} 
              className="bg-black/30 border-slate-700 text-white"
              options={[
                { value: 'cash', label: 'الخزينة (كاش)' },
                { value: 'bank', label: 'حساب البنك / تحويل' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">نوع السند</label>
            <Select 
              value={advanceData.type} 
              onChange={e => setAdvanceData({...advanceData, type: e.target.value})} 
              className="bg-black/30 border-slate-700 text-white"
              options={[
                { value: 'salary', label: 'راتب (له)' },
                { value: 'bonus', label: 'مكافأة (له)' },
                { value: 'advance', label: 'سلفة (عليه)' }
              ]}
            />
          </div>
          
          <div className="bg-black/20 p-4 rounded-xl text-center mt-4">
             <p className="text-xs text-slate-400 mb-3 font-medium">حدد النوع ثم اضغط إصدار السند ليتم تسجيله بحساب الموظف والمحاسبة.</p>
             <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-pink-600/20 border-none">
               <CheckCircle className="w-5 h-5 ml-2" /> إصدار السند الآن
             </Button>
          </div>
        </form>
      </Modal>

      {/* نافذة الخصم والجزاء (Penalty Modal) */}
      <Modal isOpen={showPenaltyModal} onClose={() => setShowPenaltyModal(false)} title="تسجيل جزاء مالي" className="max-w-md bg-slate-900 border-red-500/30 text-white shadow-2xl shadow-red-500/10">
        <form onSubmit={handleAddPenalty} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">الموظف المستهدف</label>
            <Select 
              value={penaltyData.employee_id} 
              onChange={e => setPenaltyData({...penaltyData, employee_id: e.target.value})} 
              required 
              className="bg-black/30 border-slate-700 text-white"
              options={staff.map(emp => ({ value: emp.id, label: emp.name }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">سبب الجزاء / نوع المخالفة</label>
            {penaltyRules.length > 0 ? (
              <>
                <Select
                  value={penaltyData.reason}
                  onChange={e => {
                    const matched = penaltyRules.find(r => r.reason === e.target.value);
                    setPenaltyData({
                      ...penaltyData,
                      reason: e.target.value,
                      amount: matched && matched.amount > 0 ? String(matched.amount) : penaltyData.amount
                    });
                  }}
                  className="bg-black/30 border-slate-700 text-white mb-2"
                  options={[
                    { value: '', label: '— اختر نوع المخالفة أو اكتب يدوياً —' },
                    ...penaltyRules.map(r => ({ value: r.reason, label: `${r.reason}${r.amount > 0 ? ` (${Number(r.amount).toLocaleString()} ر.س)` : ''}` }))
                  ]}
                />
                <Input value={penaltyData.reason} onChange={e => setPenaltyData({...penaltyData, reason: e.target.value})} placeholder="أو اكتب سبباً مخصصاً..." required className="bg-black/30 border-slate-700 text-white" />
              </>
            ) : (
              <Input value={penaltyData.reason} onChange={e => setPenaltyData({...penaltyData, reason: e.target.value})} placeholder="تأخير، غياب، إهمال..." required className="bg-black/30 border-slate-700 text-white" />
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">مبلغ الجزاء <span className="text-red-400">(ر.س)</span> — يُملأ آلياً من القاعدة</label>
            <Input type="number" step="any" min="1" value={penaltyData.amount} onChange={e => setPenaltyData({...penaltyData, amount: e.target.value})} placeholder="0" required className="text-2xl font-black text-red-500 bg-black/30 border-red-500/30 text-center" dir="ltr" />
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 mt-4">
             <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
             <p className="text-xs text-red-300 leading-relaxed font-medium">الجزاء سيُخصم من القيمة الصافية لراتب الموظف ولن يؤثر على سيولة الخزينة كونه لم يُصرف كنقدية فعلية (متوافق مع النظام المحاسبي).</p>
          </div>

          <div className="pt-2">
             <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-600/20 border-none">
               <CheckCircle className="w-5 h-5 ml-2" /> تأكيد تطبيق الجزاء
             </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

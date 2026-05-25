import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  CheckSquare, Plus, Search, Calendar, Clock, AlertTriangle, User,
  Briefcase, Filter, MoreVertical, Trash2, Edit, CheckCircle2,
  LayoutList, GitCommit, LayoutGrid, ChevronRight, ChevronLeft, BarChartHorizontal
} from 'lucide-react';

export default function Tasks() {
  const { projects, employees } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('gantt'); // 'list' or 'gantt'

  // Enhanced mock tasks for Gantt Chart
  const [tasks] = useState([
    { id: 1, title: 'أعمال الحفر والأساسات', projectId: 1, assignedTo: 1, startDate: '2023-11-01', endDate: '2023-11-15', progress: 100, priority: 'عالية', status: 'مكتملة' },
    { id: 2, title: 'صب القواعد الخرسانية', projectId: 1, assignedTo: 2, startDate: '2023-11-16', endDate: '2023-11-25', progress: 80, priority: 'عالية', status: 'قيد التنفيذ' },
    { id: 3, title: 'أعمال العزل المائي', projectId: 1, assignedTo: 3, startDate: '2023-11-26', endDate: '2023-11-30', progress: 0, priority: 'متوسطة', status: 'لم تبدأ' },
    { id: 4, title: 'أعمال مباني الدور الأرضي', projectId: 1, assignedTo: 1, startDate: '2023-12-01', endDate: '2023-12-20', progress: 0, priority: 'عالية', status: 'لم تبدأ' },
    { id: 5, title: 'تجهيز المخططات التنفيذية', projectId: 2, assignedTo: 4, startDate: '2023-11-10', endDate: '2023-11-20', progress: 100, priority: 'عالية', status: 'مكتملة' },
  ]);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priorityColors = {
    'عالية': 'bg-red-100 text-red-700',
    'متوسطة': 'bg-amber-100 text-amber-700',
    'منخفضة': 'bg-blue-100 text-blue-700',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مكتملة': return 'bg-emerald-500';
      case 'قيد التنفيذ': return 'bg-amber-500';
      case 'لم تبدأ': return 'bg-gray-300';
      default: return 'bg-primary-500';
    }
  };

  // Gantt Chart Logic (Simple Nov-Dec view for demo)
  const daysInNov = 30;
  const daysInDec = 31;
  const totalDays = daysInNov + daysInDec;
  const startGanttDate = new Date('2023-11-01');

  const calculateGanttPosition = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTimeStart = Math.abs(start - startGanttDate);
    const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24)); 
    
    const diffTimeDuration = Math.abs(end - start);
    const durationDays = Math.ceil(diffTimeDuration / (1000 * 60 * 60 * 24)) + 1;

    // Assuming each day is 30px wide
    const left = diffDaysStart * 30;
    const width = durationDays * 30;

    return { left, width };
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">الجدول الزمني <span className="text-primary-600">والمهام</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">متابعة مسار المشاريع ومخططات جانت (Gantt Charts) للمسار الحرج</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutList className="w-4 h-4" /> القائمة
            </button>
            <button 
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'gantt' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChartHorizontal className="w-4 h-4" /> مخطط جانت
            </button>
          </div>
          <Button onClick={() => setShowAddModal(true)} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
            <Plus className="w-5 h-5 ml-2" /> مهمة جديدة
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
           <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في المهام..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Button variant="secondary" className="rounded-xl bg-white shadow-sm"><Filter className="w-4 h-4 ml-2" /> تصفية متقدمة</Button>
           </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-auto flex-1">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-semibold">المهمة</th>
                  <th className="px-6 py-4 font-semibold">المشروع</th>
                  <th className="px-6 py-4 font-semibold">المسؤول</th>
                  <th className="px-6 py-4 font-semibold">تاريخ البدء</th>
                  <th className="px-6 py-4 font-semibold">تاريخ التسليم</th>
                  <th className="px-6 py-4 font-semibold">نسبة الإنجاز</th>
                  <th className="px-6 py-4 font-semibold">الحالة</th>
                  <th className="px-6 py-4 font-semibold w-24">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{task.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {projects.find(p => p.id === task.projectId)?.name || 'عام'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-600 font-bold">
                          {employees.find(e => e.id === task.assignedTo)?.name?.charAt(0) || 'م'}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{employees.find(e => e.id === task.assignedTo)?.name || 'موظف'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.startDate}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.endDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getStatusColor(task.status)}`} style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 min-w-[30px]">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={task.status === 'قيد التنفيذ' ? 'warning' : task.status === 'مكتملة' ? 'success' : 'neutral'}>{task.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Gantt Sidebar (Tasks List) */}
            <div className="w-1/3 border-l border-gray-200 overflow-y-auto flex-shrink-0 bg-white z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
              <div className="h-14 border-b border-gray-200 bg-gray-50 flex items-center px-4 font-bold text-gray-700 text-sm">
                اسم المهمة / المشروع
              </div>
              <div className="divide-y divide-gray-100">
                {filteredTasks.map(task => (
                  <div key={task.id} className="h-16 px-4 py-2 flex flex-col justify-center group hover:bg-primary-50/30 transition-colors">
                    <p className="text-sm font-bold text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{projects.find(p => p.id === task.projectId)?.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Timeline */}
            <div className="w-2/3 overflow-auto flex-1 relative bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px)] bg-[size:30px_100%]">
              {/* Timeline Header */}
              <div className="h-14 border-b border-gray-200 bg-gray-50 flex sticky top-0 z-20 w-max min-w-full">
                {/* Generating November Columns */}
                {Array.from({ length: daysInNov }).map((_, i) => (
                  <div key={`nov-${i}`} className="w-[30px] flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Nov</span>
                    <span className="text-xs font-bold text-gray-700">{i + 1}</span>
                  </div>
                ))}
                {/* Generating December Columns */}
                {Array.from({ length: daysInDec }).map((_, i) => (
                  <div key={`dec-${i}`} className="w-[30px] flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Dec</span>
                    <span className="text-xs font-bold text-gray-700">{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* Timeline Body */}
              <div className="relative w-max min-w-full pb-10">
                {filteredTasks.map((task, idx) => {
                  const { left, width } = calculateGanttPosition(task.startDate, task.endDate);
                  return (
                    <div key={task.id} className="h-16 border-b border-gray-100/50 relative group">
                      {/* Gantt Bar */}
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-sm group-hover:shadow-md transition-all flex items-center overflow-hidden cursor-pointer ${getStatusColor(task.status)} bg-opacity-90`}
                        style={{ left: `${left}px`, width: `${width}px` }}
                        title={`${task.title}\nمن: ${task.startDate}\nإلى: ${task.endDate}\nنسبة الإنجاز: ${task.progress}%`}
                      >
                        {/* Progress inside the bar */}
                        <div 
                          className="h-full bg-black/20" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                        
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                            {task.progress > 0 && `${task.progress}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Today Line Indicator (Mocking today as Nov 22) */}
                <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${21 * 30}px` }}>
                  <div className="absolute -top-3 -translate-x-1/2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">اليوم</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة مهمة للجدول الزمني">
         <form className="space-y-4">
            <Input label="عنوان المهمة" required />
            <Select label="ربط بالمشروع" options={projects.map(p => ({ label: p.name, value: p.id }))} />
            <div className="grid grid-cols-2 gap-4">
               <Select label="المهندس/المسؤول" options={employees.map(e => ({ label: e.name, value: e.id }))} />
               <Select label="يعتمد على مهمة (Predecessor)" options={[{label: 'بدون ارتباط', value: null}, ...tasks.map(t => ({ label: t.title, value: t.id }))]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="تاريخ البدء" type="date" required />
               <Input label="تاريخ الانتهاء المتوقع" type="date" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Select label="الأولوية" options={[{label: 'عالية', value: 'عالية'}, {label: 'متوسطة', value: 'متوسطة'}, {label: 'منخفضة', value: 'منخفضة'}]} />
               <Select label="الحالة" options={[{label: 'لم تبدأ', value: 'لم تبدأ'}, {label: 'قيد التنفيذ', value: 'قيد التنفيذ'}]} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
               <Button variant="secondary" onClick={() => setShowAddModal(false)} className="rounded-xl">إلغاء</Button>
               <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200">حفظ في الجدول الزمني</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

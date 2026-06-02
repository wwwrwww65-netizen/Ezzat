import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Badge, Button, Input, Modal, Select } from '../components/UI';
import {
  CheckSquare, Plus, Search, Calendar, Clock, AlertTriangle, User,
  Briefcase, Filter, MoreVertical, Trash2, Edit, CheckCircle2,
  LayoutList, GitCommit, LayoutGrid, ChevronRight, ChevronLeft, BarChartHorizontal, Play, Check
} from 'lucide-react';

export default function Tasks() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');

  useEffect(() => {
    fetchInitialData();
    fetchTasks();
  }, []);

  const fetchInitialData = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.executeDb(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          project_id INTEGER,
          assigned_to INTEGER,
          start_date TEXT,
          end_date TEXT,
          priority TEXT,
          status TEXT,
          progress INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      try { await window.electronAPI.executeDb('ALTER TABLE tasks ADD COLUMN start_date TEXT'); } catch(e){}
      try { await window.electronAPI.executeDb('ALTER TABLE tasks ADD COLUMN end_date TEXT'); } catch(e){}
      try { await window.electronAPI.executeDb('ALTER TABLE tasks ADD COLUMN priority TEXT'); } catch(e){}
      try { await window.electronAPI.executeDb('ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0'); } catch(e){}
      try { await window.electronAPI.executeDb('ALTER TABLE tasks ADD COLUMN project_id INTEGER'); } catch(e){}
      try { await window.electronAPI.executeDb('ALTER TABLE tasks ADD COLUMN assigned_to INTEGER'); } catch(e){}

      const prjs = await window.electronAPI.queryDb('SELECT id, name FROM projects ORDER BY id DESC');
      setProjects(prjs || []);

      const staff = await window.electronAPI.queryDb('SELECT id, name FROM staff ORDER BY name ASC');
      setEmployees(staff || []);
    } catch(e) {
      console.error(e);
    }
  };

  const fetchTasks = async () => {
    if (!window.electronAPI) return;
    try {
      const rows = await window.electronAPI.queryDb('SELECT * FROM tasks ORDER BY start_date ASC');
      setTasks(rows || []);
    } catch(e) {
      console.error(e);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    priority: 'عالية',
    status: 'لم تبدأ',
    progress: 0
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!window.electronAPI) return;

    try {
      if (editingTask) {
        await window.electronAPI.executeDb(
          `UPDATE tasks SET title=?, project_id=?, assigned_to=?, start_date=?, end_date=?, priority=?, status=?, progress=? WHERE id=?`,
          [formData.title, formData.project_id || null, formData.assigned_to || null, formData.start_date, formData.end_date, formData.priority, formData.status, formData.progress, editingTask]
        );
      } else {
        await window.electronAPI.executeDb(
          `INSERT INTO tasks (title, project_id, assigned_to, start_date, end_date, priority, status, progress)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [formData.title, formData.project_id || null, formData.assigned_to || null, formData.start_date, formData.end_date, formData.priority, formData.status, formData.progress]
        );
      }
      setShowAddModal(false);
      setEditingTask(null);
      setFormData({ title: '', project_id: '', assigned_to: '', start_date: '', end_date: '', priority: 'عالية', status: 'لم تبدأ', progress: 0 });
      fetchTasks();
    } catch(e) {
      console.error(e);
    }
  };

  const handleEditTaskClick = (task) => {
    setFormData({
      title: task.title,
      project_id: task.project_id || '',
      assigned_to: task.assigned_to || '',
      start_date: task.start_date || '',
      end_date: task.end_date || '',
      priority: task.priority || 'عالية',
      status: task.status || 'لم تبدأ',
      progress: task.progress || 0
    });
    setEditingTask(task.id);
    setShowAddModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (await confirmDialog('هل أنت متأكد من حذف هذه المهمة؟') && window.electronAPI) {
      await window.electronAPI.executeDb('DELETE FROM tasks WHERE id = ?', [id]);
      fetchTasks();
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    await updateTaskStatus(taskId, newStatus);
  };

  const updateTaskStatus = async (id, newStatus) => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.executeDb('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, id]);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProjectFilter ? String(task.project_id) === String(selectedProjectFilter) : true;
    return matchesSearch && matchesProject;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'مكتملة': return 'bg-emerald-500';
      case 'قيد التنفيذ': return 'bg-amber-500';
      case 'لم تبدأ': return 'bg-gray-300 dark:bg-slate-600';
      default: return 'bg-primary-500';
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <CheckSquare className="w-8 h-8 text-primary-600" />
             الجدول الزمني <span className="text-primary-600">والمهام</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">متابعة مسار المشاريع ومخططات جانت (Gantt Charts) للمسار الحرج</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <LayoutList className="w-4 h-4" /> القائمة
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-4 h-4" /> لوحة المهام
            </button>
          </div>
          <Button onClick={() => { setEditingTask(null); setFormData({ title: '', project_id: '', assigned_to: '', start_date: '', end_date: '', priority: 'عالية', status: 'لم تبدأ', progress: 0 }); setShowAddModal(true); }} className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">
            <Plus className="w-5 h-5 ml-2" /> مهمة جديدة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-5 flex items-center gap-4 border-primary-100 dark:border-primary-900/30 shadow-sm">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl"><Briefcase className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">إجمالي المهام المعروضة</p>
            <p className="text-2xl font-black text-primary-900 dark:text-primary-100">{filteredTasks.length}</p>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center gap-4 border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">المهام المكتملة</p>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{filteredTasks.filter(t => t.status === 'مكتملة').length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-amber-100 dark:border-amber-900/30 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">قيد التنفيذ</p>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{filteredTasks.filter(t => t.status === 'قيد التنفيذ').length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-teal-100 dark:border-teal-900/30 shadow-sm">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">مدة التنفيذ التقديرية</p>
            <p className="text-2xl font-black text-teal-900 dark:text-teal-100">
              {(() => {
                const isValidDate = (d) => !isNaN(d) && new Date(d).getFullYear() > 2000;
                const startDates = filteredTasks.map(t => new Date(t.start_date).getTime()).filter(isValidDate);
                const endDates = filteredTasks.map(t => new Date(t.end_date).getTime()).filter(isValidDate);
                if (startDates.length > 0 && endDates.length > 0) {
                  const min = Math.min(...startDates);
                  const max = Math.max(...endDates);
                  const days = Math.ceil((max - min) / (1000 * 60 * 60 * 24));
                  return days > 0 ? days : Number(localStorage.getItem('takeoff_project_duration')) || 0;
                }
                return Number(localStorage.getItem('takeoff_project_duration')) || 0;
              })()} <span className="text-sm font-medium text-gray-500 dark:text-slate-500">يوم</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
           <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في المهام..."
                className="pr-10 rounded-xl bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="w-full md:w-64 shrink-0">
             <Select 
               options={[{label: 'جميع المشاريع', value: ''}, ...projects.map(p => ({ label: p.name, value: p.id }))]} 
               value={selectedProjectFilter} 
               onChange={e => setSelectedProjectFilter(e.target.value)} 
               className="bg-white border-gray-200 focus:border-primary-500"
             />
           </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-auto flex-1 bg-white">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold">المهمة</th>
                  <th className="px-6 py-4 font-bold">المشروع</th>
                  <th className="px-6 py-4 font-bold">المسؤول</th>
                  <th className="px-6 py-4 font-bold">تاريخ البدء</th>
                  <th className="px-6 py-4 font-bold">تاريخ التسليم</th>
                  <th className="px-6 py-4 font-bold">نسبة الإنجاز</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold w-24">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-400 font-bold">لا توجد مهام مسجلة. انقر على "مهمة جديدة" للبدء.</td>
                  </tr>
                ) : filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-800">{task.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-bold">
                      {projects.find(p => String(p.id) === String(task.project_id))?.name || 'عام / غير مرتبط'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center text-[10px] text-primary-700 font-black">
                          {employees.find(e => e.id === task.assigned_to)?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{employees.find(e => e.id === task.assigned_to)?.name || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.start_date}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{task.end_date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${getStatusColor(task.status)}`} style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-black text-gray-600 min-w-[30px]">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={task.status === 'قيد التنفيذ' ? 'warning' : task.status === 'مكتملة' ? 'success' : 'neutral'}>{task.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditTaskClick(task)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex overflow-auto gap-6 p-6 bg-gray-50/50 dark:bg-slate-900/30">
            {['لم تبدأ', 'قيد التنفيذ', 'مكتملة'].map((statusColumn) => {
              const columnTasks = filteredTasks.filter(t => t.status === statusColumn);
              
              let headerColor = '';
              let headerIcon = null;
              if(statusColumn === 'لم تبدأ') {
                headerColor = 'border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300';
                headerIcon = <Clock className="w-4 h-4 text-gray-500 dark:text-slate-400" />;
              } else if(statusColumn === 'قيد التنفيذ') {
                headerColor = 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
                headerIcon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
              } else {
                headerColor = 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
                headerIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
              }

              return (
                <div 
                  key={statusColumn} 
                  className="flex-1 min-w-[300px] max-w-sm flex flex-col bg-gray-100/50 dark:bg-slate-800/30 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                  onDrop={(e) => handleDrop(e, statusColumn)}
                  onDragOver={handleDragOver}
                >
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${headerColor}`}>
                    <div className="flex items-center gap-2 font-black text-sm">
                      {headerIcon}
                      {statusColumn}
                    </div>
                    <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">{columnTasks.length}</span>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-slate-500 text-sm font-bold border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                        لا توجد مهام
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <div 
                          key={task.id} 
                          draggable={true}
                          onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}
                          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 transition-all cursor-grab active:cursor-grabbing group relative" 
                          onClick={() => handleEditTaskClick(task)}
                        >
                          <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleEditTaskClick(task); }} className="p-1.5 text-gray-400 hover:text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1.5 text-gray-400 hover:text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant={task.priority === 'عالية' ? 'danger' : task.priority === 'متوسطة' ? 'warning' : 'info'}>
                              {task.priority}
                            </Badge>
                          </div>
                          <h4 className="font-black text-gray-800 dark:text-slate-100 text-sm mb-1 mt-3 leading-snug">{task.title}</h4>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {projects.find(p => String(p.id) === String(task.project_id))?.name || 'عام / غير مرتبط'}
                          </p>
                          
                          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              {task.end_date}
                            </div>
                            <div className="flex -space-x-2 space-x-reverse">
                              <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs text-primary-700 dark:text-primary-400 font-black border-2 border-white dark:border-slate-800 shadow-sm" title={employees.find(e => e.id === task.assigned_to)?.name || 'غير محدد'}>
                                {employees.find(e => e.id === task.assigned_to)?.name?.charAt(0) || '?'}
                              </div>
                            </div>
                          </div>
                          
                          {task.progress > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full ${getStatusColor(task.status)}`} style={{ width: `${task.progress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-gray-500 dark:text-slate-400">{task.progress}%</span>
                            </div>
                          )}

                          {/* Quick Action Buttons */}
                          {(task.status === 'لم تبدأ' || task.status === 'قيد التنفيذ') && (
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-2">
                              {task.status === 'لم تبدأ' && (
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-[10px] font-black border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-none py-1.5"
                                  onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'قيد التنفيذ'); }}
                                >
                                  <Play className="w-3.5 h-3.5 ml-1.5" /> بدء التنفيذ
                                </Button>
                              )}
                              {task.status === 'قيد التنفيذ' && (
                                <Button 
                                  type="button"
                                  variant="primary" 
                                  size="sm" 
                                  className="w-full text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 shadow-none py-1.5"
                                  onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'مكتملة'); }}
                                >
                                  <Check className="w-3.5 h-3.5 ml-1.5" /> إكمال المهمة
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingTask(null); }} title={editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"} className="max-w-xl">
         <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان المهمة <span className="text-red-500">*</span></label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ارتباط المشروع</label>
              <Select options={[{label: 'بدون ارتباط (عام)', value: ''}, ...projects.map(p => ({ label: p.name, value: p.id }))]} value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">المسؤول عن التنفيذ</label>
                 <Select options={[{label: 'غير محدد', value: ''}, ...employees.map(e => ({ label: e.name, value: e.id }))]} value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">الأولوية</label>
                 <Select options={[{label: 'عالية', value: 'عالية'}, {label: 'متوسطة', value: 'متوسطة'}, {label: 'منخفضة', value: 'منخفضة'}]} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البدء</label>
                 <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التسليم</label>
                 <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">حالة المهمة</label>
                 <Select options={[{label: 'لم تبدأ', value: 'لم تبدأ'}, {label: 'قيد التنفيذ', value: 'قيد التنفيذ'}, {label: 'مكتملة', value: 'مكتملة'}]} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">نسبة الإنجاز (%)</label>
                 <Input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} />
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800/80">
               <Button variant="ghost" type="button" onClick={() => { setShowAddModal(false); setEditingTask(null); }} className="rounded-xl font-bold text-gray-600 dark:text-slate-400">إلغاء</Button>
               <Button type="submit" className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">{editingTask ? 'حفظ التعديلات' : 'اعتماد المهمة'}</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

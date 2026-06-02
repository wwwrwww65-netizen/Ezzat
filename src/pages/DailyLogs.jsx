import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Badge, Button, Input, Select, Modal } from '../components/UI';
import {
  CalendarDays, Plus, Sun, Cloud, CloudRain, Users, HardHat, Construction, 
  Camera, FileText, MapPin, ChevronLeft, Trash2
} from 'lucide-react';

export default function DailyLogs() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [logs, setLogs] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [formData, setFormData] = useState({ progress: '', workers: 0, equipment: 0, weather: 'مشمس', temp: '25°C', log_date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [selectedProject]);

  const fetchInitialData = async () => {
    if (!window.electronAPI) return;
    try {
      const prjs = await window.electronAPI.queryDb('SELECT id, name FROM projects ORDER BY id DESC');
      setProjects(prjs || []);
      if (prjs && prjs.length > 0) {
        setSelectedProject(prjs[0].id);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    if (!window.electronAPI || !selectedProject) return;
    try {
      const dbLogs = await window.electronAPI.queryDb(
        'SELECT * FROM daily_logs WHERE project_id = ? ORDER BY log_date DESC, id DESC', 
        [selectedProject]
      );
      setLogs(dbLogs || []);
    } catch(e) {
      console.error(e);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!window.electronAPI || !selectedProject) return;

    try {
      await window.electronAPI.executeDb(
        `INSERT INTO daily_logs (project_id, log_date, weather, temp, workers, equipment, progress, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [selectedProject, formData.log_date, formData.weather, formData.temp, formData.workers, formData.equipment, formData.progress, 'قيد الاعتماد']
      );
      
      setShowAddModal(false);
      setFormData({ progress: '', workers: 0, equipment: 0, weather: 'مشمس', temp: '25°C', log_date: new Date().toISOString().split('T')[0] });
      fetchLogs();
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteLog = async (id) => {
    if (await confirmDialog('هل أنت متأكد من حذف هذا التقرير اليومي؟') && window.electronAPI) {
      await window.electronAPI.executeDb('DELETE FROM daily_logs WHERE id=?', [id]);
      fetchLogs();
    }
  };

  const getWeatherIcon = (w) => {
    if (w === 'مشمس') return <Sun className="w-6 h-6 text-amber-500" />;
    if (w === 'غائم') return <Cloud className="w-6 h-6 text-gray-400" />;
    if (w === 'ممطر') return <CloudRain className="w-6 h-6 text-blue-500" />;
    return <Sun className="w-6 h-6 text-amber-500" />;
  };

  const currentProjectName = projects.find(p => String(p.id) === String(selectedProject))?.name || 'اختر مشروعاً';
  const totalWorkers = logs.reduce((acc, l) => acc + Number(l.workers || 0), 0);
  const avgWorkers = logs.length > 0 ? Math.round(totalWorkers / logs.length) : 0;
  
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <CalendarDays className="w-8 h-8 text-primary-600" />
             يوميات <span className="text-primary-600">الموقع</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">توثيق سير العمل اليومي، العمالة، المعدات، وحالة الطقس</p>
        </div>
        <div className="flex gap-3 items-center">
          <Select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            options={projects.map(p => ({label: p.name, value: p.id}))} 
            className="w-64 border-gray-200 focus:border-primary-500 bg-white"
          />
          <Button variant="primary" onClick={() => setShowAddModal(true)} disabled={!selectedProject} className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">
            <Plus className="w-5 h-5 ml-2" /> كتابة تقرير يومي
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 flex items-center gap-4 bg-white border border-gray-100 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MapPin className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">المشروع المحدد</p>
            <p className="text-sm font-black text-gray-800 truncate w-32">{currentProjectName}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white border border-gray-100 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><HardHat className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">متوسط العمالة اليومي</p>
            <p className="text-2xl font-black text-gray-800">{avgWorkers} <span className="text-xs font-medium text-gray-500">عامل/فني</span></p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white border border-gray-100 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Construction className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">المعدات (أحدث تقرير)</p>
            <p className="text-2xl font-black text-gray-800">{logs[0]?.equipment || 0} <span className="text-xs font-medium text-gray-500">معدة</span></p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white border border-gray-100 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي التقارير</p>
            <p className="text-2xl font-black text-gray-800">{logs.length} <span className="text-xs font-medium text-gray-500">تقرير</span></p>
          </div>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-10">
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-gray-400">
             <FileText className="w-16 h-16 mb-4 text-gray-300" />
             <p className="text-xl font-bold text-gray-500">لا توجد تقارير يومية مسجلة</p>
             <p className="text-sm mt-2">انقر على "كتابة تقرير يومي" للبدء في توثيق أعمال المشروع.</p>
          </div>
        ) : logs.map((log) => (
          <Card key={log.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group bg-white">
            <div className="flex flex-col md:flex-row">
              {/* Date & Weather Strip */}
              <div className="bg-gray-50/80 p-6 md:w-48 shrink-0 flex flex-row md:flex-col items-center justify-between md:justify-center border-l border-gray-100">
                <div className="text-center">
                  <CalendarDays className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="font-black text-xl text-gray-800">{log.log_date?.split('-')[2] || '--'}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    {log.log_date ? new Date(log.log_date).toLocaleString('ar-SA', { month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="hidden md:block w-full h-px bg-gray-200 my-4"></div>
                <div className="text-center flex flex-row md:flex-col items-center gap-2">
                  {getWeatherIcon(log.weather)}
                  <div>
                    <p className="text-sm font-bold text-gray-700">{log.weather}</p>
                    <p className="text-xs text-gray-500 font-mono">{log.temp}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-gray-800">الأعمال المنجزة والملاحظات</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={log.status === 'معتمد' ? 'success' : 'warning'}>{log.status}</Badge>
                      <button onClick={() => handleDeleteLog(log.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="حذف التقرير">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{log.progress}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-gray-800">{log.workers}</span> عمال وفنيين
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Construction className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-gray-800">{log.equipment}</span> معدات وآليات
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Camera className="w-5 h-5 text-primary-500" />
                    <span onClick={() => { setSelectedLog(log); setShowGalleryModal(true); }} className="font-bold text-primary-600 cursor-pointer hover:underline">عرض المرفقات</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="bg-gray-50/30 p-6 md:w-32 shrink-0 flex items-center justify-center border-r border-gray-100">
                <Button onClick={() => { setSelectedLog(log); setShowGalleryModal(true); }} variant="outline" className="rounded-2xl w-12 h-12 p-0 flex items-center justify-center text-primary-600 border-primary-200 hover:bg-primary-50 hover:border-primary-300 opacity-0 group-hover:opacity-100 transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="كتابة تقرير يومي للموقع" className="max-w-2xl">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التقرير</label>
              <Input type="date" value={formData.log_date} onChange={e => setFormData({...formData, log_date: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">حالة الطقس</label>
              <Select options={[{label:'مشمس',value:'مشمس'},{label:'غائم',value:'غائم'},{label:'ممطر',value:'ممطر'}]} value={formData.weather} onChange={e => setFormData({...formData, weather: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عدد العمال والفنيين</label>
              <Input type="number" value={formData.workers} onChange={e => setFormData({...formData, workers: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عدد المعدات العاملة</label>
              <Input type="number" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">درجة الحرارة المتوقعة</label>
              <Input value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تفاصيل الأعمال المنجزة والملاحظات <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors" 
              rows="4" 
              placeholder="اكتب بالتفصيل ما تم إنجازه اليوم..."
              value={formData.progress} 
              onChange={e => setFormData({...formData, progress: e.target.value})} 
              required 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">حفظ واعتماد التقرير</Button>
          </div>
        </form>
      </Modal>

      {/* Gallery / Details Modal */}
      <Modal isOpen={showGalleryModal} onClose={() => { setShowGalleryModal(false); setSelectedLog(null); }} title={`تفاصيل تقرير يوم ${selectedLog?.log_date || ''}`} className="max-w-3xl">
        <div className="space-y-6">
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
            <h4 className="font-black text-gray-800 mb-3 text-lg">الأعمال المنجزة:</h4>
            <p className="text-gray-700 font-medium leading-loose whitespace-pre-wrap">{selectedLog?.progress}</p>
          </div>
          
          <div>
            <h4 className="font-black text-gray-800 mb-3 flex items-center gap-2 text-lg"><Camera className="w-5 h-5 text-primary-500" /> الصور المرفقة من الموقع:</h4>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-video bg-gray-100 border border-gray-200 border-dashed rounded-2xl flex items-center justify-center text-gray-400 font-bold hover:bg-gray-50 hover:border-primary-300 transition-colors cursor-pointer">
                  <Camera className="w-6 h-6 mr-2 opacity-50" /> إضافة صورة توثيقية {i}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { window.print(); }} className="rounded-xl font-bold">طباعة التقرير (PDF)</Button>
            <Button variant="primary" onClick={() => { setShowGalleryModal(false); setSelectedLog(null); }} className="rounded-xl bg-gray-800 hover:bg-gray-900 border-none shadow-md font-bold">إغلاق</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

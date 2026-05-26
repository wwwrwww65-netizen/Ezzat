import React, { useState } from 'react';
import { Card, Badge, Button, Input, Select, Modal } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  CalendarDays, Plus, Sun, Cloud, CloudRain, Users, HardHat, Construction, 
  Camera, FileText, MapPin, ChevronLeft
} from 'lucide-react';

export default function DailyLogs() {
  const { projects } = useData();
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');

  const [logs, setLogs] = useState([
    { id: 1, date: '2023-11-25', weather: 'مشمس', temp: '32°C', workers: 45, equipment: 8, progress: 'تم الانتهاء من صب خرسانة سقف الدور الأول، والبدء في أعمال مباني الدور الأرضي.', status: 'معتمد' },
    { id: 2, date: '2023-11-24', weather: 'غائم', temp: '28°C', workers: 42, equipment: 7, progress: 'تجهيز حديد تسليح سقف الدور الأول واستلام الاستشاري.', status: 'معتمد' },
    { id: 3, date: '2023-11-23', weather: 'ممطر', temp: '22°C', workers: 15, equipment: 2, progress: 'توقف العمل في الخارج بسبب الأمطار، العمل مقتصر على التجهيزات الداخلية.', status: 'معتمد' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [formData, setFormData] = useState({ progress: '', workers: 0, equipment: 0, weather: 'مشمس', temp: '25°C' });

  const handleAddLog = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      weather: formData.weather,
      temp: formData.temp,
      workers: formData.workers,
      equipment: formData.equipment,
      progress: formData.progress,
      status: 'قيد الاعتماد'
    };
    setLogs([newLog, ...logs]);
    setShowAddModal(false);
    setFormData({ progress: '', workers: 0, equipment: 0, weather: 'مشمس', temp: '25°C' });
  };

  const handleDeleteLog = (id) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const getWeatherIcon = (w) => {
    if (w === 'مشمس') return <Sun className="w-6 h-6 text-amber-500" />;
    if (w === 'غائم') return <Cloud className="w-6 h-6 text-gray-400" />;
    if (w === 'ممطر') return <CloudRain className="w-6 h-6 text-blue-500" />;
    return <Sun className="w-6 h-6 text-amber-500" />;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">يوميات <span className="text-primary-600">الموقع</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">توثيق سير العمل اليومي، العمالة، المعدات، وحالة الطقس</p>
        </div>
        <div className="flex gap-3">
          <Select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            options={projects.map(p => ({label: p.name, value: p.id}))} 
            className="w-64 border-primary-200"
          />
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="rounded-xl shadow-lg shadow-primary-200">
            <Plus className="w-5 h-5 ml-2" /> كتابة تقرير يومي
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MapPin className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">المشروع المحدد</p>
            <p className="text-sm font-black text-gray-800 truncate w-32">{projects.find(p => p.id === selectedProject)?.name || 'الكل'}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><HardHat className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">متوسط العمالة اليومي</p>
            <p className="text-2xl font-black text-gray-800">41 <span className="text-xs font-medium text-gray-500">عامل/فني</span></p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Construction className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">المعدات العاملة (اليوم)</p>
            <p className="text-2xl font-black text-gray-800">8 <span className="text-xs font-medium text-gray-500">معدة</span></p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي التقارير</p>
            <p className="text-2xl font-black text-gray-800">142 <span className="text-xs font-medium text-gray-500">تقرير</span></p>
          </div>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-10">
        {logs.map((log) => (
          <Card key={log.id} className="p-0 overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row">
              {/* Date & Weather Strip */}
              <div className="bg-gray-50 p-6 md:w-48 shrink-0 flex flex-row md:flex-col items-center justify-between md:justify-center border-l border-gray-100">
                <div className="text-center">
                  <CalendarDays className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="font-black text-xl text-gray-800">{log.date.split('-')[2]}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase">{new Date(log.date).toLocaleString('ar-SA', { month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="hidden md:block w-full h-px bg-gray-200 my-4"></div>
                <div className="text-center flex flex-row md:flex-col items-center gap-2">
                  {getWeatherIcon(log.weather)}
                  <div>
                    <p className="text-sm font-bold text-gray-700">{log.weather}</p>
                    <p className="text-xs text-gray-500">{log.temp}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">الأعمال المنجزة</h3>
                      <button onClick={() => handleDeleteLog(log.id)} className="text-red-500 text-sm hover:underline">(حذف)</button>
                    </div>
                    <Badge variant={log.status === 'معتمد' ? 'success' : 'warning'}>{log.status}</Badge>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium">{log.progress}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="font-bold">{log.workers}</span> عمال وفنيين
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Construction className="w-5 h-5 text-gray-400" />
                    <span className="font-bold">{log.equipment}</span> معدات وآليات
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Camera className="w-5 h-5 text-primary-500" />
                    <span onClick={() => { setSelectedLog(log); setShowGalleryModal(true); }} className="font-bold text-primary-600 cursor-pointer hover:underline">عرض 4 صور مرفقة</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="bg-white p-6 md:w-32 shrink-0 flex items-center justify-center border-r border-gray-100">
                <Button onClick={() => { setSelectedLog(log); setShowGalleryModal(true); }} variant="outline" className="rounded-full w-12 h-12 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="كتابة تقرير يومي">
        <form noValidate className="space-y-4" onSubmit={handleAddLog}>
          <div className="grid grid-cols-2 gap-4">
            <Select label="حالة الطقس" options={[{label:'مشمس',value:'مشمس'},{label:'غائم',value:'غائم'},{label:'ممطر',value:'ممطر'}]} value={formData.weather} onChange={e => setFormData({...formData, weather: e.target.value})} />
            <Input label="درجة الحرارة" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="عدد العمال والفنيين" type="number" value={formData.workers} onChange={e => setFormData({...formData, workers: e.target.value})} required />
            <Input label="عدد المعدات العاملة" type="number" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">تفاصيل الأعمال المنجزة</label>
            <textarea className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary-500 outline-none transition-colors" rows="4" value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)} className="rounded-xl">إلغاء</Button>
            <Button variant="primary" type="submit" className="rounded-xl shadow-lg shadow-primary-200">حفظ التقرير</Button>
          </div>
        </form>
      </Modal>

      {/* Gallery / Details Modal */}
      <Modal isOpen={showGalleryModal} onClose={() => { setShowGalleryModal(false); setSelectedLog(null); }} title={`تفاصيل تقرير يوم ${selectedLog?.date}`}>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-2">الأعمال المنجزة:</h4>
            <p className="text-gray-600">{selectedLog?.progress}</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Camera className="w-5 h-5 text-primary-500" /> الصور المرفقة بالموقع:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold">
                  صورة توثيقية {i}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { window.print(); }}>طباعة التقرير</Button>
            <Button variant="primary" onClick={() => { setShowGalleryModal(false); setSelectedLog(null); }}>إغلاق</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

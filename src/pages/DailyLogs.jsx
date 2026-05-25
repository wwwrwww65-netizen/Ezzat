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

  const [logs] = useState([
    { id: 1, date: '2023-11-25', weather: 'مشمس', temp: '32°C', workers: 45, equipment: 8, progress: 'تم الانتهاء من صب خرسانة سقف الدور الأول، والبدء في أعمال مباني الدور الأرضي.', status: 'معتمد' },
    { id: 2, date: '2023-11-24', weather: 'غائم', temp: '28°C', workers: 42, equipment: 7, progress: 'تجهيز حديد تسليح سقف الدور الأول واستلام الاستشاري.', status: 'معتمد' },
    { id: 3, date: '2023-11-23', weather: 'ممطر', temp: '22°C', workers: 15, equipment: 2, progress: 'توقف العمل في الخارج بسبب الأمطار، العمل مقتصر على التجهيزات الداخلية.', status: 'معتمد' },
  ]);

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
          <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
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
                    <h3 className="text-lg font-bold text-gray-800">الأعمال المنجزة</h3>
                    <Badge variant="success">معتمد من الاستشاري</Badge>
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
                    <span className="font-bold text-primary-600 cursor-pointer hover:underline">عرض 4 صور مرفقة</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="bg-white p-6 md:w-32 shrink-0 flex items-center justify-center border-r border-gray-100">
                <Button variant="outline" className="rounded-full w-12 h-12 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

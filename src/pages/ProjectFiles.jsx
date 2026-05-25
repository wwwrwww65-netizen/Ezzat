import React, { useState } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileSpreadsheet,
  UploadCloud,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Grid,
  List as ListIcon,
  ChevronRight,
  FolderOpen,
  File,
  Briefcase
} from 'lucide-react';

export default function ProjectFiles() {
  const { projects } = useData();
  const [currentProject, setCurrentProject] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mock Files Data
  const [files, setFiles] = useState([
    { id: 1, name: 'مخططات_تنفيذية_نهائية.pdf', type: 'pdf', size: '12.4 MB', date: '2023-11-01', project: 'مشروع مجمع الرياض السكني', uploader: 'م. سارة' },
    { id: 2, name: 'صور_الموقع_الأسبوعية.zip', type: 'image', size: '45.1 MB', date: '2023-11-05', project: 'برج جدة التجاري', uploader: 'أحمد علي' },
    { id: 3, name: 'حصر_كميات_الحديد.xlsx', type: 'excel', size: '2.1 MB', date: '2023-11-10', project: 'مشروع مجمع الرياض السكني', uploader: 'محمود المالي' },
    { id: 4, name: 'اعتماد_مواد_العزل.pdf', type: 'pdf', size: '3.5 MB', date: '2023-11-12', project: 'تطوير بنية تحتية - الدمام', uploader: 'م. خالد' },
    { id: 5, name: 'عقد_مقاولي_الباطن_الكهرباء.pdf', type: 'pdf', size: '5.2 MB', date: '2023-11-15', project: 'برج جدة التجاري', uploader: 'يوسف الإداري' },
  ]);

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setShowUploadModal(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => 
    (currentProject === 'الكل' || file.project === currentProject) &&
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">ملفات <span className="text-primary-600">المشاريع</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">أرشيف هندسي متكامل لجميع المخططات والمستندات الخاصة بالمشاريع</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث في ملفات المشاريع..." 
              className="pr-10 w-64 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowUploadModal(true)} 
            variant="primary" 
            className="rounded-xl shadow-lg shadow-primary-200 hover:scale-105 transition-transform"
          >
            <UploadCloud className="w-5 h-5 ml-2" /> رفع مخطط / ملف
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Projects */}
        <Card className="w-72 shrink-0 p-4 flex flex-col gap-2 overflow-y-auto bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">المشاريع الحالية</h3>
          
          <button
            onClick={() => setCurrentProject('الكل')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
              currentProject === 'الكل'
                ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderOpen className={`w-5 h-5 ${currentProject === 'الكل' ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">جميع المشاريع</span>
            </div>
          </button>

          {projects.map(project => {
            const isActive = currentProject === project.name;
            return (
              <button
                key={project.id}
                onClick={() => setCurrentProject(project.name)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Briefcase className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-semibold text-sm truncate" title={project.name}>{project.name}</span>
                </div>
              </button>
            );
          })}
        </Card>

        {/* Main Content Area */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
          {/* Content Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="text-primary-600">ملفات المشاريع</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{currentProject}</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Files Container */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/20">
            {filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Briefcase className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">لا توجد ملفات مرتبطة بهذا المشروع</p>
                <p className="text-sm mt-1">قم برفع مخططات أو مستندات جديدة</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map(file => (
                  <div key={file.id} className="group relative bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 flex flex-col items-center text-center gap-3">
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 bg-gray-50 hover:bg-primary-50 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-bold text-gray-800 truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] font-medium text-gray-500 mt-1">{file.size} • {file.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">الاسم</th>
                      <th className="px-6 py-3 font-semibold">المشروع</th>
                      <th className="px-6 py-3 font-semibold">الحجم</th>
                      <th className="px-6 py-3 font-semibold">تاريخ الرفع</th>
                      <th className="px-6 py-3 font-semibold">بواسطة</th>
                      <th className="px-6 py-3 font-semibold w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFiles.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <span className="font-bold text-gray-800">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{file.project}</td>
                        <td className="px-6 py-4 text-gray-600">{file.size}</td>
                        <td className="px-6 py-4 text-gray-600">{file.date}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            {file.uploader}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Download className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Share2 className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="رفع ملفات للمشروع">
        <div className="space-y-4">
          <div 
            className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
              dragActive ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className={`w-12 h-12 mb-3 ${dragActive ? 'text-primary-600 animate-bounce' : 'text-gray-400'}`} />
            <p className="text-gray-800 font-bold text-lg">اسحب وأفلت المخططات هنا</p>
            <p className="text-gray-500 text-sm mt-1">أو اضغط لاختيار الملفات من جهازك</p>
            <Button variant="outline" className="mt-4 rounded-xl bg-white">تصفح الملفات</Button>
          </div>

          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
            <Briefcase className="w-5 h-5 shrink-0 text-amber-600" />
            <p>سيتم ربط هذه الملفات بالمشروع المختار ({currentProject === 'الكل' ? 'يرجى اختيار مشروع' : currentProject}).</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)} className="rounded-xl">إلغاء</Button>
            <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200" disabled={currentProject === 'الكل'}>بدء الرفع</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

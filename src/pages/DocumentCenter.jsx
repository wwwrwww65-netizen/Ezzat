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
  File
} from 'lucide-react';

export default function DocumentCenter() {
  const { employees } = useData();
  const [currentFolder, setCurrentFolder] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mock Folders
  const folders = [
    { id: 'all', name: 'الكل', icon: Folder, count: 45 },
    { id: 'contracts', name: 'العقود والاتفاقيات', icon: FileText, count: 12 },
    { id: 'drawings', name: 'المخططات الهندسية', icon: ImageIcon, count: 24 },
    { id: 'invoices', name: 'الفواتير والمستخلصات', icon: FileSpreadsheet, count: 86 },
    { id: 'approvals', name: 'الاعتمادات والتراخيص', icon: FileArchive, count: 9 },
  ];

  // Mock Files Data
  const [files, setFiles] = useState([
    { id: 1, name: 'عقد_مشروع_الرياض_الجديد.pdf', type: 'pdf', size: '2.4 MB', date: '2023-10-15', folder: 'العقود والاتفاقيات', uploader: 'أحمد محمد' },
    { id: 2, name: 'مخطط_الدور_الأرضي_فيلا_A.dwg', type: 'image', size: '15.1 MB', date: '2023-10-18', folder: 'المخططات الهندسية', uploader: 'م. سارة' },
    { id: 3, name: 'مستخلص_رقم_1_مشروع_الدمام.xlsx', type: 'excel', size: '1.1 MB', date: '2023-10-20', folder: 'الفواتير والمستخلصات', uploader: 'محمود المالي' },
    { id: 4, name: 'رخصة_بناء_مشروع_جدة.pdf', type: 'pdf', size: '3.5 MB', date: '2023-10-22', folder: 'الاعتمادات والتراخيص', uploader: 'علي الإداري' },
    { id: 5, name: 'تقرير_التربة_المبدئي.pdf', type: 'pdf', size: '8.2 MB', date: '2023-10-25', folder: 'المخططات الهندسية', uploader: 'م. سارة' },
    { id: 6, name: 'جدول_الكميات_المسعر.xlsx', type: 'excel', size: '4.7 MB', date: '2023-10-28', folder: 'العقود والاتفاقيات', uploader: 'أحمد محمد' },
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
      // Handle file upload here
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
    (currentFolder === 'الكل' || file.folder === currentFolder) &&
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">مركز المستندات <span className="text-primary-600">الرقمي</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة وحفظ جميع ملفات ومخططات الشركة في مكان واحد آمن</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث في الملفات..." 
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
            <UploadCloud className="w-5 h-5 ml-2" /> رفع ملف جديد
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Folders */}
        <Card className="w-72 shrink-0 p-4 flex flex-col gap-2 overflow-y-auto bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">المجلدات الرئيسية</h3>
          {folders.map(folder => {
            const Icon = folder.id === 'all' && currentFolder === 'الكل' ? FolderOpen : folder.icon;
            const isActive = currentFolder === folder.name || (folder.id === 'all' && currentFolder === 'الكل');
            return (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id === 'all' ? 'الكل' : folder.name)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-semibold text-sm">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant={isActive ? 'primary' : 'neutral'} className="text-[10px] px-2 py-0.5">
                    {folder.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </Card>

        {/* Main Content Area */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
          {/* Content Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <span className="text-primary-600">مركز المستندات</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{currentFolder}</span>
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
                <FolderOpen className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">لا توجد ملفات في هذا المجلد</p>
                <p className="text-sm mt-1">قم برفع ملفات جديدة أو حاول البحث بكلمة أخرى</p>
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
                      <th className="px-6 py-3 font-semibold">المجلد</th>
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
                        <td className="px-6 py-4 text-gray-600">{file.folder}</td>
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
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="رفع ملفات جديدة">
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
            <p className="text-gray-800 font-bold text-lg">اسحب وأفلت الملفات هنا</p>
            <p className="text-gray-500 text-sm mt-1">أو اضغط لاختيار الملفات من جهازك</p>
            <Button variant="outline" className="mt-4 rounded-xl bg-white">تصفح الملفات</Button>
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
            <FileArchive className="w-5 h-5 shrink-0 text-blue-600" />
            <p>الأنواع المدعومة: PDF, Word, Excel, صور (JPG/PNG), ومخططات هندسية (DWG). الحد الأقصى لحجم الملف هو 50MB.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)} className="rounded-xl">إلغاء</Button>
            <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200">بدء الرفع</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

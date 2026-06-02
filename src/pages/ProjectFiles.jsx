import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
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
  const [projects, setProjects] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [currentProject, setCurrentProject] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!window.electronAPI) return;
    try {
      const prjs = await window.electronAPI.queryDb('SELECT id, name FROM projects ORDER BY id DESC');
      setProjects(prjs || []);

      const files = await window.electronAPI.queryDb(`
        SELECT f.*, p.name as project_name 
        FROM project_files f
        LEFT JOIN projects p ON f.project_id = p.id
        ORDER BY f.id DESC
      `);
      setProjectFiles(files || []);
    } catch(e) {
      console.error(e);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileName || !window.electronAPI) return;
    
    let fileType = 'pdf';
    if (fileName.toLowerCase().endsWith('xls') || fileName.toLowerCase().endsWith('xlsx')) fileType = 'excel';
    if (fileName.toLowerCase().endsWith('jpg') || fileName.toLowerCase().endsWith('png')) fileType = 'image';

    const fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'غير محدد';
    const projId = currentProject === 'الكل' ? null : projects.find(p => p.name === currentProject)?.id;
    const uploader = 'مدير النظام'; // Should be dynamic based on logged in user later

    await window.electronAPI.executeDb(
      `INSERT INTO project_files (project_id, name, type, size, uploader) VALUES (?, ?, ?, ?, ?)`,
      [projId, fileName, fileType, fileSize, uploader]
    );
    
    setShowUploadModal(false);
    setFileName('');
    setSelectedFile(null);
    fetchData();
  };

  const handleDeleteFile = async (id) => {
    if (await confirmDialog('هل أنت متأكد من حذف هذا الملف؟') && window.electronAPI) {
      await window.electronAPI.executeDb('DELETE FROM project_files WHERE id=?', [id]);
      fetchData();
    }
  };

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
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setSelectedFile(file);
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

  const safeFiles = projectFiles || [];
  
  const filteredFiles = safeFiles.filter(file => {
    const projName = file.project_id ? file.project_name : 'عام';
    return (currentProject === 'الكل' || projName === currentProject) &&
           (file.name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <Folder className="w-8 h-8 text-primary-600" />
             ملفات <span className="text-primary-600">المشاريع</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">أرشيف هندسي متكامل لجميع المخططات والمستندات الخاصة بالمشاريع</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث في ملفات المشاريع..." 
              className="pr-10 w-64 rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowUploadModal(true)} 
            className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none"
          >
            <UploadCloud className="w-5 h-5 ml-2" /> رفع مخطط / ملف
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Projects */}
        <Card className="w-72 shrink-0 p-4 flex flex-col gap-2 overflow-y-auto bg-white border border-gray-100 shadow-sm rounded-2xl">
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
              <span className="font-bold text-sm">جميع المشاريع والملفات</span>
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
                  <span className="font-bold text-sm truncate" title={project.name}>{project.name}</span>
                </div>
              </button>
            );
          })}
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          {/* Content Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
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
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
            {filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Briefcase className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-bold text-gray-500">لا توجد ملفات مرتبطة بهذا المشروع</p>
                <p className="text-sm mt-1">قم برفع مخططات أو مستندات جديدة</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map(file => (
                  <div key={file.id} className="group relative bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-center text-center gap-3">
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg" title="حذف الملف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-black text-gray-800 truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">{file.size} • {file.created_at?.split(' ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-bold">الاسم</th>
                      <th className="px-6 py-3 font-bold">المشروع</th>
                      <th className="px-6 py-3 font-bold">الحجم</th>
                      <th className="px-6 py-3 font-bold">تاريخ الرفع</th>
                      <th className="px-6 py-3 font-bold">بواسطة</th>
                      <th className="px-6 py-3 font-bold w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFiles.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <span className="font-bold text-gray-800">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-600">{file.project_id ? file.project_name : 'عام'}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono">{file.size}</td>
                        <td className="px-6 py-4 text-gray-500">{file.created_at?.split(' ')[0]}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                            {file.uploader}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              const element = document.createElement("a");
                              const fileData = new Blob([`محتوى تجريبي للملف: ${file.name}`], {type: 'text/plain'});
                              element.href = URL.createObjectURL(fileData);
                              element.download = file.name;
                              document.body.appendChild(element);
                              element.click();
                            }} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50" title="تحميل"><Download className="w-4 h-4" /></button>
                            
                            <button onClick={() => {
                              navigator.clipboard.writeText(`https://erp.local/files/${file.id}/${file.name}`);
                            }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="نسخ رابط المشاركة"><Share2 className="w-4 h-4" /></button>
                            
                            <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="حذف"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="رفع ملفات للمشروع" className="max-w-xl">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم الملف المرجعي <span className="text-red-500">*</span></label>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} required />
          </div>

          <div 
            className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
              dragActive ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} />
            <UploadCloud className={`w-10 h-10 mb-2 ${dragActive ? 'text-primary-600 animate-bounce' : 'text-gray-400'}`} />
            <p className="text-gray-800 font-bold text-sm">اسحب وأفلت المخططات هنا أو اضغط للاختيار</p>
            {selectedFile && <p className="text-primary-600 text-sm mt-2 font-black">{selectedFile.name}</p>}
          </div>

          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-bold flex items-start gap-3 border border-amber-100">
            <Briefcase className="w-5 h-5 shrink-0 text-amber-500" />
            <p>سيتم ربط هذه الملفات بالمشروع المختار حالياً: <span className="font-black text-amber-900 bg-amber-200/50 px-2 rounded">{currentProject === 'الكل' ? 'عام (لا يرتبط بمشروع محدد)' : currentProject}</span>.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setShowUploadModal(false)} className="rounded-xl font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">بدء الرفع والحفظ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

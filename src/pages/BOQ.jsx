import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Card, Badge, Button, Input, Modal, Select } from '../components/UI';
import {
  FileSpreadsheet,
  Plus,
  Search,
  UploadCloud,
  Calculator,
  Download,
  AlertTriangle,
  CheckCircle2,
  ListTree,
  TrendingDown,
  TrendingUp,
  Percent,
  Trash2,
  Clock
} from 'lucide-react';

import { extractTextFromImage, parseTextToBOQTable } from '../services/ocrService';
import { Camera, Loader2 } from 'lucide-react';

export default function BOQ() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [materialsCatalog, setMaterialsCatalog] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  const [projectDuration, setProjectDuration] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', unit: 'متر مربع', qty: 1, estRate: 100 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchBoqItemsForProject();
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
      
      const catalogRows = await window.electronAPI.queryDb('SELECT * FROM materials_catalog');
      setMaterialsCatalog(catalogRows || []);
    } catch(e) {
      console.error(e);
    }
  };

  const fetchBoqItemsForProject = async () => {
    if (!window.electronAPI || !selectedProject) return;
    
    try {
      // 1. Fetch Takeoff Measurements (auto-generated BOQ)
      const takeoffRows = await window.electronAPI.queryDb('SELECT * FROM takeoff_measurements WHERE project_id = ? ORDER BY id ASC', [selectedProject]);
      const mappedTakeoff = (takeoffRows || []).map((item, index) => ({
        id: `T-${item.id}`,
        description: item.element_name,
        unit: item.unit,
        qty: item.raw_value,
        estRate: (item.estimated_cost / (item.raw_value || 1)), 
        actRate: (item.estimated_cost / (item.raw_value || 1)),
        isHeader: false,
        source: 'takeoff'
      }));
      
      const takeoffHeader = mappedTakeoff.length > 0 ? [{
        id: '1.0', description: 'الأعمال المستوردة من الحصر الرقمي', unit: '-', qty: 0, estRate: 0, actRate: 0, isHeader: true, source: 'header'
      }] : [];

      // 2. Fetch Manual BOQ Items for this project
      const dbBoqItems = await window.electronAPI.queryDb(`SELECT * FROM boq_items WHERE project_id = ? ORDER BY id ASC`, [selectedProject]);
      const mappedDbItems = (dbBoqItems || []).map(item => ({
        id: `DB-${item.id}`,
        dbId: item.id,
        description: item.description,
        unit: item.unit,
        qty: item.qty,
        estRate: item.est_rate,
        actRate: item.act_rate,
        isHeader: item.is_header === 1,
        source: 'manual'
      }));

      const manualHeader = mappedDbItems.length > 0 ? [{
        id: '2.0', description: 'الأعمال المضافة يدوياً والمستوردة', unit: '-', qty: 0, estRate: 0, actRate: 0, isHeader: true, source: 'header'
      }] : [];

      setBoqItems([...takeoffHeader, ...mappedTakeoff, ...manualHeader, ...mappedDbItems]);

      // Calculate Duration from tasks
      const taskRows = await window.electronAPI.queryDb('SELECT start_date, end_date FROM tasks WHERE project_id = ?', [selectedProject]);
      if (taskRows && taskRows.length > 0) {
        const startDates = taskRows.map(t => new Date(t.start_date).getTime()).filter(t => !isNaN(t));
        const endDates = taskRows.map(t => new Date(t.end_date).getTime()).filter(t => !isNaN(t));
        if (startDates.length > 0 && endDates.length > 0) {
          const min = Math.min(...startDates);
          const max = Math.max(...endDates);
          setProjectDuration(Math.ceil((max - min) / (1000 * 60 * 60 * 24)));
        } else {
          setProjectDuration(Number(localStorage.getItem('takeoff_project_duration')) || 0);
        }
      } else {
        setProjectDuration(Number(localStorage.getItem('takeoff_project_duration')) || 0);
      }

    } catch(e) {
      console.error(e);
    }
  };

  const handleAddBOQ = async (e) => {
    e.preventDefault();
    if (!window.electronAPI || !selectedProject) return;
    
    try {
      await window.electronAPI.executeDb(
        `INSERT INTO boq_items (project_id, description, unit, qty, est_rate, act_rate, is_header) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [selectedProject, formData.description, formData.unit, formData.qty, formData.estRate, formData.estRate, 0]
      );
      
      setShowAddModal(false);
      setFormData({ description: '', unit: 'متر مربع', qty: 1, estRate: 100 });
      fetchBoqItemsForProject();
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteBOQ = async (item) => {
    if (item.source === 'takeoff') {
      alert('لا يمكن حذف بنود الحصر الرقمي من هنا. يرجى حذفها من شاشة الحصر الرقمي المخصصة.');
      return;
    }
    if (item.source === 'manual' && await confirmDialog('هل تريد حذف هذا البند من جدول الكميات؟')) {
      await window.electronAPI.executeDb('DELETE FROM boq_items WHERE id = ?', [item.dbId]);
      fetchBoqItemsForProject();
    }
  };

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProject) return;

    setIsOcrProcessing(true);
    setOcrProgress(0);
    try {
      const extractedText = await extractTextFromImage(file, (progress) => {
        setOcrProgress(progress);
      });
      
      const newItems = parseTextToBOQTable(extractedText);
      
      // Save OCR items to database
      for (const item of newItems) {
        const matchedMaterial = materialsCatalog.find(m => item.description.includes(m.name) || m.name.includes(item.description));
        const estimatedRate = matchedMaterial ? matchedMaterial.unit_price : 150; 
        
        await window.electronAPI.executeDb(
          `INSERT INTO boq_items (project_id, description, unit, qty, est_rate, act_rate, is_header) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [selectedProject, item.description, matchedMaterial ? matchedMaterial.unit : item.unit, item.quantity, estimatedRate, estimatedRate, 0]
        );
      }

      fetchBoqItemsForProject();
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const calculateTotal = (rateKey) => {
    return boqItems.reduce((acc, item) => !item.isHeader ? acc + (item.qty * item[rateKey]) : acc, 0);
  };

  const estTotal = calculateTotal('estRate');
  const actTotal = calculateTotal('actRate');
  const variance = estTotal - actTotal;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
             <FileSpreadsheet className="w-8 h-8 text-primary-600" />
             جداول الكميات <span className="text-primary-600">(BOQ)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">تسعير وحصر كميات المشاريع ومتابعة التكاليف الفعلية</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={selectedProject} 
            onChange={e => setSelectedProject(Number(e.target.value))}
            options={projects.map(p => ({label: p.name, value: p.id}))} 
            className="w-64 border-gray-200 focus:border-primary-500 bg-white"
          />
          <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200 bg-emerald-600 hover:bg-emerald-700 border-none text-white">
            <UploadCloud className="w-5 h-5 ml-2" /> استيراد Excel
          </Button>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleOcrUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              disabled={isOcrProcessing || !selectedProject} 
            />
            <Button variant="secondary" className="rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 w-48 font-bold" disabled={isOcrProcessing || !selectedProject}>
              {isOcrProcessing ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Camera className="w-5 h-5 ml-2" />}
              {isOcrProcessing ? `جارِ الاستخراج ${ocrProgress}%` : 'استيراد بصورة (OCR)'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 shrink-0">
        <Card className="p-5 flex items-center gap-4 border-indigo-100 dark:border-indigo-900/30 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Calculator className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">إجمالي التكلفة التقديرية</p>
            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{estTotal.toLocaleString()} ر.س</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">التكلفة الفعلية (حتى الآن)</p>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{actTotal.toLocaleString()} ر.س</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-amber-100 dark:border-amber-900/30 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl"><Percent className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">نسبة الإنجاز المالي</p>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{estTotal > 0 ? ((actTotal / estTotal) * 100).toFixed(1) : '0.0'}%</p>
          </div>
        </Card>
        <Card className={`p-5 flex items-center gap-4 border shadow-sm ${variance >= 0 ? 'border-green-100 dark:border-green-900/30' : 'border-red-100 dark:border-red-900/30'}`}>
          <div className={`p-3 rounded-2xl ${variance >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {variance >= 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">الانحراف المالي (التوفير)</p>
            <p className={`text-2xl font-black ${variance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {Math.abs(variance).toLocaleString()} {variance < 0 ? '-' : '+'}
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-teal-100 dark:border-teal-900/30 shadow-sm">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">مدة تنفيذ المشروع</p>
            <p className="text-2xl font-black text-teal-900 dark:text-teal-100">{projectDuration} <span className="text-sm font-medium text-gray-500 dark:text-slate-500">يوم</span></p>
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث في بنود جدول الكميات..." 
              className="pr-10 w-full rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white font-bold"><Download className="w-4 h-4 ml-2" /> تصدير PDF</Button>
            <Button onClick={() => setShowAddModal(true)} disabled={!selectedProject} className="bg-primary-600 hover:bg-primary-700 text-white font-bold border-none shadow-sm">
              <Plus className="w-4 h-4 ml-2" /> إضافة بند جديد
            </Button>
          </div>
        </div>

        <div className="overflow-auto flex-1 bg-white relative">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-bold w-24">المرجع</th>
                <th className="px-6 py-3 font-bold">وصف الأعمال</th>
                <th className="px-6 py-3 font-bold w-24">الوحدة</th>
                <th className="px-6 py-3 font-bold w-32">الكمية</th>
                <th className="px-6 py-3 font-bold w-32">السعر التقديري</th>
                <th className="px-6 py-3 font-bold w-32">الإجمالي التقديري</th>
                <th className="px-6 py-3 font-bold w-32">السعر الفعلي</th>
                <th className="px-6 py-3 font-bold w-32">الإجمالي الفعلي</th>
                <th className="px-6 py-3 font-bold w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boqItems.filter(i => (i.description || '').includes(searchQuery)).length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-400 font-bold">لا توجد بيانات BOQ مضافة في هذا المشروع.</td>
                </tr>
              ) : boqItems.filter(i => (i.description || '').includes(searchQuery)).map((item, idx) => (
                <tr key={idx} className={`${item.isHeader ? 'bg-primary-50/50' : 'hover:bg-gray-50/80'} transition-colors`}>
                  <td className={`px-6 py-4 ${item.isHeader ? 'font-black text-primary-700' : 'font-semibold text-gray-400 font-mono text-xs'}`}>{item.id}</td>
                  <td className={`px-6 py-4 ${item.isHeader ? 'font-black text-primary-800 text-base' : 'text-gray-800 font-bold'}`}>
                    {item.isHeader ? <span className="flex items-center gap-2"><ListTree className="w-5 h-5 text-primary-500" /> {item.description}</span> : <span className="pr-6">{item.description}</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{item.unit}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{item.isHeader ? '' : Number(item.qty).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{item.isHeader ? '' : `${Number(item.estRate).toLocaleString()}`}</td>
                  <td className="px-6 py-4 font-black text-indigo-600">{item.isHeader ? '' : `${(item.qty * item.estRate).toLocaleString()}`}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{item.isHeader ? '' : `${Number(item.actRate).toLocaleString()}`}</td>
                  <td className="px-6 py-4 font-black text-emerald-600">{item.isHeader ? '' : `${(item.qty * item.actRate).toLocaleString()}`}</td>
                  <td className="px-6 py-4">
                    {!item.isHeader && item.source === 'manual' && (
                      <button onClick={() => handleDeleteBOQ(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة بند BOQ يدوي" className="max-w-xl">
        <form onSubmit={handleAddBOQ} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">وصف البند <span className="text-red-500">*</span></label>
            <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الوحدة</label>
              <Select options={[{label:'متر مربع',value:'متر مربع'},{label:'متر مكعب',value:'متر مكعب'},{label:'مقطوعية',value:'مقطوعية'},{label:'حبة',value:'حبة'}]} value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الكمية المقدرة</label>
              <Input type="number" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">السعر الإفرادي التقديري (ر.س)</label>
            <Input type="number" value={formData.estRate} onChange={e => setFormData({...formData, estRate: e.target.value})} required />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold text-gray-600">إلغاء</Button>
            <Button type="submit" className="rounded-xl shadow-lg shadow-primary-200 bg-primary-600 hover:bg-primary-700 text-white font-bold border-none">إضافة البند للمشروع</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

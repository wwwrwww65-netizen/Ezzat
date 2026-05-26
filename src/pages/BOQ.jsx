import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
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
  Percent
} from 'lucide-react';

import { extractTextFromImage, parseTextToBOQTable } from '../services/ocrService';
import { Camera, Loader2 } from 'lucide-react';

export default function BOQ() {
  const { projects } = useData();
  const [selectedProject, setSelectedProject] = useState(projects && projects[0] ? projects[0].id : '');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [materialsCatalog, setMaterialsCatalog] = useState([]);
  const [boqItems, setBoqItems] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', unit: 'متر مربع', qty: 1, estRate: 100 });

  const handleAddBOQ = (e) => {
    e.preventDefault();
    const newItem = {
      id: `M-${Date.now().toString().slice(-4)}`,
      description: formData.description,
      unit: formData.unit,
      qty: Number(formData.qty),
      estRate: Number(formData.estRate),
      actRate: Number(formData.estRate),
      isHeader: false
    };
    setBoqItems([...boqItems, newItem]);
    setShowAddModal(false);
    setFormData({ description: '', unit: 'متر مربع', qty: 1, estRate: 100 });
  };

  const handleDeleteBOQ = (id) => {
    setBoqItems(boqItems.filter(item => item.id !== id));
  };

  // جلب تسعيرة المواد من قاعدة البيانات SQLite المركزية وجلب الحصر الرقمي
  React.useEffect(() => {
    const fetchBoqData = async () => {
      if (window.electronAPI) {
        // جلب كتالوج المواد
        const catalogRows = await window.electronAPI.queryDb('SELECT * FROM materials_catalog');
        setMaterialsCatalog(catalogRows);
        
        // جلب القياسات التي تمت من شاشة الحصر الرقمي
        const takeoffRows = await window.electronAPI.queryDb('SELECT * FROM takeoff_measurements ORDER BY id ASC');
        
        // تحويل القياسات إلى بنود (BOQ Items)
        const mappedItems = takeoffRows.map((item, index) => {
          return {
            id: `1.${index + 1}`,
            description: item.element_name,
            unit: item.unit,
            qty: item.raw_value,
            estRate: (item.estimated_cost / (item.raw_value || 1)), // حساب السعر الإفرادي التقديري
            actRate: (item.estimated_cost / (item.raw_value || 1)), // افتراض أن الفعلي هو التقديري حالياً
            isHeader: false,
            dbId: item.id
          };
        });
        
        // إضافة عنوان رئيسي فوق البنود
        const headerItem = {
          id: '1.0', description: 'الأعمال المستوردة من الحصر الرقمي', unit: '-', qty: 0, estRate: 0, actRate: 0, isHeader: true
        };
        
        setBoqItems(mappedItems.length > 0 ? [headerItem, ...mappedItems] : []);
      }
    };
    fetchBoqData();
  }, [selectedProject]);

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrProgress(0);
    try {
      const extractedText = await extractTextFromImage(file, (progress) => {
        setOcrProgress(progress);
      });
      
      const newItems = parseTextToBOQTable(extractedText);
      
      const formattedItems = newItems.map((item, index) => {
        const matchedMaterial = materialsCatalog.find(m => item.description.includes(m.name) || m.name.includes(item.description));
        const estimatedRate = matchedMaterial ? matchedMaterial.unit_price : 150; 
        
        return {
          id: `OCR-${Math.floor(Math.random() * 1000)}`,
          description: item.description,
          unit: matchedMaterial ? matchedMaterial.unit : item.unit,
          qty: item.quantity,
          estRate: estimatedRate, 
          actRate: estimatedRate, 
          isHeader: false
        };
      });

      setBoqItems(prev => [...prev, ...formattedItems]);
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
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">جداول الكميات <span className="text-primary-600">(BOQ)</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">تسعير وحصر كميات المشاريع ومتابعة التكاليف الفعلية</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            options={projects.map(p => ({label: p.name, value: p.id}))} 
            className="w-64 border-primary-200 focus:border-primary-500"
          />
          <Button variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
            <UploadCloud className="w-5 h-5 ml-2" /> استيراد Excel
          </Button>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleOcrUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              disabled={isOcrProcessing} 
            />
            <Button variant="secondary" className="rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 w-48" disabled={isOcrProcessing}>
              {isOcrProcessing ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Camera className="w-5 h-5 ml-2" />}
              {isOcrProcessing ? `جارِ الاستخراج ${ocrProgress}%` : 'استيراد بصورة (OCR)'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-l from-indigo-50 to-white border-indigo-100 shadow-sm">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Calculator className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">إجمالي التكلفة التقديرية</p>
            <p className="text-2xl font-black text-indigo-900">{estTotal.toLocaleString()} ر.س</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-l from-emerald-50 to-white border-emerald-100 shadow-sm">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">التكلفة الفعلية (حتى الآن)</p>
            <p className="text-2xl font-black text-emerald-900">{actTotal.toLocaleString()} ر.س</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-l from-amber-50 to-white border-amber-100 shadow-sm">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Percent className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">نسبة الإنجاز المالي</p>
            <p className="text-2xl font-black text-amber-900">{estTotal > 0 ? ((actTotal / estTotal) * 100).toFixed(1) : '0.0'}%</p>
          </div>
        </Card>
        <Card className={`p-5 flex items-center gap-4 bg-gradient-to-l border shadow-sm ${variance >= 0 ? 'from-green-50 border-green-100' : 'from-red-50 border-red-100'}`}>
          <div className={`p-3 rounded-2xl ${variance >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {variance >= 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">الانحراف المالي (التوفير)</p>
            <p className={`text-2xl font-black ${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {Math.abs(variance).toLocaleString()} {variance < 0 ? '-' : '+'}
            </p>
          </div>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="البحث في البنود..." 
              className="pr-10 w-full rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white"><Download className="w-4 h-4 ml-2" /> تصدير</Button>
            <Button variant="secondary" onClick={() => setShowAddModal(true)} className="bg-white"><Plus className="w-4 h-4 ml-2" /> إضافة بند جديد</Button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-100/50 border-b border-gray-200 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-bold w-24">رقم البند</th>
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
              {boqItems.filter(i => i.description.includes(searchQuery)).map((item, idx) => (
                <tr key={idx} className={`${item.isHeader ? 'bg-primary-50/30' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-3 ${item.isHeader ? 'font-black text-primary-700' : 'font-semibold text-gray-500'}`}>{item.id}</td>
                  <td className={`px-6 py-3 ${item.isHeader ? 'font-black text-primary-800 text-base' : 'text-gray-800'}`}>
                    {item.isHeader ? <span className="flex items-center gap-2"><ListTree className="w-4 h-4" /> {item.description}</span> : <span className="pr-6">{item.description}</span>}
                  </td>
                  <td className="px-6 py-3 text-gray-500 font-medium">{item.unit}</td>
                  <td className="px-6 py-3 font-bold text-gray-700">{item.isHeader ? '' : item.qty.toLocaleString()}</td>
                  <td className="px-6 py-3 font-bold text-gray-700">{item.isHeader ? '' : `${item.estRate.toLocaleString()} ر.س`}</td>
                  <td className="px-6 py-3 font-black text-indigo-700">{item.isHeader ? '' : `${(item.qty * item.estRate).toLocaleString()} ر.س`}</td>
                  <td className="px-6 py-3 font-bold text-gray-700">{item.isHeader ? '' : `${item.actRate.toLocaleString()} ر.س`}</td>
                  <td className="px-6 py-3 font-black text-emerald-700">{item.isHeader ? '' : `${(item.qty * item.actRate).toLocaleString()} ر.س`}</td>
                  <td className="px-6 py-3">
                    {!item.isHeader && (
                      <button onClick={() => handleDeleteBOQ(item.id)} className="text-red-500 hover:text-red-700 font-bold text-sm">حذف</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة بند BOQ يدوي">
        <form noValidate onSubmit={handleAddBOQ} className="space-y-4">
          <Input label="وصف البند" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="الوحدة" options={[{label:'متر مربع',value:'متر مربع'},{label:'متر مكعب',value:'متر مكعب'},{label:'مقطوعية',value:'مقطوعية'},{label:'حبة',value:'حبة'}]} value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            <Input label="الكمية" type="number" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} />
          </div>
          <Input label="السعر الإفرادي التقديري (ر.س)" type="number" value={formData.estRate} onChange={e => setFormData({...formData, estRate: e.target.value})} />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)} className="rounded-xl">إلغاء</Button>
            <Button variant="primary" type="submit" className="rounded-xl shadow-lg shadow-primary-200">إضافة البند</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

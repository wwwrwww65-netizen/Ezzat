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

export default function BOQ() {
  const { projects } = useData();
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock BOQ Data
  const [boqItems, setBoqItems] = useState([
    { id: '1.0', description: 'الأعمال الترابية والأساسات', unit: '-', qty: 0, estRate: 0, actRate: 0, isHeader: true },
    { id: '1.1', description: 'حفر لزوم القواعد والأساسات', unit: 'م3', qty: 1500, estRate: 35, actRate: 40, isHeader: false },
    { id: '1.2', description: 'ردميات بتربة موردة ونظيفة', unit: 'م3', qty: 800, estRate: 25, actRate: 22, isHeader: false },
    { id: '2.0', description: 'الأعمال الخرسانية', unit: '-', qty: 0, estRate: 0, actRate: 0, isHeader: true },
    { id: '2.1', description: 'خرسانة عادية صب صنف (C20)', unit: 'م3', qty: 250, estRate: 250, actRate: 260, isHeader: false },
    { id: '2.2', description: 'خرسانة مسلحة صب صنف (C35)', unit: 'م3', qty: 1200, estRate: 450, actRate: 440, isHeader: false },
    { id: '3.0', description: 'أعمال التشطيبات', unit: '-', qty: 0, estRate: 0, actRate: 0, isHeader: true },
    { id: '3.1', description: 'أعمال البلاط والرخام', unit: 'م2', qty: 3500, estRate: 120, actRate: 135, isHeader: false },
  ]);

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
            <p className="text-2xl font-black text-amber-900">{((actTotal / estTotal) * 100).toFixed(1)}%</p>
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
            <Button variant="secondary" className="bg-white"><Plus className="w-4 h-4 ml-2" /> إضافة بند جديد</Button>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

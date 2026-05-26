import React, { useState } from 'react';
import { Card, Badge, Table, Button, Input, Modal, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  Filter,
  Download,
  X
} from 'lucide-react';

// Default specification names to suggest when selecting a category
const defaultCategorySpecs = {
  1: ['الوزن للكيس (كجم)', 'معدل التغطية'],
  2: ['الطول', 'العرض', 'الارتفاع'],
  3: ['القطر (ملم)', 'وزن المتر الطولي (كجم/م)'],
  5: ['العمق الافتراضي للحفر', 'معامل الانتفاش'],
  6: ['جهد الخرسانة', 'الكثافة'],
  7: ['الطول', 'العرض', 'السماكة', 'معدل التغطية'],
  8: ['القطر (بوصة)', 'الطول'],
  9: ['الطول', 'العرض'],
  10: ['سعة النقل']
};

const commonSpecNames = [
  'الطول', 'العرض', 'الارتفاع', 'السماكة', 'العمق الافتراضي للحفر', 
  'معدل التغطية', 'الكثافة', 'جهد الخرسانة', 'الوزن', 'القطر (ملم)'
];

export default function Materials() {
  const { inventory, categories, addItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unit: 'متر مربع',
    buyPrice: 0,
    sellPrice: 0,
    customSpecs: [] // Array of { id, name, value }
  });

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCategoryChange = (catId) => {
    const id = Number(catId);
    let newSpecs = [];
    
    // Auto-populate some default helpful specs based on category
    if (defaultCategorySpecs[id]) {
      newSpecs = defaultCategorySpecs[id].map((specName, index) => ({
        id: Date.now() + index,
        name: specName,
        value: ''
      }));
    }

    setFormData({
      ...formData,
      categoryId: catId,
      customSpecs: newSpecs
    });
  };

  const toggleCommonSpec = (specName) => {
    setFormData(prev => {
      const exists = prev.customSpecs.some(s => s.name === specName);
      if (exists) {
        return { ...prev, customSpecs: prev.customSpecs.filter(s => s.name !== specName) };
      } else {
        return { ...prev, customSpecs: [...prev.customSpecs, { id: Date.now() + Math.random(), name: specName, value: '' }] };
      }
    });
  };

  const addCustomSpec = () => {
    setFormData(prev => ({
      ...prev,
      customSpecs: [...prev.customSpecs, { id: Date.now(), name: '', value: '' }]
    }));
  };

  const removeCustomSpec = (id) => {
    setFormData(prev => ({
      ...prev,
      customSpecs: prev.customSpecs.filter(s => s.id !== id)
    }));
  };

  const updateCustomSpec = (id, field, val) => {
    setFormData(prev => ({
      ...prev,
      customSpecs: prev.customSpecs.map(s => s.id === id ? { ...s, [field]: val } : s)
    }));
  };

  const handleAddOrEditMaterial = (e) => {
    e.preventDefault();
    if (editingId) {
       deleteItem('inventory', editingId);
    }
    
    addItem('inventory', {
      ...formData,
      id: editingId || Date.now(),
      categoryId: Number(formData.categoryId) || 1,
      type: 'مخزني',
      status: 'متوفر',
      quantity: 0
    });
    
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', categoryId: '', unit: 'متر مربع', buyPrice: 0, sellPrice: 0, customSpecs: [] });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      categoryId: item.categoryId || '',
      unit: item.unit || 'متر مربع',
      buyPrice: item.buyPrice || 0,
      sellPrice: item.sellPrice || 0,
      customSpecs: item.customSpecs || []
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">دليل الأصناف والمواد</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">إدارة كافة المواد والمواصفات الفنية المخصصة للتسعير الذكي</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={openAddModal} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
             <Plus className="w-4 h-4" /> إضافة صنف
           </Button>
           <Button onClick={() => window.print()} variant="secondary" className="rounded-xl" title="طباعة / تصدير"><Download className="w-4 h-4" /></Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في دليل المواد..."
                className="pr-10 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Select options={categories.map(c => ({label: c.name, value: c.id}))} className="w-40" />
              <Button onClick={() => {
                const searchInput = document.querySelector('input[placeholder="البحث في دليل المواد..."]');
                if (searchInput) searchInput.focus();
              }} variant="secondary" size="sm" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
           </div>
        </div>

        <Table headers={['المادة / الصنف', 'الفئة', 'وحدة القياس', 'سعر الشراء', 'سعر البيع', 'الحالة', '']}>
           {filtered.map(item => (
             <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Package className="w-5 h-5" /></div>
                      <div>
                         <p className="text-sm font-bold text-gray-800">{item.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">SKU: {item.id}</p>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <Badge variant="neutral">{categories.find(c => c.id === item.categoryId)?.name || 'عام'}</Badge>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 font-black text-gray-700">{item.buyPrice} ر.س</td>
                <td className="px-6 py-4 font-black text-primary-600">{item.sellPrice} ر.س</td>
                <td className="px-6 py-4"><Badge variant="success">نشط</Badge></td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteItem('inventory', item.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
             </tr>
           ))}
        </Table>
      </Card>

      {/* Add/Edit Material Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingId ? "تعديل الصنف" : "إضافة صنف جديد"}>
        <form noValidate className="space-y-4" onSubmit={handleAddOrEditMaterial}>
          <Input 
            label="اسم الصنف / المادة" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الفئة"
              options={[{label: 'اختر الفئة...', value: ''}, ...categories.map(c => ({ label: c.name, value: c.id }))]}
              value={formData.categoryId}
              onChange={e => handleCategoryChange(e.target.value)}
              required
            />
            <Select
              label="وحدة القياس"
              options={[
                { label: 'متر مربع (م2)', value: 'م2' },
                { label: 'متر مكعب (م3)', value: 'م3' },
                { label: 'متر طولي (م.ط)', value: 'م طولي' },
                { label: 'سنتيمتر (سم)', value: 'سم' },
                { label: 'مليمتر (ملم)', value: 'ملم' },
                { label: 'بوصة (In)', value: 'بوصة' },
                { label: 'كجم', value: 'كجم' },
                { label: 'جرام', value: 'جرام' },
                { label: 'طن', value: 'طن' },
                { label: 'حبة / قطعة', value: 'حبة' },
                { label: 'كيس', value: 'كيس' },
                { label: 'لفة / رول', value: 'لفة' },
                { label: 'كرتون', value: 'كرتون' },
                { label: 'برميل', value: 'برميل' },
                { label: 'علبة', value: 'علبة' },
                { label: 'لتر', value: 'لتر' },
                { label: 'طقم', value: 'طقم' },
                { label: 'رد / حمولة', value: 'رد' },
                { label: 'قلاب', value: 'قلاب' },
                { label: 'يوم', value: 'يوم' },
                { label: 'شهر', value: 'شهر' },
                { label: 'مقطوعية', value: 'مقطوعية' }
              ]}
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="سعر الشراء التقديري" 
              type="number"
              value={formData.buyPrice} 
              onChange={e => setFormData({...formData, buyPrice: e.target.value})} 
              required
            />
            <Input 
              label="سعر البيع (المقايسة)" 
              type="number"
              value={formData.sellPrice} 
              onChange={e => setFormData({...formData, sellPrice: e.target.value})} 
              required
            />
          </div>

          {/* Dynamic Customizable Specs Section */}
          <div className="pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl mt-4 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h4 className="text-sm font-bold text-gray-800">المواصفات الفنية (للتسعير الذكي)</h4>
                 <p className="text-[11px] text-gray-500 mt-1 mb-3">
                   اختر المواصفات التي تريد إضافتها للصنف، سيستخدمها الذكاء الاصطناعي لحساب الكميات من المخطط.
                 </p>
                 
                 {/* Quick Toggles for Common Specs */}
                 <div className="flex flex-wrap gap-2 mb-4">
                   {commonSpecNames.map(specName => {
                     const isSelected = formData.customSpecs.some(s => s.name === specName);
                     return (
                       <label key={specName} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                         <input 
                           type="checkbox" 
                           className="rounded text-primary-600 focus:ring-primary-500 w-3 h-3"
                           checked={isSelected}
                           onChange={() => toggleCommonSpec(specName)}
                         />
                         {specName}
                       </label>
                     );
                   })}
                 </div>
               </div>
               
               <Button type="button" onClick={addCustomSpec} variant="secondary" size="sm" className="rounded-lg text-xs bg-white shrink-0">
                 <Plus className="w-3 h-3" /> مواصفة أخرى
               </Button>
            </div>
            
            <div className="space-y-3">
              {formData.customSpecs.length === 0 ? (
                <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                  لا توجد مواصفات مفعلة. قم باختيار المواصفات من الأعلى أو أضف مواصفة جديدة.
                </div>
              ) : (
                formData.customSpecs.map((spec, index) => {
                  const isCommon = commonSpecNames.includes(spec.name);
                  return (
                    <div key={spec.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex-1">
                        {isCommon ? (
                           <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-100">
                              {spec.name}
                           </div>
                        ) : (
                          <Input 
                            placeholder="اسم المواصفة (مثال: اللون)" 
                            value={spec.name}
                            onChange={e => updateCustomSpec(spec.id, 'name', e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          placeholder="القيمة" 
                          value={spec.value}
                          onChange={e => updateCustomSpec(spec.id, 'value', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeCustomSpec(spec.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button variant="primary" type="submit">{editingId ? "حفظ التعديلات" : "إضافة الصنف"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/UI';
import { Save, Building2, Receipt, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: '',
    taxNumber: '',
    commercialRegister: '',
    address: '',
    logoUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // جلب الإعدادات من قاعدة البيانات
  useEffect(() => {
    const fetchSettings = async () => {
      if (window.electronAPI) {
        const rows = await window.electronAPI.queryDb('SELECT * FROM settings');
        const loadedSettings = {};
        rows.forEach(row => {
          loadedSettings[row.key] = row.value;
        });
        setSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    };
    fetchSettings();
  }, []);

  // حفظ الإعدادات
  const handleSave = async () => {
    setIsSaving(true);
    if (window.electronAPI) {
      for (const [key, value] of Object.entries(settings)) {
        await window.electronAPI.executeDb(
          'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          [key, value]
        );
      }
    }
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pb-10">
      <div>
        <h1 className="text-3xl font-black text-gray-800">الإعدادات العامة للشركة</h1>
        <p className="text-gray-500 mt-2">تهيئة بيانات الشركة ليتم طباعتها على المستخلصات والفواتير الضريبية (ZATCA).</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* بيانات الشركة */}
        <Card className="p-6 border-t-4 border-t-primary-500 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            الهوية والبيانات الأساسية
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-8 mb-8 items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
              {settings.logoBase64 ? (
                <img src={settings.logoBase64} alt="Company Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 text-xs font-bold">شعار الشركة</div>
                  <div className="text-gray-300 text-[10px]">اضغط للرفع</div>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center pointer-events-none transition-all">
                <span className="text-white text-xs font-bold">تغيير الشعار</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم شركة المقاولات (يظهر في القوائم والفواتير)</label>
              <Input 
                name="companyName" 
                value={settings.companyName || ''} 
                onChange={handleChange} 
                placeholder="مثال: شركة إعمار المتقدمة للمقاولات" 
                className="text-lg font-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم السجل التجاري</label>
              <Input 
                name="commercialRegister" 
                value={settings.commercialRegister} 
                onChange={handleChange} 
                placeholder="أدخل رقم السجل التجاري" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">العنوان الوطني للشركة</label>
              <Input 
                name="address" 
                value={settings.address} 
                onChange={handleChange} 
                placeholder="مثال: الرياض، حي العليا، شارع الملك فهد" 
              />
            </div>
          </div>
        </Card>

        {/* بيانات الفوترة والضريبة */}
        <Card className="p-6 border-t-4 border-t-emerald-500 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            البيانات الضريبية (ZATCA)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الرقم الضريبي (VAT Number)</label>
              <Input 
                name="taxNumber" 
                value={settings.taxNumber} 
                onChange={handleChange} 
                placeholder="مكون من 15 رقم ويبدأ وينتهي بـ 3" 
              />
              <p className="text-xs text-gray-400 mt-2">هذا الرقم سيظهر في رمز الـ QR Code الخاص بالفواتير.</p>
            </div>
          </div>
        </Card>

        {/* الحماية والترخيص */}
        <Card className="p-6 border-t-4 border-t-indigo-500 shadow-sm bg-indigo-50/30">
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            حالة الترخيص (Firebase License)
          </h2>
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-indigo-100">
            <div>
              <p className="font-bold text-gray-800">رقم الجهاز (Device ID): <span className="font-mono text-indigo-600">REQ-8472-X9</span></p>
              <p className="text-sm text-green-600 font-bold mt-1">النسخة مفعلة (الترخيص ساري حتى 2027)</p>
            </div>
            <Button onClick={() => {
              setIsSaving(true);
              setTimeout(() => setIsSaving(false), 800);
            }} variant="outline" className="border-indigo-200 text-indigo-700">تحديث الترخيص</Button>
          </div>
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button onClick={handleSave} variant="primary" className="px-8 py-3 rounded-xl font-bold text-lg shadow-xl shadow-primary-200" disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : <><Save className="w-5 h-5 ml-2" /> حفظ الإعدادات</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

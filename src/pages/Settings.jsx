import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../components/UI';
import { 
  Info, MessageCircle, HardDrive, Medal, AlertTriangle, 
  Headset, Store, Receipt, Upload, Save, RotateCcw, 
  AppWindow, RefreshCw, Unplug, Wifi, 
  FolderOpen, Download, Trash2, Eraser, Bot, Eye, EyeOff, Edit2, CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'info';
  
  const [settings, setSettings] = useState({
    companyName: '',
    branchName: '',
    taxNumber: '',
    taxRate: '15',
    phone: '',
    whatsapp: '',
    footerMsg: '',
    currency: 'SAR',
    logoBase64: '',
    waAdminPhone: '+966539774699',
    waHubIp: '',
    waSendLoans: true,
    waSendExpenses: true,
    waSendReports: true,
    gdAutoBackup: false,
    gdInterval: '360',
    localBackupPath: '',
    localAutoBackup: false,
    localInterval: '360',
    perfMode: 'auto',
    geminiApiKey: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (window.electronAPI) {
        const rows = await window.electronAPI.queryDb('SELECT * FROM settings');
        const loadedSettings = {};
        rows.forEach(row => {
          if (row.value === 'true') loadedSettings[row.key] = true;
          else if (row.value === 'false') loadedSettings[row.key] = false;
          else loadedSettings[row.key] = row.value;
        });
        setSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    if (window.electronAPI) {
      for (const [key, value] of Object.entries(settings)) {
        await window.electronAPI.executeDb(
          'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          [key, String(value)]
        );
      }
    }
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('تم حفظ الإعدادات بنجاح!');
      setIsEditingApiKey(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }, 800);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

  const tabs = [
    { id: 'info', icon: Info, label: 'المعلومات والبيانات' },
    { id: 'whatsapp', icon: MessageCircle, label: 'الربط مع واتساب' },
    { id: 'backup', icon: HardDrive, label: 'التخزين والنسخ' },
    { id: 'ai', icon: Bot, label: 'الذكاء الاصطناعي' },
    { id: 'advanced', icon: AlertTriangle, label: 'خيارات متقدمة' },
    { id: 'support', icon: Headset, label: 'الدعم الفني والخدمات' },
  ];

  return (
    <div className="pb-12">
      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-white backdrop-blur-md border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {(() => {
              const activeTabInfo = tabs.find(t => t.id === activeTab);
              const Icon = activeTabInfo?.icon;
              return (
                <>
                  {Icon && <Icon className="w-6 h-6 text-blue-600" />}
                  {activeTabInfo?.label}
                </>
              );
            })()}
          </h3>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-4 h-4" /> {saveMessage}
              </span>
            )}
            <Button variant="outline" className="border-gray-200 text-gray-600 font-bold px-4 hover:bg-gray-50">
              <RotateCcw className="w-4 h-4 ml-2" /> استعادة الافتراضية
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-200">
              {isSaving ? 'جاري الحفظ...' : <><Save className="w-4 h-4 ml-2" /> حفظ وتطبيق الإعدادات</>}
            </Button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="p-8">
          {/* معلومات وبيانات */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Col 1 */}
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                    <Store className="w-6 h-6 text-blue-600" />
                    <h4 className="text-lg font-bold text-gray-800">هوية وبيانات الشركة الأساسية</h4>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">شعار الشركة (Drag & Drop)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-400 transition-all p-8 flex flex-col items-center justify-center relative cursor-pointer group h-48">
                      {settings.logoBase64 ? (
                         <img src={settings.logoBase64} alt="Preview" className="h-full object-contain" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                          <p className="text-gray-700 font-bold">اسحب وأفلت صورة الشعار هنا</p>
                          <p className="text-xs text-gray-400 mt-1">أو انقر لتصفح الملفات من جهازك (JPG/PNG)</p>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم الشركة الرسمي</label>
                      <Input name="companyName" value={settings.companyName} onChange={handleChange} placeholder="مثال: شركة إعمار المتقدمة للمقاولات" className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الوصف التفصيلي أو الفرع</label>
                      <Input name="branchName" value={settings.branchName} onChange={handleChange} placeholder="مثال: الرياض، حي العليا" className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100 py-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                    <Receipt className="w-6 h-6 text-blue-600" />
                    <h4 className="text-lg font-bold text-gray-800">إعدادات الفواتير والضرائب</h4>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الرقم الضريبي (VAT Number)</label>
                      <Input name="taxNumber" value={settings.taxNumber} onChange={handleChange} placeholder="3000xxxxxxxxxxx3" className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نسبة ضريبة القيمة المضافة (%)</label>
                      <Input name="taxRate" type="number" value={settings.taxRate} onChange={handleChange} className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100 py-3" />
                      <p className="text-xs text-gray-500 mt-2">تُطبق النسبة تلقائياً على كافة الفواتير والتقارير في النظام.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم هاتف الشركة الموحد</label>
                        <Input name="phone" value={settings.phone} onChange={handleChange} placeholder="9200xxxx" className="bg-white border-gray-200 py-3" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم الواتساب الخاص بالشركة</label>
                        <Input name="whatsapp" value={settings.whatsapp} onChange={handleChange} placeholder="05xxxxxxxx" className="bg-white border-gray-200 py-3 text-left dir-ltr" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رسالة ترحيبية أسفل الفاتورة (Footer Message)</label>
                      <Input name="footerMsg" value={settings.footerMsg} onChange={handleChange} placeholder="شكرًا لتعاملكم معنا" className="bg-white border-gray-200 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">طابعة المستندات الرئيسية</label>
                      <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                        <option>الطابعة الافتراضية للويندوز (Default)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">عملة العرض في النظام</label>
                      <select name="currency" value={settings.currency} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                        <option value="SAR">ريال سعودي (ر.س)</option>
                        <option value="USD">دولار أمريكي ($)</option>
                        <option value="EUR">يورو (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* واتساب */}
          {activeTab === 'whatsapp' && (
             <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
                {/* Status Column */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl h-fit">
                   <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                     <MessageCircle className="w-6 h-6 text-green-500" />
                     <h4 className="text-lg font-bold text-gray-800">حالة الربط</h4>
                   </div>
                   
                   <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AppWindow className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 flex items-center gap-2">
                          واتساب (النافذة المتخفية)
                          <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> غير متصل
                          </span>
                        </h5>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          واتساب ويب يعمل في الخلفية تلقائياً لإرسال الرسائل والصور. يتطلب مسح QR مرة واحدة.
                        </p>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                      <h4 className="text-gray-500 text-sm mb-4">جاري التحقق من حالة الاتصال...</h4>
                      <Button className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl mb-3 shadow-lg shadow-green-200 flex justify-center items-center gap-2">
                        <AppWindow className="w-5 h-5" /> فتح نافذة واتساب
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 px-0">
                          <RefreshCw className="w-4 h-4 ml-1" /> تحديث
                        </Button>
                        <Button variant="outline" className="flex-1 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-0">
                          <Unplug className="w-4 h-4 ml-1" /> إيقاف
                        </Button>
                      </div>
                   </div>
                </div>

                {/* Settings Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم هاتف المحاسب/الإدارة لاستلام الإشعارات (مطلوب)</label>
                      <Input name="waAdminPhone" value={settings.waAdminPhone} onChange={handleChange} dir="ltr" className="bg-white py-3 text-left" />
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl mb-6">
                      <label className="block text-sm font-bold text-gray-800 mb-2">عنوان IP لجهاز واتساب المركزي (اختياري)</label>
                      <p className="text-xs text-gray-500 mb-3">اتركه فارغاً على الجهاز الذي يُرسل منه واتساب مباشرة. للأجهزة الفرعية، يتم اكتشافه تلقائياً.</p>
                      <div className="relative">
                        <Wifi className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                        <Input name="waHubIp" value={settings.waHubIp} onChange={handleChange} dir="ltr" placeholder="192.168.1.10" className="bg-white py-3 pl-4 pr-12 text-left" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-200 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">إرسال سندات السلف والرواتب للموظفين</h4>
                          <p className="text-xs text-gray-500 mt-1">إرسال صورة السند تلقائياً إلى واتساب الموظف المستفيد.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="waSendLoans" checked={settings.waSendLoans} onChange={handleChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-200 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">إرسال سندات المصروفات للإدارة</h4>
                          <p className="text-xs text-gray-500 mt-1">إرسال صورة سند عمليات المصروفات لرقم الإدارة.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="waSendExpenses" checked={settings.waSendExpenses} onChange={handleChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-200 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">إرسال تقرير الإنجاز اليومي</h4>
                          <p className="text-xs text-gray-500 mt-1">إرسال ملخص المهام والمشاريع عند نهاية اليوم.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="waSendReports" checked={settings.waSendReports} onChange={handleChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* التخزين والنسخ */}
          {activeTab === 'backup' && (
             <div className="grid grid-cols-1 gap-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Google Drive */}
                 <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">المزامنة مع جوجل درايف</h4>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4 mb-6">
                      <HardDrive className="w-8 h-8 text-red-500" />
                      <div>
                        <h4 className="font-bold text-gray-800">غير متصل</h4>
                        <p className="text-xs text-gray-500">لم يتم ربط أي حساب حتى الآن</p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-4">
                      تسجيل الدخول بحساب Google
                    </Button>
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input type="checkbox" name="gdAutoBackup" checked={settings.gdAutoBackup} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="font-bold text-gray-700 text-sm">نسخ احتياطي تلقائي إلى Google Drive</span>
                      </label>
                      <div className="flex items-center gap-3 pr-8">
                         <span className="text-sm text-gray-500">كل:</span>
                         <select name="gdInterval" value={settings.gdInterval} onChange={handleChange} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                           <option value="60">ساعة واحدة</option>
                           <option value="360">6 ساعات</option>
                           <option value="1440">يومياً</option>
                         </select>
                      </div>
                    </div>
                 </div>

                 {/* Local Sync */}
                 <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                      <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">المزامنة المحلية (LAN / Wi-Fi)</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      البرنامج يقوم بصورة تلقائية بتزامن البيانات فوريًا ومباشرًا مع الأجهزة المتواجدة على نفس الشبكة المحلية.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
                      <Wifi className="w-8 h-8 text-emerald-500" />
                      <div>
                        <h4 className="font-bold text-gray-800">المزامنة التلقائية نشطة</h4>
                        <p className="text-xs text-gray-500">تتم مزامنة بيانات المشاريع لحظياً</p>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Local Backup */}
               <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                    <HardDrive className="w-6 h-6 text-orange-500" />
                    <h4 className="text-lg font-bold text-gray-800">نسخ احتياطي على قرص محلي أو USB</h4>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">المجلد الهدف</label>
                    <div className="flex gap-3">
                      <code className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-left dir-ltr text-sm text-gray-700 font-mono">
                        {settings.localBackupPath || 'لم يُحدد بعد'}
                      </code>
                      <Button variant="outline" className="border-gray-200 bg-white">
                        <FolderOpen className="w-4 h-4 ml-2" /> اختيار مجلد
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6">
                      <Save className="w-4 h-4 ml-2" /> نسخ الآن
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6">
                      <Download className="w-4 h-4 ml-2" /> استعادة نسخة احتياطية
                    </Button>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input type="checkbox" name="localAutoBackup" checked={settings.localAutoBackup} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="font-bold text-gray-700 text-sm">نسخ تلقائي إلى نفس المجلد</span>
                    </label>
                    <div className="flex items-center gap-3 pr-8">
                        <span className="text-sm text-gray-500">كل:</span>
                        <select name="localInterval" value={settings.localInterval} onChange={handleChange} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                          <option value="60">ساعة واحدة</option>
                          <option value="360">6 ساعات</option>
                          <option value="1440">يومياً</option>
                        </select>
                    </div>
                  </div>
               </div>
             </div>
          )}

          {/* الذكاء الاصطناعي */}
          {activeTab === 'ai' && (
             <div className="grid grid-cols-1 gap-8">
               <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl max-w-4xl">
                 <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                   <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                     <Bot className="w-5 h-5 text-purple-600" />
                   </div>
                   <h4 className="text-lg font-bold text-gray-800">إعدادات الذكاء الاصطناعي (Gemini)</h4>
                 </div>
                 <div className="mb-6">
                   <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2 gap-2">
                     <div>
                       <label className="block text-sm font-bold text-gray-700">مفتاح API الخاص بـ Gemini</label>
                       <p className="text-xs text-gray-500 mt-1">يمكنك الحصول على المفتاح من منصة Google AI Studio. اتركه فارغاً لاستخدام المفتاح الافتراضي.</p>
                     </div>
                     {!isEditingApiKey && (
                       <Button type="button" onClick={() => setIsEditingApiKey(true)} variant="outline" size="sm" className="whitespace-nowrap flex items-center gap-2 border-primary-200 text-primary-700 hover:bg-primary-50 px-3">
                         <Edit2 className="w-4 h-4" /> تعديل المفتاح
                       </Button>
                     )}
                   </div>
                   <div className="relative mt-3">
                     <Input 
                       name="geminiApiKey" 
                       type={showApiKey ? "text" : "password"} 
                       value={settings.geminiApiKey || ''} 
                       onChange={handleChange} 
                       disabled={!isEditingApiKey}
                       dir="ltr" 
                       placeholder="AIzaSy..........................." 
                       className={`bg-white py-3 pr-12 text-left font-mono ${!isEditingApiKey ? 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-70' : 'border-primary-400 ring-2 ring-primary-100'}`} 
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowApiKey(!showApiKey)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 bg-transparent border-none"
                     >
                       {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                   {isEditingApiKey && (
                     <p className="text-[11px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" /> الحقل مفتوح للتعديل. لا تنس النقر على (حفظ وتطبيق الإعدادات) بعد التغيير.
                     </p>
                   )}
                 </div>
               </div>
             </div>
          )}

          {/* خيارات متقدمة */}
          {activeTab === 'advanced' && (
             <div className="space-y-6 max-w-4xl">
               <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                 <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                   <AlertTriangle className="w-6 h-6 text-gray-600" />
                   <h4 className="text-lg font-bold text-gray-800">وضع الأداء</h4>
                 </div>
                 <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                   يُكتشف تلقائياً على الأجهزة الضعيفة. عند التغيير تُحدَّث الصفحة فوراً.
                 </p>
                 <select name="perfMode" value={settings.perfMode} onChange={handleChange} className="w-full max-w-xs bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-bold outline-none">
                    <option value="auto">تلقائي (مُوصى به)</option>
                    <option value="weak">توفير طاقة — أجهزة ضعيفة</option>
                    <option value="strong">أداء كامل — أجهزة قوية</option>
                 </select>
               </div>

               <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
                 <div className="flex items-center gap-3 mb-6 border-b border-red-100 pb-4">
                   <AlertTriangle className="w-6 h-6 text-red-600" />
                   <h4 className="text-lg font-bold text-red-700">منطقة خطرة — إعادة ضبط البيانات</h4>
                 </div>

                 {/* Reset Ops */}
                 <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl flex gap-4 mb-4">
                   <Eraser className="w-8 h-8 text-amber-500 flex-shrink-0" />
                   <div>
                     <h5 className="font-bold text-amber-800 mb-2">تصفير العمليات الحسابية فقط</h5>
                     <p className="text-sm text-amber-700/80 mb-4 leading-relaxed">
                       يحذف جميع العمليات التجريبية: المشاريع، المستخلصات، المصروفات، وقيود المحاسبة. تبقى الأصناف، المعدات، الموردين والإعدادات كما هي.
                     </p>
                     <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                       <Eraser className="w-4 h-4 ml-2" /> تصفير العمليات الحسابية
                     </Button>
                   </div>
                 </div>

                 {/* Factory Reset */}
                 <div className="bg-red-50 border border-red-200 p-5 rounded-xl flex gap-4">
                   <Trash2 className="w-8 h-8 text-red-500 flex-shrink-0" />
                   <div>
                     <h5 className="font-bold text-red-800 mb-2">تصفير النظام بالكامل (Factory Reset)</h5>
                     <p className="text-sm text-red-700/80 mb-4 leading-relaxed">
                       حذف جميع بيانات العمل بالكامل. الإعدادات المحفوظة محلياً والمقاولين الخ. يُنصح بأخذ نسخة احتياطية قبل التنفيذ.
                     </p>
                     <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                       <Trash2 className="w-4 h-4 ml-2" /> تصفير النظام بالكامل
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {/* الدعم الفني */}
          {activeTab === 'support' && (
             <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-100 p-10 rounded-3xl text-center shadow-inner">
               <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
                 <Store className="w-16 h-16 text-blue-600" />
               </div>
               <h3 className="text-3xl font-black text-gray-800 mb-3">نظام إدارة المقاولات</h3>
               <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                 نحن هنا لخدمتكم وضمان سير عملكم بأفضل طريقة ممكنة. يمكنك التواصل معنا عبر قنوات الدعم المباشرة للحصول على المساعدة التقنية أو الاستفسارات.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                 <a href="#" className="bg-white hover:bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors shadow-sm hover:-translate-y-1 hover:shadow-md">
                   <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                     <MessageCircle className="w-7 h-7 text-green-600" />
                   </div>
                   <h4 className="font-bold text-gray-800">دعم واتساب المباشر</h4>
                   <p className="text-green-600 font-bold dir-ltr">+967 777 310 606</p>
                   <span className="text-xs text-gray-400 font-bold">(انقر هنا للتواصل)</span>
                 </a>

                 <a href="mailto:Mister.Casher@jeeey.com" className="bg-white hover:bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors shadow-sm hover:-translate-y-1 hover:shadow-md">
                   <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                     <Info className="w-7 h-7 text-blue-600" />
                   </div>
                   <h4 className="font-bold text-gray-800">البريد الإلكتروني</h4>
                   <p className="text-blue-600 font-bold">Mister.Casher@jeeey.com</p>
                   <span className="text-xs text-gray-400 font-bold">(انقر هنا للتواصل)</span>
                 </a>
               </div>

               <div className="border-t border-blue-200 pt-8 mt-4">
                 <p className="text-sm text-gray-500 mb-2">الإصدار الحالي: 3.0.0 Premium (نسخة المقاولات)</p>
                 <p className="text-gray-700 font-bold text-sm">جميع حقوق النظام محفوظة لدى شركة <span className="text-blue-600">جي كم للتسوق الإلكتروني</span> © 2026</p>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}

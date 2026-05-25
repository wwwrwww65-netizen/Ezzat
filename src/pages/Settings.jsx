import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { Save, Bell, Globe, Lock, Building, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { logActivity, theme, toggleTheme } = useData();
  const [formData, setFormData] = useState({
    companyName: 'شركة أبو جواد للمقاولات',
    email: 'contact@abujawad.com',
    currency: 'ر.س',
    language: 'العربية',
    taxNumber: '300012345600003'
  });

  const handleSave = (e) => {
    e.preventDefault();
    logActivity('تحديث إعدادات النظام العامة');
    alert('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">الإعدادات</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">إدارة تفاصيل الشركة وإعدادات النظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="بيانات الشركة" subtitle="المعلومات التي تظهر في الفواتير والسندات">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="اسم الشركة"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
                <Input
                  label="الرقم الضريبي"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                />
                <Input
                  label="البريد الإلكتروني للشركة"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <Select
                  label="العملة الأساسية"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  options={[{ label: 'ريال سعودي (ر.س)', value: 'ر.س' }, { label: 'دولار أمريكي ($)', value: '$' }]}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <Save className="w-4 h-4" />
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </Card>

          <Card title="الأمان والخصوصية" subtitle="تغيير كلمة المرور وإعدادات الدخول">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <Lock className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200">كلمة المرور</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">آخر تغيير منذ 3 أشهر</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">تحديث</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="التفضيلات">
            <div className="space-y-4">
              <Select
                label="لغة النظام"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                options={[{ label: 'العربية', value: 'العربية' }, { label: 'English', value: 'English' }]}
              />
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-slate-300">تفعيل الإشعارات</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded dark:bg-slate-800 dark:border-slate-600" />
                </div>

                {/* ===== الوضع الليلي — مربوط بالنظام الفعلي ===== */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    {theme === 'dark'
                      ? <Moon className="w-4 h-4 text-blue-400" />
                      : <Sun className="w-4 h-4 text-amber-500" />
                    }
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      {theme === 'dark' ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل'}
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      theme === 'dark' ? '-translate-x-6' : '-translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-primary-600 text-white">
            <div className="flex flex-col items-center text-center p-2">
              <Building className="w-12 h-12 mb-4 opacity-80" />
              <h3 className="font-bold text-lg">النسخة الاحترافية</h3>
              <p className="text-sm opacity-90 mt-2">أنت تستخدم النسخة الكاملة من نظام إدارة شركة أبو جواد</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

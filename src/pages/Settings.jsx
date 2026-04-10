import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../components/UI';
import { useData } from '../context/DataContext';
import { Save, Bell, Globe, Lock, Building } from 'lucide-react';

export default function Settings() {
  const { logActivity } = useData();
  const [formData, setFormData] = useState({
    companyName: 'شركة عزت للمقاولات والرخام',
    email: 'contact@ezzat.com',
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
        <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
        <p className="text-sm text-gray-500">إدارة تفاصيل الشركة وإعدادات النظام</p>
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
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg"><Lock className="w-5 h-5 text-gray-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">كلمة المرور</p>
                    <p className="text-xs text-gray-500">آخر تغيير منذ 3 أشهر</p>
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
                  <span className="text-sm text-gray-700">تفعيل الإشعارات</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">الوضع الليلي</span>
                  <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-primary-600 text-white">
            <div className="flex flex-col items-center text-center p-2">
              <Building className="w-12 h-12 mb-4 opacity-80" />
              <h3 className="font-bold text-lg">النسخة الاحترافية</h3>
              <p className="text-sm opacity-90 mt-2">أنت تستخدم النسخة الكاملة من نظام إدارة شركة عزت</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, Button, Input } from '../components/UI';
import { Settings as SettingsIcon, Bell, Shield, Building, Globe, Mail } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إعدادات النظام</h1>
        <Button>حفظ التغييرات</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: 'بيانات الشركة', icon: Building, active: true },
            { label: 'الإشعارات', icon: Bell, active: false },
            { label: 'الأمان والحماية', icon: Shield, active: false },
            { label: 'اللغة والمنطقة', icon: Globe, active: false },
            { label: 'إعدادات البريد', icon: Mail, active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card title="الملف الشخصي للشركة">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="اسم الشركة" defaultValue="شركة عزت للمقاولات والديكور" />
              <Input label="الرقم الضريبي" defaultValue="310245678900003" />
              <Input label="البريد الإلكتروني الرسمي" defaultValue="info@ezzat.com" />
              <Input label="رقم الهاتف" defaultValue="0114567890" />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">العنوان</label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  rows={3}
                  defaultValue="الرياض، حي الملقا، طريق الملك فهد، برج مكاتب النخبة، الطابق الرابع"
                ></textarea>
              </div>
            </div>
          </Card>

          <Card title="الإعدادات العامة">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">العملة الافتراضية</label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none">
                  <option>ريال سعودي (ر.س)</option>
                  <option>درهم إماراتي (د.إ)</option>
                  <option>دولار أمريكي ($)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">تنسيق التاريخ</label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none">
                  <option>YYYY-MM-DD</option>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, Badge, Button, Input, Select, Modal } from '../components/UI';
import { useData } from '../context/DataContext';
import {
  FileText, Plus, Search, Filter, Printer, Download, Eye, CheckCircle2, ChevronLeft
} from 'lucide-react';

export default function Valuations() {
  const { projects } = useData();
  const [activeTab, setActiveTab] = useState('owner'); // owner or subcontractor
  
  const [valuations] = useState([
    { id: 'VAL-101', project: 'مشروع مجمع الرياض السكني', type: 'مالك', no: 1, amount: 250000, retention: 25000, net: 225000, date: '2023-05-10', status: 'مدفوع' },
    { id: 'VAL-102', project: 'مشروع مجمع الرياض السكني', type: 'مالك', no: 2, amount: 400000, retention: 40000, net: 360000, date: '2023-08-15', status: 'مستحق' },
    { id: 'VAL-201', project: 'برج جدة التجاري', type: 'متبن', no: 1, amount: 150000, retention: 15000, net: 135000, date: '2023-11-01', status: 'قيد المراجعة' },
  ]);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">إدارة <span className="text-primary-600">المستخلصات</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">مستخلصات المالك ومقاولي الباطن، المحتجزات والدفعات المتبقية</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => window.print()} variant="secondary" className="bg-white shadow-sm"><Printer className="w-5 h-5 ml-2" /> طباعة تقرير</Button>
          <Button onClick={() => document.querySelector('input[placeholder="البحث برقم المستخلص، المشروع..."]')?.focus()} variant="primary" className="rounded-xl shadow-lg shadow-primary-200">
            <Plus className="w-5 h-5 ml-2" /> إنشاء مستخلص جديد
          </Button>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit shrink-0">
        <button 
          onClick={() => setActiveTab('owner')} 
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'owner' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          مستخلصات المالك (الإيرادات)
        </button>
        <button 
          onClick={() => setActiveTab('subcontractor')} 
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'subcontractor' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          مستخلصات مقاولي الباطن (المصروفات)
        </button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="البحث برقم المستخلص، المشروع..." className="pr-10 w-full rounded-xl" />
          </div>
          <Button onClick={() => document.querySelector('input[placeholder="البحث برقم المستخلص، المشروع..."]')?.focus()} variant="outline" className="bg-white"><Filter className="w-4 h-4 ml-2" /> تصفية</Button>
        </div>

        <div className="overflow-auto flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {valuations.filter(v => activeTab === 'owner' ? v.type === 'مالك' : v.type === 'متبن').map((val) => (
              <div key={val.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-primary-300 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-2 h-full ${val.status === 'مدفوع' ? 'bg-emerald-500' : val.status === 'مستحق' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="neutral" className="mb-2">رقم {val.no}</Badge>
                    <h3 className="font-bold text-gray-800 text-lg">{val.id}</h3>
                    <p className="text-sm text-gray-500 mt-1">{val.project}</p>
                  </div>
                  <Badge variant={val.status === 'مدفوع' ? 'success' : val.status === 'مستحق' ? 'danger' : 'warning'}>{val.status}</Badge>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">قيمة الأعمال المنجزة</span>
                    <span className="font-bold text-gray-800">{val.amount.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">المحتجزات (10%)</span>
                    <span className="font-bold text-red-600">- {val.retention.toLocaleString()} ر.س</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-black text-gray-900">الصافي المستحق</span>
                    <span className="font-black text-primary-600 text-lg">{val.net.toLocaleString()} ر.س</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => document.querySelector('input[placeholder="البحث برقم المستخلص، المشروع..."]')?.focus()} variant="secondary" className="flex-1 bg-gray-50 hover:bg-gray-100 text-xs py-2"><Eye className="w-4 h-4 ml-1" /> التفاصيل</Button>
                  <Button onClick={() => window.print()} variant="outline" className="flex-1 text-xs py-2"><Download className="w-4 h-4 ml-1" /> PDF</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

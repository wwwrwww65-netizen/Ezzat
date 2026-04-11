import React from 'react';
import { Card, Button } from '../components/UI';
import { Construction } from 'lucide-react';

export default function ClientPanel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="p-6 bg-primary-50 rounded-3xl">
        <Construction className="w-16 h-16 text-primary-600 animate-pulse" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">لوحة تحكم العميل</h1>
        <p className="text-gray-500 mt-2 font-medium">هذه الصفحة قيد التطوير حالياً لتوفير أفضل تجربة مستخدم.</p>
      </div>
      <Button variant="outline" onClick={() => window.history.back()}>العودة للخلف</Button>
    </div>
  );
}

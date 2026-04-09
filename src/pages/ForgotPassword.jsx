import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لتسجيل الدخول
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">استعادة كلمة المرور</h1>
          <p className="text-gray-500 mt-2">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة كلمة المرور</p>
        </div>

        <Card className="p-8 shadow-xl border-none">
          <form className="space-y-6">
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="name@company.com"
              required
            />
            <Button type="submit" className="w-full py-2.5 text-base" size="lg">
              إرسال رابط الاستعادة
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4 shadow-lg">ع</div>
          <h1 className="text-2xl font-bold text-gray-900">مرحباً بك مجدداً</h1>
          <p className="text-gray-500 mt-2">سجل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        <Card className="p-8 shadow-xl border-none">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="name@company.com"
              required
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-500"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <input
                type="password"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700">تذكرني</label>
            </div>

            <Button type="submit" className="w-full py-2.5 text-base" size="lg">
              تسجيل الدخول
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-gray-500">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} شركة عزت للمقاولات
        </p>
      </div>
    </div>
  );
}

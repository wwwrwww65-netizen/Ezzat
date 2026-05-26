import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import { Input, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState(localStorage.getItem('saved_username') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('saved_username') ? true : false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (window.electronAPI) {
        // وضع Electron: استعلام حقيقي من قاعدة البيانات
        const users = await window.electronAPI.queryDb(
          'SELECT * FROM users WHERE username = ? AND password = ?',
          [username, password]
        );
        
        if (users && users.length > 0) {
          const user = users[0];
          delete user.password;
          
          if (rememberMe) {
            localStorage.setItem('saved_username', username);
          } else {
            localStorage.removeItem('saved_username');
          }
          
          onLogin(user, rememberMe);
          navigate('/');
        } else {
          setError('اسم المستخدم أو كلمة المرور غير صحيحة');
          setIsLoading(false);
        }
      } else {
        // وضع المتصفح: بيانات افتراضية
        if (username === 'admin' && password === 'admin123') {
          if (rememberMe) localStorage.setItem('saved_username', username);
          else localStorage.removeItem('saved_username');
          
          onLogin({ id: 1, username: 'admin', role: 'admin' }, rememberMe);
          navigate('/');
        } else {
          setError('بيانات الدخول غير صحيحة — جرّب: admin / admin123');
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء محاولة تسجيل الدخول');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888081622-1f486d63fc3c?q=80&w=2070&auto=format&fit=crop')" }}>
      <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform rotate-3">
            <ShieldCheck className="w-12 h-12 text-primary-600 transform -rotate-3" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white">
          نظام إدارة المقاولات ERP
        </h2>
        <p className="mt-2 text-center text-sm text-primary-200 font-medium">
          يرجى تسجيل الدخول للوصول إلى النظام
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-primary-900/50 sm:rounded-3xl sm:px-10 border border-white/20">
          <form noValidate className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-xl">
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-3 pr-10 rounded-xl"
                  placeholder="أدخل اسم المستخدم"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-3 pr-10 rounded-xl"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">تذكرني</label>
              </div>
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full justify-center rounded-xl py-3 text-lg font-bold shadow-lg shadow-primary-200" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تسجيل الدخول'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400 font-medium">
            <p>نظام إدارة المقاولات (ConstERP) - الإصدار 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

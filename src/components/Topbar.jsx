import React from 'react';
import { Search, Bell, Menu, Shield, Calendar, Calculator, Sun, Moon } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Topbar({ onMenuClick }) {
  const { currentRole, setData, notifications, theme, toggleTheme } = useData();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const roles = [
    { id: 'admin', name: 'مدير النظام', color: 'text-red-600' },
    { id: 'engineer', name: 'مهندس', color: 'text-blue-600' },
    { id: 'client', name: 'عميل', color: 'text-emerald-600' },
    { id: 'supervisor', name: 'مشرف موقع', color: 'text-amber-600' },
  ];

  const handleRoleChange = (e) => {
    setData(prev => ({ ...prev, currentRole: e.target.value }));
  };

  return (
    <header className="h-16 bg-white dark:bg-[#151f32] border-b border-gray-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm dark:shadow-slate-900/50 transition-colors duration-200">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full hidden md:block group">
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 group-focus-within:text-primary-500 dark:group-focus-within:text-blue-400 transition-colors">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="block w-full pr-10 pl-3 py-2 border border-gray-200 dark:border-slate-800 rounded-xl leading-5 bg-gray-50/50 dark:bg-slate-900/50 text-gray-800 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-blue-500/20 focus:border-primary-500 dark:focus:border-blue-500 transition-all sm:text-sm"
            placeholder="البحث السريع في المشاريع، العملاء، أو الفواتير..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Tools */}
        <div className="hidden lg:flex items-center gap-1 border-l border-gray-100 dark:border-slate-800 pl-3 ml-1">
          <button className="p-2 text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="الآلة الحاسبة">
            <Calculator className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="التقويم">
            <Calendar className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-1.5 transition-colors hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm">
          <Shield className="w-4 h-4 text-primary-600 dark:text-blue-400" />
          <select
            value={currentRole}
            onChange={handleRoleChange}
            className="bg-transparent border-none text-xs font-bold text-gray-700 dark:text-slate-300 focus:ring-0 cursor-pointer outline-none"
          >
            {roles.map(role => (
              <option key={role.id} value={role.id} className="dark:bg-slate-900 dark:text-slate-100">{role.name}</option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-950/30 rounded-xl transition-all">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* ===== Theme Toggle Button ===== */}
        <button
          onClick={toggleTheme}
          className="relative p-2 rounded-xl transition-all duration-300 group"
          title={theme === 'dark' ? 'تحويل للوضع النهاري' : 'تحويل للوضع الليلي'}
          aria-label="تبديل الثيم"
        >
          {theme === 'dark' ? (
            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg shadow-md shadow-amber-200/40 group-hover:shadow-amber-300/50 transition-all duration-300 group-hover:scale-110">
              <Sun className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg shadow-md shadow-slate-200 group-hover:shadow-slate-300/50 transition-all duration-300 group-hover:scale-110">
              <Moon className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        <div className="h-8 w-px bg-gray-100 dark:bg-slate-800 mx-1"></div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 cursor-pointer group p-1 pr-2 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-xl transition-all">
          <div className="text-left hidden lg:block">
            <p className="text-sm font-bold text-gray-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-blue-400 transition-colors leading-tight">أحمد محمد</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-medium uppercase tracking-wider">
              {roles.find(r => r.id === currentRole)?.name}
            </p>
          </div>
          <div className="w-9 h-9 bg-primary-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center text-primary-600 dark:text-blue-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=e0e7ff&color=1e3a8a" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}

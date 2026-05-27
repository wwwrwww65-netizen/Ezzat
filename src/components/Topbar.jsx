import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Shield, Calendar, Calculator, Sun, Moon, Package, ShoppingCart, Users, RefreshCw, CheckCheck, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { cn } from './UI';

const CATEGORY_ICONS = {
  inventory: <Package className="w-4 h-4" />,
  purchases: <ShoppingCart className="w-4 h-4" />,
  suppliers: <Users className="w-4 h-4" />,
};

const TYPE_STYLES = {
  danger: { bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700', border: 'border-red-100' },
  warning: { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-100' },
  info: { bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-100' },
  success: { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-100' },
};

export default function Topbar({ onMenuClick }) {
  const { currentRole, setData, theme, toggleTheme } = useData();
  const { notifications, unreadCount, markAllRead, markRead, fetchNotifications, lastChecked } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  const roles = [
    { id: 'admin', name: 'مدير النظام', color: 'text-red-600' },
    { id: 'engineer', name: 'مهندس', color: 'text-blue-600' },
    { id: 'client', name: 'عميل', color: 'text-emerald-600' },
    { id: 'supervisor', name: 'مشرف موقع', color: 'text-amber-600' },
  ];

  const handleRoleChange = (e) => {
    setData(prev => ({ ...prev, currentRole: e.target.value }));
  };

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !bellRef.current.contains(e.target)) {
        setIsPanelOpen(false);
      }
    };
    if (isPanelOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPanelOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    if (notif.link) navigate(notif.link);
    setIsPanelOpen(false);
  };

  const dangerCount = notifications.filter(n => !n.read && n.type === 'danger').length;
  const warningCount = notifications.filter(n => !n.read && n.type === 'warning').length;

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

        {/* Notification Bell */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={cn(
              'relative p-2 rounded-xl transition-all',
              isPanelOpen
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                : 'text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-950/30'
            )}
          >
            <Bell className={cn('w-6 h-6 transition-all', unreadCount > 0 && 'animate-[wiggle_1s_ease-in-out]')} />
            {unreadCount > 0 && (
              <span className={cn(
                'absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] text-white flex items-center justify-center font-black border-2 border-white dark:border-[#151f32]',
                dangerCount > 0 ? 'bg-red-500' : 'bg-amber-500'
              )}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {isPanelOpen && (
            <div
              ref={panelRef}
              className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    مركز التنبيهات والإشعارات
                  </h3>
                  <p className="text-blue-200 text-xs mt-0.5">
                    {unreadCount > 0 ? unreadCount + ' إشعار جديد' : 'لا توجد إشعارات جديدة'}
                    {lastChecked && ' · آخر تحديث ' + new Date(lastChecked).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleRefresh}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="تحديث"
                  >
                    <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="تعيين الكل كمقروء"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary Chips */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 flex gap-2 border-b border-gray-50 dark:border-slate-800 flex-wrap">
                  {dangerCount > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                      🚨 {dangerCount} نفذ من المخزن
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                      ⚠️ {warningCount} تنبيه
                    </span>
                  )}
                  {notifications.filter(n => !n.read && n.category === 'purchases').length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                      🧾 {notifications.filter(n => !n.read && n.category === 'purchases').length} فاتورة آجلة
                    </span>
                  )}
                </div>
              )}

              {/* Notification List */}
              <div className="custom-scrollbar" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-bold text-gray-700 dark:text-slate-300">كل شيء على ما يرام!</p>
                    <p className="text-sm text-gray-400 mt-1">لا توجد تنبيهات تستوجب الاهتمام.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-slate-800">
                    {notifications.map(notif => {
                      const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={cn(
                            'w-full text-right px-5 py-4 flex items-start gap-3 transition-all hover:bg-gray-50 dark:hover:bg-slate-800/50 group',
                            !notif.read && style.bg
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5',
                            style.bg, 'border', style.border
                          )}>
                            {notif.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn('text-sm font-black truncate', !notif.read ? style.text : 'text-gray-700 dark:text-slate-300')}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', style.dot)} />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full', style.bg, style.text, 'border', style.border)}>
                                {CATEGORY_ICONS[notif.category]}
                                {notif.category === 'inventory' ? 'المخازن' : notif.category === 'purchases' ? 'المشتريات' : 'الموردون'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium group-hover:underline">
                                اضغط للانتقال ←
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">
                    {notifications.length} إشعار إجمالاً
                  </span>
                  <button
                    onClick={() => { markAllRead(); setIsPanelOpen(false); }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    تعيين الكل كمقروء
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
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

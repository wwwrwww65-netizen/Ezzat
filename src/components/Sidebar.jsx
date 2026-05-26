import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserSquare2,
  Wallet,
  FileText,
  TrendingDown,
  TrendingUp,
  Package,
  Truck,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  ChevronDown,
  ChevronLeft,
  Files,
  ClipboardList,
  CheckSquare,
  Bell,
  HardHat,
  Construction,
  FileBarChart,
  UserCheck,
  FolderOpen
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const sidebarGroups = [
  {
    title: 'الرئيسية',
    items: [
      { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
    ]
  },
  {
    title: 'إدارة العمليات',
    items: [
      {
        name: 'المشاريع',
        icon: Briefcase,
        children: [
          { name: 'قائمة المشاريع', href: '/projects' },
          { name: 'المخططات والملفات', href: '/files' },
          { name: 'جداول الكميات (BOQ)', href: '/boq' },
          { name: 'يوميات الموقع', href: '/daily-logs' },
          { name: 'الحصر الرقمي', href: '/digital-takeoff' },
          { name: 'المهام', href: '/tasks' },
          { name: 'الطلبات والموافقات', href: '/requests' },
        ]
      },
      { name: 'العملاء', href: '/clients', icon: Users },
      { name: 'لوحة العميل', href: '/client-panel', icon: UserCheck },
    ]
  },
  {
    title: 'المالية',
    items: [
      {
        name: 'الإدارة المالية',
        icon: Wallet,
        children: [
          { name: 'نظرة عامة', href: '/finance' },
          { name: 'الإيرادات', href: '/income' },
          { name: 'المصروفات', href: '/expenses' },
        ]
      },
      {
        name: 'المستخلصات والفواتير',
        icon: FileText,
        children: [
          { name: 'المستخلصات', href: '/valuations' },
          { name: 'الفواتير', href: '/invoices' },
          { name: 'الدفعات', href: '/payments' },
          { name: 'السندات', href: '/bonds' },
        ]
      },
    ]
  },
  {
    title: 'المخزون والمشتريات',
    items: [
      {
        name: 'المخزون',
        icon: Package,
        children: [
          { name: 'المخزون العام', href: '/inventory' },
          { name: 'المواد والأصناف', href: '/materials' },
          { name: 'الفئات', href: '/categories' },
        ]
      },
      {
        name: 'المشتريات',
        icon: Truck,
        children: [
          { name: 'الموردين', href: '/suppliers' },
          { name: 'أوامر الشراء', href: '/purchase-orders' },
        ]
      },
    ]
  },
  {
    title: 'الموارد البشرية والأصول',
    items: [
      { name: 'العمالة', href: '/labor', icon: HardHat },
      { name: 'الموظفون', href: '/employees', icon: UserSquare2 },
      { name: 'المعدات', href: '/equipment', icon: Construction },
    ]
  },
  {
    title: 'أدوات النظام',
    items: [
      { name: 'التقارير', href: '/reports', icon: BarChart3 },
      { name: 'مركز المستندات', href: '/documents', icon: FolderOpen },
      { name: 'سجل النشاط', href: '/activity-log', icon: History },
      { name: 'المستخدمون والصلاحيات', href: '/users', icon: ShieldCheck },
      { name: 'الإعدادات', href: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});
  const [companyInfo, setCompanyInfo] = useState({ name: 'أبو جواد', logo: null });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (window.electronAPI) {
        const rows = await window.electronAPI.queryDb("SELECT * FROM settings WHERE key IN ('companyName', 'logoBase64')");
        const info = { name: 'نظام إدارة المقاولات', logo: null };
        rows.forEach(row => {
          if (row.key === 'companyName' && row.value) info.name = row.value;
          if (row.key === 'logoBase64' && row.value) info.logo = row.value;
        });
        setCompanyInfo(info);
      }
    };
    fetchCompanyInfo();
  }, [location.pathname]);

  const toggleGroup = (name) => {
    setOpenGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-[#151f32] border-l border-gray-200 dark:border-slate-800 transition-all duration-300 transform lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyInfo.logo ? (
              <img src={companyInfo.logo} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white shadow-lg shadow-primary-200 dark:shadow-none" />
            ) : (
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200 dark:shadow-none">أ</div>
            )}
            <div>
              <span className="text-xl font-bold text-gray-800 dark:text-slate-100 truncate w-32 block">{companyInfo.name}</span>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">نظام إدارة مشاريع</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-[0.15em] mb-2">
                {group.title}
              </h3>
              {group.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isGroupOpen = openGroups[item.name];
                const isActive = item.href === location.pathname || (hasChildren && item.children.some(child => child.href === location.pathname));

                return (
                  <div key={item.name} className="space-y-1">
                    {hasChildren ? (
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "text-primary-600 dark:text-blue-400 bg-primary-50 dark:bg-blue-950/30"
                            : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn("w-5 h-5", isActive ? "text-primary-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500")} />
                          <span>{item.name}</span>
                        </div>
                        {isGroupOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      </button>
                    ) : (
                      <NavLink
                        to={item.href}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary-50 dark:bg-blue-950/30 text-primary-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-200"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500")} />
                            <span>{item.name}</span>
                          </>
                        )}
                      </NavLink>
                    )}

                    {hasChildren && isGroupOpen && (
                      <div className="mr-9 space-y-1 border-r-2 border-gray-100 dark:border-slate-800 mt-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) => cn(
                              "block px-3 py-2 rounded-md text-sm transition-all duration-200",
                              isActive
                                ? "text-primary-600 dark:text-blue-400 font-semibold bg-primary-50/50 dark:bg-blue-950/20"
                                : "text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60"
                            )}
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800/80">
          <button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              sessionStorage.removeItem('auth_token');
              window.location.href = '/#/login';
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}

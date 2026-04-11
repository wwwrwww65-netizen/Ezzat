import React from 'react';
import { NavLink } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
  { name: 'إدارة المشاريع', href: '/projects', icon: Briefcase },
  { name: 'العملاء', href: '/clients', icon: Users },
  { name: 'المالية والمحاسبة', href: '/finance', icon: Wallet },
  { name: 'المشتريات والموردين', href: '/suppliers', icon: Truck },
  { name: 'العمالة والمعدات', href: '/employees', icon: UserSquare2 },
  { name: 'المخزون والمواد', href: '/inventory', icon: Package },
  { name: 'الفواتير والسندات', href: '/invoices', icon: FileText },
  { name: 'التقارير والإحصائيات', href: '/reports', icon: BarChart3 },
  { name: 'سجل النشاط', href: '/activity-log', icon: History },
  { name: 'المستخدمون والصلاحيات', href: '/users', icon: ShieldCheck },
  { name: 'الإعدادات العامة', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 h-screen sticky top-0 flex flex-col transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">أ</div>
          <span className="text-xl font-bold text-gray-800">أبو جواد للمقاولات</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary-50 text-primary-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { Search, Bell, UserCircle, Menu } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full hidden md:block">
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="البحث في النظام..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">أحمد محمد</p>
            <p className="text-xs text-gray-500">مدير النظام</p>
          </div>
          <UserCircle className="w-8 h-8 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}

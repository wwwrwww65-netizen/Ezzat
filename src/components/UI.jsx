import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({ className, variant = 'primary', size = 'md', children, ...props }) => {
  const variants = {
    primary: 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] shadow-md shadow-blue-100 dark:shadow-none active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100 dark:shadow-none active:scale-95 dark:bg-red-700 dark:hover:bg-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800',
    outline: 'bg-transparent border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 font-bold active:scale-95 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3.5 text-base rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ className, children, title, subtitle, footer, noPadding = false }) => {
  return (
    <div className={cn('bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300', className)}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-800/80 flex items-center justify-between">
          <div>
             {title && <h3 className="text-lg font-black text-gray-800 dark:text-slate-100 tracking-tight">{title}</h3>}
             {subtitle && <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={cn(!noPadding && 'p-6')}>{children}</div>
      {footer && <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-950/20 border-t border-gray-50 dark:border-slate-800/80">{footer}</div>}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, footer, className }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      <div className={cn("bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative", className)}>
        <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-800 dark:text-slate-100 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all hover:rotate-90">
            <X className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar text-gray-700 dark:text-slate-350">
          {children}
        </div>
        {footer && (
          <div className="px-8 py-6 bg-gray-50/50 dark:bg-slate-950/20 border-t border-gray-50 dark:border-slate-800/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Select = ({ label, options, error, className, id, ...props }) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  return (
    <div className="space-y-2 w-full">
      {label && <label htmlFor={selectId} className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">{label}</label>}
      <select
        id={selectId}
        className={cn(
          'block w-full px-4 py-3 border rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 bg-gray-50/50 border-transparent hover:bg-gray-100/50 dark:bg-slate-950/40 dark:border-slate-800 dark:hover:bg-slate-900/40',
          error
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
            : 'text-gray-900 dark:text-slate-100 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-500/10',
          className
        )}
        {...props}
      >
        <option value="">اختر...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="dark:bg-slate-900 dark:text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[10px] text-red-600 font-bold">{error}</p>}
    </div>
  );
};

export const Input = ({ className, label, error, id, ...props }) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  return (
    <div className="space-y-2 w-full">
      {label && <label htmlFor={inputId} className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">{label}</label>}
      <input
        id={inputId}
        className={cn(
          'block w-full px-4 py-3 border rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 bg-gray-50/50 border-transparent hover:bg-gray-100/50 placeholder-gray-400 dark:bg-slate-950/40 dark:border-slate-800 dark:hover:bg-slate-900/40 dark:placeholder-slate-500',
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
            : 'text-gray-900 dark:text-slate-100 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:ring-primary-500/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-red-600 font-bold">{error}</p>}
    </div>
  );
};

export const Badge = ({ className, variant = 'neutral', children }) => {
  const variants = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-slate-850 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400',
  };

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  );
};

export const Table = ({ headers, children, className }) => {
  return (
    <div className={cn('overflow-x-auto custom-scrollbar', className)}>
      <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
        <thead className="bg-gray-50/50 dark:bg-slate-900/50">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 text-right text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/80 text-gray-750 dark:text-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

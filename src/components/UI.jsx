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

export const Card = ({ className, children, title, subtitle, footer, noPadding = false, headerAction }) => {
  return (
    <div className={cn('bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300', className)}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div>
             {title && <h3 className="text-lg font-black text-gray-800 dark:text-slate-100 tracking-tight">{title}</h3>}
             {subtitle && <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex items-center gap-2 flex-shrink-0">{headerAction}</div>}
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

export const SearchableSelect = ({ value, onChange, options = [], placeholder = 'اختر...', className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0, width: 0 });
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const selectedLabel = options.find(o => String(o.value) === String(value))?.label || '';
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  const openDropdown = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (opt) => {
    onChange({ target: { value: opt.value } });
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={openDropdown}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-right"
      >
        <span className={cn('truncate', !selectedLabel && 'text-gray-400 font-medium')}>{selectedLabel || placeholder}</span>
        <svg className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mr-2', isOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث..."
              className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100 outline-none focus:border-blue-400 font-medium"
            />
          </div>
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">لا توجد نتائج</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={() => handleSelect(opt)}
                  className={cn(
                    'w-full text-right px-4 py-2.5 text-sm font-bold transition-colors hover:bg-blue-50 hover:text-blue-700',
                    String(opt.value) === String(value) && 'bg-blue-50 text-blue-700'
                  )}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
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

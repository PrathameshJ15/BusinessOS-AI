'use client';

import React from 'react';
import { Sparkles, AlertCircle, Inbox, Loader2 } from 'lucide-react';

// 1. Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-5 py-2.5 text-sm',
  };
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-[0.98]',
    secondary: 'bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 shadow-sm active:scale-[0.98]',
    outline: 'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800',
    ghost: 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm',
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-current" />}
      {children}
    </button>
  );
};

// 2. Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full space-y-1">
    {label && <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</label>}
    <input
      className={`w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
        error ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 dark:border-zinc-700 focus:border-emerald-500'
      } ${className}`}
      {...props}
    />
    {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
  </div>
);

// 3. Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => (
  <div className="w-full space-y-1">
    {label && <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</label>}
    <select
      className={`w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// 4. Card Component
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ${className}`}>{children}</div>
);

// 5. Badge Component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'zinc';
  className?: string;
}> = ({ children, variant = 'emerald', className = '' }) => {
  const styles = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    slate: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 6. Avatar Component
export const Avatar: React.FC<{ name: string; src?: string; size?: 'sm' | 'md' | 'lg' }> = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border border-zinc-200 dark:border-zinc-700`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-zinc-900 dark:bg-zinc-800 text-white font-bold flex items-center justify-center shadow-xs`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// 7. Tabs Component
export const Tabs: React.FC<{
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}> = ({ tabs, activeTab, onChange }) => (
  <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          activeTab === tab.id
            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// 8. EmptyState Component
export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm my-4">
    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{title}</h4>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">{description}</p>
    {action}
  </div>
);

// 9. LoadingState Component
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading workspace details...' }) => (
  <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{message}</span>
  </div>
);

// 10. ErrorState Component
export const ErrorState: React.FC<{ title?: string; message: string; retry?: () => void }> = ({
  title = 'An error occurred',
  message,
  retry,
}) => (
  <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-300 space-y-3">
    <div className="flex items-center gap-2 font-bold text-xs">
      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
      <span>{title}</span>
    </div>
    <p className="text-xs text-rose-700 dark:text-rose-400">{message}</p>
    {retry && (
      <Button variant="danger" size="sm" onClick={retry}>
        Try Again
      </Button>
    )}
  </div>
);

// 11. PageHeader Component
export const PageHeader: React.FC<{ title: string; description: string; actions?: React.ReactNode }> = ({
  title,
  description,
  actions,
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight font-display">{title}</h1>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

// 12. Skeleton Loading Components
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-zinc-200 dark:bg-zinc-800/80 animate-pulse rounded-xl ${className}`} />
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-4 space-y-4 shadow-sm">
    <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 font-sans">
    <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
      <Skeleton className="h-4 w-36 bg-zinc-800" />
      <Skeleton className="h-8 w-2/3 bg-zinc-800" />
      <Skeleton className="h-4 w-1/2 bg-zinc-800" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <TableSkeleton rows={5} />
  </div>
);


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
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-[0.98]',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]',
    outline: 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
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
    {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}
    <input
      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
        error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
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
    {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}
    <select
      className={`w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// 4. Card Component
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle ${className}`}>{children}</div>
);

// 5. Badge Component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
}> = ({ children, variant = 'blue', className = '' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
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
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border border-slate-200`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shadow-xs`}>
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
  <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          activeTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-subtle my-4">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{description}</p>
    {action}
  </div>
);

// 9. LoadingState Component
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading workspace details...' }) => (
  <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    <span className="text-xs font-medium text-slate-500">{message}</span>
  </div>
);

// 10. ErrorState Component
export const ErrorState: React.FC<{ title?: string; message: string; retry?: () => void }> = ({
  title = 'An error occurred',
  message,
  retry,
}) => (
  <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
    <div className="flex items-center gap-2 font-bold text-xs">
      <AlertCircle className="w-4 h-4 text-rose-600" />
      <span>{title}</span>
    </div>
    <p className="text-xs text-rose-700">{message}</p>
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
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

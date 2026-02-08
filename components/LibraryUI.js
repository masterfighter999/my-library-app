import React from 'react';

// Card: The white container with shadow
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
    {children}
  </div>
);

// Button: Styled interactive elements
export const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, icon: Icon }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500 border border-slate-300 dark:border-slate-600",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// Badge: Status indicators
export const Badge = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800',
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${styles[variant] || styles.primary}`}>
      {children}
    </span>
  );
};
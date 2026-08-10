import React from 'react';

/**
 * Reusable Button Component
 * Provides consistent button styling with hover effects
 * 
 * Props:
 * - children: Button content/text
 * - type: Button type (button, submit, reset)
 * - onClick: Click handler function
 * - variant: Button style variant (primary, secondary)
 * - disabled: Whether button is disabled
 * - className: Additional CSS classes
 * - loading: Show loading spinner
 */
const Button = ({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  loading = false,
}) => {
  // Base styles for all buttons
  const baseStyles = 'w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform active:scale-[0.98]';
  
  // Variant-specific styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-emerald-600 to-teal-600 text-white 
      hover:from-emerald-700 hover:to-teal-700
      hover:shadow-lg hover:shadow-emerald-500/30
      active:from-emerald-800 active:to-teal-800
      focus:ring-emerald-500/30
      disabled:from-emerald-400 disabled:to-teal-400 disabled:cursor-not-allowed disabled:shadow-none
    `,
    secondary: `
      bg-white text-gray-700 border-2 border-gray-200
      hover:border-emerald-500 hover:text-emerald-600
      hover:bg-emerald-50
      active:bg-emerald-100
      focus:ring-emerald-500/20
      disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-100 disabled:cursor-not-allowed
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </span>
    </button>
  );
};

export default Button;

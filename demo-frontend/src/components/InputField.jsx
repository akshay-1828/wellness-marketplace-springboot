import React from 'react';

/**
 * Reusable Input Field Component
 * Used across Login and Register forms for consistent styling
 * 
 * Props:
 * - label: Input field label text
 * * type: Input type (text, email, password, etc.)
 * - name: Input name attribute
 * - value: Current input value
 * - onChange: Change handler function
 * - placeholder: Placeholder text
 * - error: Error message to display
 * - required: Whether field is required
 * - icon: Optional icon component
 */
const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  icon: Icon,
  readOnly = false,
}) => {
  return (
    <div className="mb-5">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-emerald-500 ml-1">*</span>}
      </label>
      
      {/* Input Container */}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        {/* Input */}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-200
            ${Icon ? 'pl-12' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-gray-300'
            }
          `}
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;

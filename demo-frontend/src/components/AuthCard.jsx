import React from 'react';

/**
 * AuthCard Component
 * Wrapper component for authentication forms
 * Provides consistent card styling with rounded corners and shadow
 * 
 * Props:
 * - children: Card content
 * - title: Card header title
 * - subtitle: Optional subtitle text
 */
const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10 px-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 mb-4">
            <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white">WellnessHub</h2>
          <p className="text-emerald-200 text-sm mt-1">Alternative Therapies Marketplace</p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 text-center mt-2 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Content Section */}
          <div className="px-8 pb-8">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-emerald-200/70 text-xs mt-6">
          © 2026 WellnessHub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthCard;

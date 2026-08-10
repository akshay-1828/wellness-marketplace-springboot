import React from "react";

const AuthBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-800 to-green-900 text-white overflow-hidden">

      {/* Pattern Layer */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
};

export default AuthBackground;

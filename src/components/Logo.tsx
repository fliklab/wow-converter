import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent hover:scale-[1.02] transition-transform">
        WowConverter
      </h1>
    </div>
  );
};

export default Logo;

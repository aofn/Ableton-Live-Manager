import React from "react";

const Index = ({ name }) => {
  return (
    <div className="fixed pointer-events-none z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md shadow-lg p-2 max-w-[200px]">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium truncate">{name}</span>
      </div>
    </div>
  );
};

export default Index;

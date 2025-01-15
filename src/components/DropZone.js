"use client";

import React, { useState } from "react";
import { readDir } from "@tauri-apps/api/fs";

const DropZone = ({ onFolderDrop }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const entry = items[i].webkitGetAsEntry();
        if (entry.isDirectory) {
          const folderPath = entry.fullPath;
          onFolderDrop(folderPath);
        }
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`drop-zone ${
        isDragging ? "dragging" : ""
      } border-2 border-dashed border-gray-300 rounded-lg p-4 text-center`}
    >
      {isDragging ? "Drop here" : "Drag and drop a folder here"}
    </div>
  );
};

export default DropZone;

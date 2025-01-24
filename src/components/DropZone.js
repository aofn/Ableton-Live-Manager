import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

const DropZone = ({ onFolderDrop }) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", async (event) => {
      console.log("Drop event triggered", event);
      const { payload } = event;
      if (payload && payload.length > 0) {
        const folderPath = payload[0];
        console.log("Directory dropped:", folderPath);
        try {
          await onFolderDrop(folderPath);
        } catch (error) {
          console.error("Error reading directory:", error);
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onFolderDrop]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
    console.log("Drag over event triggered");
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    console.log("Drag leave event triggered");
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`drop-zone ${
        isDragging ? "dragging" : ""
      } border-2 border-dashed border-gray-300 rounded-lg p-4 text-center`}
    >
      {isDragging ? "Drop here" : "Drag and drop a folder here"}
    </div>
  );
};

export default DropZone;

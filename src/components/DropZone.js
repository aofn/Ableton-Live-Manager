import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

const DropZone = ({ onFolderDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFolderName, setDraggedFolderName] = useState("");

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", async (event) => {
      console.log("Drop event triggered", event);
      const { payload } = event;
      if (payload && payload.length > 0) {
        const folderPath = payload[0];
        const folderName = folderPath.split("/").pop();
        setDraggedFolderName(folderName);
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
      className="relative w-full h-full"
    >
      <div
        className={`absolute inset-10 border-2 border-dashed border-gray-300 rounded-lg p-10 text-center flex items-center justify-center ${
          isDragging ? "dragging" : ""
        }`}
      >
        {isDragging ? "Drop here" : "Drag and drop a folder here"}
      </div>
      <Dialog open={isDragging} onOpenChange={setIsDragging}>
        <DialogOverlay />
        <DialogContent>
          <p>
            Drop the project to add <strong>{draggedFolderName}</strong> to the
            app
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DropZone;

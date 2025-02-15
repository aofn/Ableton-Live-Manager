import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { open } from "@tauri-apps/api/dialog";

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

  const readDirectory = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected !== null) {
      await onFolderDrop(selected);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8">
      <div
        onClick={readDirectory}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative aspect-video w-full min-h-[300px] cursor-pointer"
      >
        <div
          className={`absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50/30 ${
            isDragging ? "bg-gray-50/50" : ""
          }`}
        >
          <div className="text-center">
            <span className="block text-gray-500 text-lg">
              {isDragging ? "Drop here" : "Drag and drop a folder here"}
            </span>
            <span className="mt-2 block text-sm text-gray-400">
              or click to browse
            </span>
          </div>
        </div>
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

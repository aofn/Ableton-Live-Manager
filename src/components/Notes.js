import React, { useCallback, useEffect } from "react";
import Editor from "@/components/Editor/Editor";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAlmFile } from "@/components/hooks/useAlmFile";

const Notes = ({ projectDirectory }) => {
  const { almData, isLoading, updateNotes, error } =
    useAlmFile(projectDirectory);

  const handleSave = useCallback(
    async (editedNote) => {
      if (!editedNote || editedNote === almData?.notes) return;

      try {
        console.log("Saving note:", editedNote); // Debug log
        console.log("Project directory:", projectDirectory); // Debug log

        await updateNotes(editedNote);
      } catch (err) {
        console.error("Failed to save notes:", err);
      }
    },
    [almData?.notes, updateNotes, projectDirectory],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }
  // More detailed error display
  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 font-bold mb-2">Failed to load notes</div>
        <div className="text-red-400">{error.message}</div>
        <div className="mt-2 text-sm text-gray-500">
          Project Directory: {projectDirectory}
        </div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <Editor
        onSave={handleSave}
        content={almData?.notes || ""}
        disabled={isLoading}
      />
    </div>
  );
};

export default Notes;

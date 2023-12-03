"use client";

import React, { useEffect, useState } from "react";
import Editor from "@/components/Editor/Editor";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { writeTextFile } from "@tauri-apps/api/fs";

const Notes = ({ projectDirectory, projectNotesPath, almFile, setAlmFile }) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const getNotes = async () => {
      setLoading(true);
      if (almFile && almFile.notes) {
        setNotes(almFile.notes);
      }
      setLoading(false);
    };
    if (almFile && isMounted) getNotes();

    return () => {
      isMounted = false;
    };
  }, [almFile]);

  const onSave = async (editedNote) => {
    // if no changes have been made we don't want to do anything
    if (editedNote === notes) return;
    setNotes(editedNote);
    const copyAlm = { ...almFile };
    copyAlm.notes = editedNote;
    setAlmFile(copyAlm);
    await writeTextFile(
      `${projectDirectory}/alm.json`,
      JSON.stringify(copyAlm, null, 2),
    );
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Editor onSave={onSave} content={notes} />
        </>
      )}
    </>
  );
};
export default Notes;

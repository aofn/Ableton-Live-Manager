"use client";

import { useTranslation } from "react-i18next";
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
    if (projectNotesPath && isMounted) getNotes();

    return () => {
      isMounted = false;
    };
  }, [projectNotesPath, almFile]);

  const onSave = async (editedNote) => {
    // if no changes have been made we don't want to do anything
    console.log(editedNote);
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
          <Editor onSave={onSave} content={almFile.notes} />
        </>
      )}
    </>
  );
};
export default Notes;

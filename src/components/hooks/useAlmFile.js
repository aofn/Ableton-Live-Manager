import { useState, useCallback, useEffect } from "react";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import {createAppleNote} from "@/lib/appleNotes";

const DEFAULT_ALM_DATA = {
  notes: "",
  tags: {},
};

export function useAlmFile(projectPath) {
  const [almData, setAlmData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [xmpKeywords, setXmpKeywords] = useState([]);

  const readAlmFile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!projectPath) {
        throw new Error("No project path provided");
      }

      const almPath = `${projectPath}/alm.json`;
      console.log("Checking file at:", almPath);

      const fileExists = await exists(almPath);

      if (!fileExists) {
        console.log("alm.json not found, creating new file");
        await writeTextFile(almPath, JSON.stringify(DEFAULT_ALM_DATA, null, 2));
        setAlmData(DEFAULT_ALM_DATA);
        return DEFAULT_ALM_DATA;
      }

      console.log("Reading existing file from:", almPath);
      const content = await readTextFile(almPath);
      console.log("File content:", content);

      let parsed;
      try {
        parsed = JSON.parse(content);
        console.log("Parsed content:", parsed);
      } catch (parseError) {
        console.error("Failed to parse alm.json:", parseError);
        parsed = DEFAULT_ALM_DATA;
        await writeTextFile(almPath, JSON.stringify(DEFAULT_ALM_DATA, null, 2));
      }

      setAlmData(parsed);
      return parsed;
    } catch (err) {
      console.error("Error handling alm.json:", err);
      setError(err);
      return DEFAULT_ALM_DATA;
    } finally {
      setIsLoading(false);
    }
  }, [projectPath]);

  const writeAlmFile = useCallback(
    async (updates) => {
      setError(null);
      try {
        if (!projectPath) {
          throw new Error("No project path provided");
        }

        const almPath = `${projectPath}/alm.json`;
        console.log("Writing to:", almPath);

        let currentData;
        const fileExists = await exists(almPath);
        if (!fileExists) {
          currentData = DEFAULT_ALM_DATA;
        } else {
          currentData = almData || (await readAlmFile());
        }

        const newData = { ...currentData, ...updates };
        console.log("Writing data:", newData);

        await writeTextFile(almPath, JSON.stringify(newData, null, 2));
        setAlmData(newData);
        return newData;
      } catch (err) {
        console.error("Error writing alm.json:", err);
        setError(err);
        throw err;
      }
    },
    [projectPath, almData, readAlmFile],
  );

  const updateNotes = useCallback(
    async (notes) => {
      // Create a new Apple Note with the updated notes

      // extract title from path
      const pathParts = projectPath.split("/");
      const title = pathParts[pathParts.length - 1];

      await createAppleNote(title, notes);
      return writeAlmFile({ notes });
    },
    [writeAlmFile],
  );

  // Tag Management Functions
  const addTag = useCallback(
    async (tag) => {
      const currentTags = almData?.tags || {};
      const newTags = {
        ...currentTags,
        [tag.value]: tag,
      };
      return writeAlmFile({ tags: newTags });
    },
    [almData, writeAlmFile],
  );

  const removeTag = useCallback(
    async (tagKey) => {
      if (!almData?.tags) return;
      const newTags = { ...almData.tags };
      delete newTags[tagKey];
      return writeAlmFile({ tags: newTags });
    },
    [almData, writeAlmFile],
  );

  // XMP Keywords Management
  const updateXmpKeywords = useCallback((keywords) => {
    setXmpKeywords(keywords);
  }, []);

  // Initial load effects
  useEffect(() => {
    if (projectPath) {
      readAlmFile();
    }
  }, [projectPath, readAlmFile]);

  return {
    almData,
    isLoading,
    error,
    readAlmFile,
    writeAlmFile,
    updateNotes,
    addTag,
    removeTag,
    xmpKeywords,
    updateXmpKeywords,
  };
}

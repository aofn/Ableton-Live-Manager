import { useCallback, useState, useEffect } from "react";
import { writeTextFile, readTextFile, exists } from "@tauri-apps/api/fs";

const DEFAULT_ALM_DATA = {
  notes: "",
};

export function useAlmFile(projectPath) {
  const [almData, setAlmData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const readAlmFile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!projectPath) {
        throw new Error("No project path provided");
      }

      const almPath = `${projectPath}/alm.json`;
      console.log("Checking file at:", almPath); // Debug log

      // Check if file exists
      const fileExists = await exists(almPath);

      if (!fileExists) {
        console.log("alm.json not found, creating new file"); // Debug log
        await writeTextFile(almPath, JSON.stringify(DEFAULT_ALM_DATA, null, 2));
        setAlmData(DEFAULT_ALM_DATA);
        return DEFAULT_ALM_DATA;
      }

      console.log("Reading existing file from:", almPath); // Debug log
      const content = await readTextFile(almPath);
      console.log("File content:", content); // Debug log

      let parsed;
      try {
        parsed = JSON.parse(content);
        console.log("Parsed content:", parsed); // Debug log
      } catch (parseError) {
        console.error("Failed to parse alm.json:", parseError);
        parsed = DEFAULT_ALM_DATA;
        // If parsing fails, overwrite with default data
        await writeTextFile(almPath, JSON.stringify(DEFAULT_ALM_DATA, null, 2));
      }

      setAlmData(parsed);
      return parsed;
    } catch (err) {
      console.error("Error handling alm.json:", err); // Debug log
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
        console.log("Writing to:", almPath); // Debug log

        // Get current data or create new file if it doesn't exist
        let currentData;
        const fileExists = await exists(almPath);
        if (!fileExists) {
          currentData = DEFAULT_ALM_DATA;
        } else {
          currentData = almData || (await readAlmFile());
        }

        const newData = { ...currentData, ...updates };
        console.log("Writing data:", newData); // Debug log

        await writeTextFile(almPath, JSON.stringify(newData, null, 2));
        setAlmData(newData);
        return newData;
      } catch (err) {
        console.error("Error writing alm.json:", err); // Debug log
        setError(err);
        throw err;
      }
    },
    [projectPath, almData, readAlmFile],
  );

  const updateNotes = useCallback(
    async (notes) => {
      console.log("Updating notes:", notes); // Debug log
      return writeAlmFile({ notes });
    },
    [writeAlmFile],
  );

  // Add an initial load effect
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
  };
}

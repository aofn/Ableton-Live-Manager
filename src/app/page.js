"use client";

import { useEffect, useState } from "react";
import {
  BaseDirectory,
  readDir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { Progress } from "@/components/ui/progress";
import { invoke } from "@tauri-apps/api/tauri";
import { useTranslation } from "react-i18next";
import "remixicon/fonts/remixicon.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import { open } from "@tauri-apps/api/shell";
import ProjectDetails from "@/components/layout/ProjectDetails";
import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider } from "react-dnd";
import CustomDragLayer from "@/components/CustomDragLayer";
import DropZone from "@/components/DropZone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Ableton from "@/lib/Ableton";

/**
 * Displays a progress bar while scanning the project directory.
 * @param currentScanPath - The path of the current file being scanned.
 * @param currentScan - The current file being scanned.
 * @param totalScan - The total number of files to be scanned.
 * @param value - The progress value.
 * @returns {JSX.Element} - The JSX element representing the progress bar.
 *
 * @TODO use https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/fs-watch to listen for changes in root directory
 * @TODO define scope properly
 * @TODO open projects in separate tabs
 * @TODO create single component for dialogs scattered across the app
 */

function ProgressBar({ currentScanPath, currentScan, totalScan, value }) {
  return (
    <div className={"flex flex-col h-screen justify-center items-center"}>
      <div className="text-center"> {currentScanPath}</div>
      <Progress value={value} className="w-[50%] text-center" />
      <span>
        {currentScan}/{totalScan}
      </span>
    </div>
  );
}
export default function Home() {
  const [directoryEntries, setDirectoryEntries] = useState([]);
  const [currentScan, setCurrentScan] = useState(0);
  const [totalScan, setTotalScan] = useState(0);
  const [progressTotal, setProgressTotal] = useState(10);
  const [currentScanPath, setCurrentScanPath] = useState("");
  const [displayProgress, setDisplayProgress] = useState(false);
  const [config, setConfig] = useState({});
  const [folders, setFolders] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [xmpKeywords, setXmpKeywords] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [almData, setAlmData] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [showAlreadyAddedDialog, setShowAlreadyAddedDialog] = useState(false);
  const [pendingFolder, setPendingFolder] = useState(null);

  const { t } = useTranslation();

  useEffect(() => {
    setFolders(config?.directories);
  }, [config]);

  useEffect(() => {
    let isMounted = true;

    if (!folders || folders.length === 0) return;

    const processEntries = async () => {
      setDisplayProgress(true);
      setTotalScan(folders.length);

      const copyOfFolders = [...folders].filter(
        (entry) => typeof entry === "object",
      );

      for (let [i, entry] of copyOfFolders.entries()) {
        if (!entry.path) continue;

        setCurrentScan(i);
        const percentage = (i / folders.length) * 100;
        setProgressTotal(parseInt(percentage));

        try {
          await invoke("is_file", { path: entry.path });
        } catch {
          copyOfFolders.splice(i, 1);
          continue;
        }

        const fetchXmpKeywords = async () => {
          const keywords = await Ableton.parseXmpFiles(entry.path);
          // Add XMP keywords to allTags
          if (keywords.length > 0) {
            entry.xmpKeywords = keywords;
          }
        };

        await fetchXmpKeywords();

        if (entry.children) {
          for (let [j, child] of entry.children.entries()) {
            try {
              // const isFile = await invoke("is_file", { path: child.path });
            } catch {
              entry.children.splice(j, 1);
            }

            if (child.path.endsWith("alm.json")) {
              const almFile = await readTextFile(child.path);
              entry.alm = JSON.parse(almFile);
              setAlmData((prevAlmData) => ({
                ...prevAlmData,
                [child.path]: entry.alm,
              }));
            }

            if (child.path.endsWith(".als")) {
              setCurrentScanPath(child.name);
            }
          }
        }
      }
      setDisplayProgress(false);
      if (isMounted) {
        setDirectoryEntries(copyOfFolders);
        setDisplayProgress(false);
      }
    };

    processEntries();

    return () => {
      isMounted = false;
    };
  }, [folders, config]);

  useEffect(() => {
    const getConfig = async () => {
      const configFile = await readTextFile("config.json", {
        dir: BaseDirectory.Data,
      });

      if (configFile) {
        const configJson = JSON.parse(configFile);
        setConfig(configJson);
      }
    };

    getConfig();
  }, []);

  const handleAddingFolder = async (folderPaths) => {
    const foldersToAdd = Array.isArray(folderPaths)
      ? folderPaths
      : [folderPaths];

    for (const folderPath of foldersToAdd) {
      const folder = await readDir(folderPath, {
        recursive: true,
      });

      const folderObject = {
        name: folderPath.split("/").pop(),
        path: folderPath,
        children: folder.map((entry) => ({
          name: entry.name,
          path: entry.path,
        })),
      };

      const containsAlsFile = folder.some((entry) =>
        entry.path.endsWith(".als"),
      );

      if (config.directories?.some((dir) => dir.path === folderPath)) {
        setShowAlreadyAddedDialog(true);
        continue;
      }

      if (!containsAlsFile) {
        setPendingFolder(folderObject);
        setShowDialog(true);
        continue;
      }

      addFolderToConfig(folderObject);
    }
  };

  const addFolderToConfig = async (folderObject) => {
    const copyConfig = { ...config };
    if (!copyConfig.directories) {
      copyConfig.directories = [];
    }
    copyConfig.directories.push(folderObject);
    setConfig(copyConfig);

    await writeTextFile(`config.json`, JSON.stringify(copyConfig, null, 2), {
      dir: BaseDirectory.Data,
    });
  };

  const handleConfirmAddFolder = () => {
    if (pendingFolder) {
      addFolderToConfig(pendingFolder);
      setPendingFolder(null);
    }
    setShowDialog(false);
  };

  const handleCancelAddFolder = () => {
    setPendingFolder(null);
    setShowDialog(false);
  };

  const handleDeleteProject = async (projectPath) => {
    const updatedDirectories = config.directories.filter(
      (entry) => entry.path !== projectPath.path,
    );

    const updatedConfig = {
      ...config,
      directories: updatedDirectories,
    };

    await writeTextFile("config.json", JSON.stringify(updatedConfig), {
      dir: BaseDirectory.Data,
    });

    setConfig(updatedConfig);
    setDirectoryEntries(updatedDirectories);

    if (selectedProject.path === projectPath.path) {
      setSelectedProject("");
    }
  };

  const handleSideBarClick = (project) => {
    setSelectedProject(project);
    setOpenDetails(false);
  };

  const writeAlmFile = async (path, data) => {
    await writeTextFile(path, JSON.stringify(data, null, 2));
    setAlmData((prevAlmData) => ({
      ...prevAlmData,
      [path]: data,
    }));
  };

  if (displayProgress)
    return (
      <ProgressBar
        currentScanPath={currentScanPath}
        value={progressTotal}
        currentScan={currentScan}
        totalScan={totalScan}
      />
    );
  return (
    <DndProvider
      backend={TouchBackend}
      options={{
        enableMouseEvents: true,
      }}
    >
      <CustomDragLayer />
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar
            projects={directoryEntries}
            onClick={handleSideBarClick}
            selectedProjectPath={selectedProject.path}
            handleDelete={handleDeleteProject}
            config={config}
            setConfig={setConfig}
            handleAddingFolder={handleAddingFolder}
          />
          <main className="flex-1 flex flex-col h-full">
            {selectedProject ? (
              <ProjectDetails
                selectedProject={selectedProject}
                open={open}
                t={t}
                config={config}
                setConfig={setConfig}
                xmpKeywords={xmpKeywords}
                setXmpKeywords={setXmpKeywords}
                openDetails={openDetails}
                setOpenDetails={setOpenDetails}
                almData={almData}
                writeAlmFile={writeAlmFile}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <DropZone onFolderDrop={handleAddingFolder} />
              </div>
            )}
          </main>
        </div>
      </SidebarProvider>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("Folder does not contain an Ableton project file")}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <Alert variant="destructive">
              <AlertDescription>
                {t(
                  "The folder you are trying to add does not contain any .als files. Are you sure you want to add it?",
                )}
              </AlertDescription>
            </Alert>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleCancelAddFolder}>
                {t("Cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAddFolder}
                className="ml-2"
              >
                {t("Add Folder")}
              </Button>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showAlreadyAddedDialog}
        onOpenChange={setShowAlreadyAddedDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Folder already added")}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <Alert>
              <AlertDescription>
                {t("The folder you are trying to add is already in the list.")}
              </AlertDescription>
            </Alert>
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                onClick={() => setShowAlreadyAddedDialog(false)}
              >
                {t("OK")}
              </Button>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}

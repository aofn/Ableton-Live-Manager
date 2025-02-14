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
import { cn } from "@/lib/utils";
import { badgeVariants } from "@/components/ui/badge";
import "remixicon/fonts/remixicon.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { open } from "@tauri-apps/api/shell";
import ProjectDetails from "@/components/ProjectDetails";
import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider } from "react-dnd";
import CustomDragLayer from "@/components/CustomDragLayer";

/**
 * Displays a progress bar while scanning the project directory.
 * @param currentScanPath - The path of the current file being scanned.
 * @param currentScan - The current file being scanned.
 * @param totalScan - The total number of files to be scanned.
 * @param value - The progress value.
 * @returns {JSX.Element} - The JSX element representing the progress bar.
 *
 * @TODO navigate through nested projects
 * @TODO use https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/fs-watch to listen for changes in root directory
 * @TODO define scope properly
 * @TODO open projects in separate tabs
 * @TODO fix dark mode
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
  const [filterInput, setFilterInput] = useState("");
  const [currentScan, setCurrentScan] = useState(0);
  const [totalScan, setTotalScan] = useState(0);
  const [progressTotal, setProgressTotal] = useState(10);
  const [currentScanPath, setCurrentScanPath] = useState("");
  const [displayProgress, setDisplayProgress] = useState(false);
  const [config, setConfig] = useState({});
  const [filterByTags, setFilterByTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [xmpKeywords, setXmpKeywords] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [almData, setAlmData] = useState({});

  const { t } = useTranslation();
  const colourStyles = {
    option: (styles) => ({
      ...styles,
      backgroundColor: "black",
      color: "blue",
    }),
    control: (styles) => ({
      ...styles,
      borderRadius: "0px",
      borderWidth: "1px !important",
    }),
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color:
        data.variant === "default" || data.variant === "destructive"
          ? "white"
          : "black",
    }),
  };

  const reactSelectClassNames = {
    multiValueLabel: (state) => {
      return cn(
        badgeVariants({ variant: state.data.variant }),
        "text-background !important",
      );
    },
    multiValueRemove: (state) => {
      return cn(badgeVariants({ variant: state.data.variant }));
    },
  };

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

  const handleAddingFolder = async (folderPath) => {
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
    if (selectedProject.path === projectPath.path) {
      setSelectedProject("");
    }
    setConfig(updatedConfig);
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
    <>
      <DndProvider
        backend={TouchBackend}
        options={{
          enableMouseEvents: true,
        }}
      >
        <CustomDragLayer />
        <SidebarProvider>
          <AppSidebar
            projects={directoryEntries}
            onClick={handleSideBarClick}
            selectedProjectPath={selectedProject.path}
            handleDelete={handleDeleteProject}
            filterInput={filterInput}
            config={config}
            setConfig={setConfig}
            handleAddingFolder={handleAddingFolder}
          />
          <main className="w-full">
            {selectedProject && (
              <ProjectDetails
                selectedProject={selectedProject}
                open={open}
                t={t}
                config={config}
                setConfig={setConfig}
                setFilterByTags={setFilterByTags}
                xmpKeywords={xmpKeywords}
                setXmpKeywords={setXmpKeywords}
                openDetails={openDetails}
                setOpenDetails={setOpenDetails}
                almData={almData}
                writeAlmFile={writeAlmFile}
              />
            )}
          </main>
        </SidebarProvider>
      </DndProvider>
    </>
  );
}

"use client";

import ProjectItem from "@/components/ProjectItem";
import { useEffect, useState } from "react";
import Settings from "@/components/Settings";
import { BaseDirectory, readDir, readTextFile } from "@tauri-apps/api/fs";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Separator } from "@radix-ui/react-menubar";
import { Progress } from "@/components/ui/progress";
import Select from "react-select";
import { invoke } from "@tauri-apps/api/tauri";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { badgeVariants } from "@/components/ui/badge";
import "remixicon/fonts/remixicon.css";

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
  const [projectDirectory, setProjectDirectory] = useState("");
  const [directoryEntries, setDirectoryEntries] = useState([]);
  const [filterInput, setFilterInput] = useState("");
  const [currentScan, setCurrentScan] = useState(0);
  const [totalScan, setTotalScan] = useState(0);
  const [progressTotal, setProgressTotal] = useState(10);
  const [currentScanPath, setCurrentScanPath] = useState("");
  const [displayProgress, setDisplayProgress] = useState(false);
  const [config, setConfig] = useState({});
  const [filterByTags, setFilterByTags] = useState([]);
  const [collapseAll, setCollapseAll] = useState(true);
  const { t } = useTranslation();
  const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
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
    // option: ({ isDisabled, isFocused, isSelected }) => "bg-background",
  };

  useEffect(() => {
    setProjectDirectory(config?.directoryPath);
  }, [config]);

  useEffect(() => {
    let isMounted = true;
    const processEntries = async (path) => {
      const entries = await readDir(path, { directory: true, recursive: true });
      setDisplayProgress(true);
      setTotalScan(entries.length);
      for (let [i, entry] of entries.entries()) {
        setCurrentScan(i);
        const percentage = (i / entries.length) * 100;
        setProgressTotal(parseInt(percentage));
        // console.log(entry.path)
        try {
          await invoke("is_file", { path: entry.path });
        } catch {
          entries.splice(i, 1);
          continue;
        }

        if (entry.children) {
          for (let [i, child] of entry.children.entries()) {
            const isFile = await invoke("is_file", { path: child.path }).catch(
              () => {
                entry.children.splice(i, 1);
              },
            );

            if (child.path.endsWith(".als")) {
              setCurrentScanPath(child.name);
            }
          }
        }
      }
      setDirectoryEntries(entries);
      setDisplayProgress(false);
    };

    if (projectDirectory && isMounted) {
      processEntries(projectDirectory);
    }

    return () => {
      isMounted = false;
    };
  }, [projectDirectory]);

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
      <header
        className={"w-full flex justify-between sticky top-0 bg-background"}
      >
        <NavigationMenu>
          <Separator />
          <Settings
            projectDirectory={projectDirectory}
            setProjectDirectory={setProjectDirectory}
            setConfig={setConfig}
            config={config}
          />
        </NavigationMenu>
        <div className="items-end flex justify-items-center items-center py-2 z-50">
          <Input
            onChange={(e) => setFilterInput(e.target.value)}
            value={filterInput}
            className="w-50 m-1"
            type="search"
            placeholder="Filter"
          />
          <Select
            onChange={setFilterByTags}
            value={filterByTags}
            className="my-react-select-container rounded-none border-0 basic-multi-select m-1 min-w-[180px] w-200"
            classNames={reactSelectClassNames}
            classNamePrefix="my-react-select"
            styles={colourStyles}
            isMulti
            placeholder={t("Filter by tag")}
            options={config.tags ? Object.values(config.tags) : []}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  onClick={() => setCollapseAll((prevState) => !prevState)}
                >
                  <EyeClosedIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("Collapse all")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ThemeToggle />
        </div>
      </header>
      <main>
        {directoryEntries.length > 0 &&
          directoryEntries
            .filter((entry) =>
              entry.name.toLowerCase().includes(filterInput.toLowerCase()),
            )
            .map((entry) => {
              return (
                <ProjectItem
                  key={entry.path}
                  projectDirectory={projectDirectory}
                  project={entry}
                  config={config}
                  setConfig={setConfig}
                  setProjectDirectory={setProjectDirectory}
                  filterByTags={filterByTags}
                  setFilterByTags={setFilterByTags}
                  collapseAll={collapseAll}
                />
              );
            })}
      </main>
    </>
  );
}

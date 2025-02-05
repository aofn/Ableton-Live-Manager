"use client";

import ProjectItem from "@/components/ProjectItem";
import { useEffect, useState } from "react";
import Settings from "@/components/Settings";
import {
  BaseDirectory,
  readDir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
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
import _ from "lodash";
import DropZone from "@/components/DropZone";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

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
  const [sortMethod, setSortMethod] = useState([]);
  const [folders, setFolders] = useState([]);
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
    // option: ({ isDisabled, isFocused, isSelected }) => "bg-background",
  };

  useEffect(() => {
    // setProjectDirectory(config?.directoryPath);
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

        // const entries = await readDir(entry.path, {
        //   directory: true,
        //   recursive: true,
        // });

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

  // sort function to sort directoryEntries by tags within alm.tags key if alm key exists
  const sortByTags = (a, b) => {
    const aTags = a.alm?.tags ? Object.values(a.alm.tags) : [];
    const bTags = b.alm?.tags ? Object.values(b.alm.tags) : [];

    const sortedATags = _.sortBy(aTags, ["value", "label"]);
    const sortedBTags = _.sortBy(bTags, ["value", "label"]);

    const aTagsString = sortedATags.map((tag) => tag.value).join("");
    const bTagsString = sortedBTags.map((tag) => tag.value).join("");

    // * -1 reverses order so tags are on top of list
    return aTagsString.localeCompare(bTagsString) * -1;
  };

  const handleDeleteProject = async (projectPath) => {
    // Update the directoryEntries state
    console.log(folders);
    console.log(projectPath);
    setFolders((prevEntries) =>
      prevEntries.filter((entry) => entry.path !== projectPath.path),
    );

    // Update the config state
    const updatedConfig = {
      ...config,
      directories: config.directories.filter(
        (dir) => dir.path !== projectPath.path,
      ),
    };

    await writeTextFile("config.json", JSON.stringify(updatedConfig), {
      dir: BaseDirectory.Data,
    });

    setConfig(updatedConfig);
  };

  // sort projects by name
  const sortByName = (a, b) => {
    return _.sortBy([a, b], ["name"]);
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
      <SidebarProvider>
        <AppSidebar projects={directoryEntries} />
        <main>
          <SidebarTrigger>
            <Button>Toggle Sidebar</Button>
          </SidebarTrigger>
        </main>

        {/*<header*/}
        {/*  className={"w-full flex justify-between sticky top-0 bg-background"}*/}
        {/*>*/}
        {/*  <NavigationMenu>*/}
        {/*    <Separator />*/}
        {/*    <Settings*/}
        {/*      projectDirectory={projectDirectory}*/}
        {/*      setProjectDirectory={setProjectDirectory}*/}
        {/*      setConfig={setConfig}*/}
        {/*      config={config}*/}
        {/*      handleAddingFolder={handleAddingFolder}*/}
        {/*    />*/}
        {/*  </NavigationMenu>*/}
        {/*  <div className="flex justify-items-center items-center py-2 z-50">*/}
        {/*    <Input*/}
        {/*      onChange={(e) => setFilterInput(e.target.value)}*/}
        {/*      value={filterInput}*/}
        {/*      className="w-50 m-1"*/}
        {/*      type="search"*/}
        {/*      placeholder="Filter"*/}
        {/*    />*/}
        {/*    <Select*/}
        {/*      onChange={setFilterByTags}*/}
        {/*      value={filterByTags}*/}
        {/*      className="my-react-select-container rounded-none border-0 basic-multi-select m-1 min-w-[180px] w-200"*/}
        {/*      classNames={reactSelectClassNames}*/}
        {/*      classNamePrefix="my-react-select"*/}
        {/*      styles={colourStyles}*/}
        {/*      isMulti*/}
        {/*      placeholder={t("Filter by tag")}*/}
        {/*      options={config.tags ? Object.values(config.tags) : []}*/}
        {/*    />*/}
        {/*    <Select*/}
        {/*      onChange={setSortMethod}*/}
        {/*      value={sortMethod}*/}
        {/*      className="my-react-select-container rounded-none border-0 basic-multi-select m-1 min-w-[180px] w-200"*/}
        {/*      classNames={reactSelectClassNames}*/}
        {/*      classNamePrefix="my-react-select"*/}
        {/*      styles={colourStyles}*/}
        {/*      placeholder={t("Sort by")}*/}
        {/*      options={[*/}
        {/*        { value: "name", label: "Name" },*/}
        {/*        { value: "tags", label: "Tags" },*/}
        {/*      ]}*/}
        {/*    />*/}
        {/*    <TooltipProvider>*/}
        {/*      <Tooltip>*/}
        {/*        <TooltipTrigger>*/}
        {/*          <Button*/}
        {/*            variant="outline"*/}
        {/*            onClick={() => setCollapseAll((prevState) => !prevState)}*/}
        {/*          >*/}
        {/*            <EyeClosedIcon />*/}
        {/*          </Button>*/}
        {/*        </TooltipTrigger>*/}
        {/*        <TooltipContent>{t("Collapse all")}</TooltipContent>*/}
        {/*      </Tooltip>*/}
        {/*    </TooltipProvider>*/}
        {/*    <ThemeToggle />*/}
        {/*  </div>*/}
        {/*</header>*/}
        <main>
          {directoryEntries.length > 0 &&
            directoryEntries
              .filter((entry) =>
                entry.name.toLowerCase().includes(filterInput.toLowerCase()),
              )
              .sort(sortMethod.value === "name" ? sortByName : sortByTags)
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
                    onDelete={handleDeleteProject}
                  />
                );
              })}
          <DropZone onFolderDrop={handleAddingFolder} />
        </main>
      </SidebarProvider>
    </>
  );
}

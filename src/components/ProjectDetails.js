import React from "react";
import { CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { Tags } from "@/components/Tags";
import FolderView from "@/components/FolderView";
import { RightColumn } from "@/components/RightColumn";
import { open } from "@tauri-apps/api/shell";

const ProjectDetails = ({
  selectedProject,
  open,
  t,
  config,
  setConfig,
  setFilterByTags,
  xmpKeywords,
  setXmpKeywords,
  openDetails,
  setOpenDetails,
}) => {
  const handleOpenProject = async (path) => {
    if (path.endsWith(".als")) setOpenDetails(path);
    else await open(path);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 w-full bg-background border-b">
        <div className="flex flex-col gap-1 py-4 px-4">
          <h1 className="text-xl font-semibold tracking-tight">
            {selectedProject.name}
          </h1>
          <CardDescription
            className="group cursor-pointer text-sm hover:text-foreground/80 transition-colors"
            onClick={() => open(selectedProject.path)}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex items-center gap-1.5">
                    <span className="truncate">{selectedProject.path}</span>
                    <OpenInNewWindowIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("open path")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardDescription>
        </div>
      </header>

      <section className="py-6 px-4">
        <Tags
          tags={selectedProject.alm}
          name={selectedProject.name}
          almFile={selectedProject.alm}
          projectDirectory={selectedProject.path}
          config={config}
          setConfig={setConfig}
          setFilterByTags={setFilterByTags}
          xmpKeywords={xmpKeywords}
          setXmpKeywords={setXmpKeywords}
        />
      </section>

      <Separator className="mb-6" />

      <section className="flex-1 pb-6">
        <div className="grid grid-cols-2 h-[calc(100vh-16rem)] min-h-[400px]">
          <FolderView
            project={selectedProject}
            almFile={selectedProject.alm}
            handleOpenProject={handleOpenProject}
          />
          <div className="flex">
            <Separator orientation="vertical" className="mx-6" />
            <RightColumn
              openDetails={openDetails}
              name={selectedProject.name}
              almFile={selectedProject.alm}
              setAlmFile={() => console.log("setAlmFile")}
              projectDirectory={selectedProject.path}
              setOpenDetails={setOpenDetails}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetails;

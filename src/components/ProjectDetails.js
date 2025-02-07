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
    <>
      <header
        className={"w-full flex justify-between sticky top-0 bg-background"}
      >
        <div className="flex justify-items-center items-center py-2 z-50">
          <h1>{selectedProject.name}</h1>
        </div>
      </header>
      <section className="p-3 w-full flex flex-row">
        <section className="w-1/2">
          <CardDescription
            className="cursor-pointer text-xs"
            onClick={() => open(selectedProject.path)}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex justify-center hover:underline">
                    {selectedProject.path}
                    <OpenInNewWindowIcon className="self-center ml-1" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("open path")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardDescription>
        </section>
        <Separator orientation="vertical" />
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
      <Separator />
      <section className="grid grid-cols-2 h-[40vh] min-h-[400px]">
        <FolderView
          project={selectedProject}
          almFile={selectedProject.alm}
          handleOpenProject={handleOpenProject}
        />
        <RightColumn
          openDetails={openDetails}
          name={selectedProject.name}
          almFile={selectedProject.alm}
          setAlmFile={() => console.log("setAlmFile")}
          projectDirectory={selectedProject.path}
          setOpenDetails={setOpenDetails}
        />
      </section>
    </>
  );
};

export default ProjectDetails;

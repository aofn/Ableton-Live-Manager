"use client";

import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/shell";
import { CardDescription } from "@/components/ui/card";

import { useTranslation } from "react-i18next";

import { Separator } from "@/components/ui/separator";
import FolderView from "@/components/FolderView";
import { Tags } from "@/components/Tags";
import { RightColumn } from "@/components/RightColumn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionHeader } from "@radix-ui/react-accordion";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";

/**
 * React component representing a project item in the project directory.
 * @param project - The object containing the project data.
 * @param filterByTags  - The tags to filter by.
 * @param config  - The config object.
 * @param setConfig - The config setter function.
 * @param setProjectDirectory - The projectDirectory setter function.
 * @param setFilterByTags - The filterByTags setter function.
 * @param collapseAll - The collapseAll state.
 */

export default function ProjectItem({
  project,
  filterByTags,
  config,
  setConfig,
  setFilterByTags,
  collapseAll,
}) {
  const [openDetails, setOpenDetails] = useState(false);
  const { t } = useTranslation();
  const [almFile, setAlmFile] = useState({});
  const [isAccordionOpen, setIsAccordionOpen] = useState("open");

  useEffect(() => {
    setIsAccordionOpen("close");
  }, [collapseAll]);

  useEffect(() => {
    if (project) {
      setAlmFile(project.alm);
    }
  }, [project]);

  const handleOpenProject = async (path) => {
    if (path.endsWith(".als")) setOpenDetails(path);
    else await open(path);
  };
  const handleAccordion = (name) => {
    setIsAccordionOpen((prevState) => {
      if (prevState === name) return "close";
      else return name;
    });
  };

  //@TODO use allPlugins

  // if filteredByTags is active and a project doesn't have any tags return early
  if (filterByTags.length > 0 && !almFile?.tags) return;

  // if filteredByTags is active and a project doesn't contain the tag to filter by, return early
  if (
    filterByTags.length > 0 &&
    almFile?.tags &&
    !Object.values(almFile.tags).some((tag) =>
      filterByTags.some((obj) => JSON.stringify(obj) === JSON.stringify(tag)),
    )
  )
    return;

  return (
    <Accordion
      type="single"
      collapsible
      value={isAccordionOpen}
      onValueChange={handleAccordion}
    >
      <AccordionItem value={project.name}>
        <section className="p-3 w-full flex flex-row">
          <section className="w-1/2">
            <AccordionHeader
              onClick={() => handleAccordion(project.name)}
              className="cursor-pointer mr-2 py-1"
            >
              {project.name}
            </AccordionHeader>
            <CardDescription
              className="cursor-pointer text-xs"
              onClick={() => open(project.path)}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex justify-center hover:underline">
                      {project.path}
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
            tags={almFile && almFile[project.name]?.tags}
            name={project.name}
            almFile={almFile}
            setAlmFile={setAlmFile}
            projectDirectory={project.path}
            config={config}
            setConfig={setConfig}
            setFilterByTags={setFilterByTags}
          />
          <section className="flex ml-auto">
            <Separator orientation="vertical" />
            <AccordionTrigger
              className="w-20 justify-center"
              onClick={handleAccordion}
            ></AccordionTrigger>
          </section>
        </section>

        <AccordionContent>
          <Separator />
          <section className="grid grid-cols-2 h-[40vh] min-h-[400px]">
            <FolderView
              project={project}
              almFile={almFile}
              handleOpenProject={handleOpenProject}
            />
            <RightColumn
              openDetails={openDetails}
              name={project.name}
              almFile={almFile}
              setAlmFile={setAlmFile}
              projectDirectory={project.path}
              setOpenDetails={setOpenDetails}
            />
          </section>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

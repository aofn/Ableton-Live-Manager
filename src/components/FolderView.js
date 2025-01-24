"use client";

import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

/**
 * Displays the contents of a project folder, including subprojects and files.
 * @component
 * @param {Object} project - The project object containing children.
 * @param {Function} handleOpenProject - Callback function to open a project.
 * @param {Object} almFile - The APM file associated with the project.
 * @returns {JSX.Element} - The JSX element representing the folder view.
 */
const FolderView = ({ project, handleOpenProject, almFile }) => {
  return (
    <Table>
      <TableBody id="scrollable" className="overflow-y-auto h-full">
        {project.children?.map((child) => {
          if (
            child.name === "Icon\r" ||
            child.name.endsWith(".md") ||
            child.name.endsWith(".json")
          ) {
            return null;
          }

          return (
            <DisplayProjectContents
              name={child.name}
              path={child.path}
              almFile={almFile}
              key={child.path}
              handleOpenProject={handleOpenProject}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};
export default FolderView;

/**
 * Displays the contents of a project file within a table row.
 * @component
 * @param {string} name - The name of the project file.
 * @param {string} path - The path to the project file.
 * @param {Function} handleOpenProject - Callback function to open a project.
 * @param {Object} almFile - The APM file associated with the project.
 * @returns {JSX.Element} - The JSX element representing the project file details.
 */
const DisplayProjectContents = ({ name, path, handleOpenProject, almFile }) => {
  const { t } = useTranslation();

  const onOpen = React.useCallback(async () => {
    const { shell } = await import("@tauri-apps/api");

    await shell.open(path);
  }, [path]);

  return (
    <TableRow className="w-full flex flex-row px-3">
      <TableCell className="flex items-center w-full">
        <Button
          variant="link"
          className="px-0"
          onClick={() => handleOpenProject(path)}
        >
          {name}
        </Button>
        {almFile && almFile[name]?.bpm && (
          <span className="text-sm text-muted-foreground px-1">
            {almFile[name].bpm} BPM
          </span>
        )}
        {name.endsWith(".als") && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="ml-auto">
                <img
                  onClick={() => onOpen(path)}
                  height="20em"
                  width="20em"
                  src="/live_9_project_icon.png"
                  alt="Ableton Live icon"
                />
              </TooltipTrigger>
              <TooltipContent>{t("Open in Ableton")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};

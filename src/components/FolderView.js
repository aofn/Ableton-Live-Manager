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

const FolderView = ({ project, handleOpenProject, almFile }) => {
  return (
    <div className="pr-6">
      <Table>
        <TableBody
          id="scrollable"
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 20rem)" }}
        >
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
    </div>
  );
};

const DisplayProjectContents = ({ name, path, handleOpenProject, almFile }) => {
  const { t } = useTranslation();

  const onOpen = React.useCallback(async () => {
    const { shell } = await import("@tauri-apps/api");
    await shell.open(path);
  }, [path]);

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="flex items-center justify-between py-2 px-4">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            className="h-8 px-2 hover:bg-transparent hover:underline"
            onClick={() => handleOpenProject(path)}
          >
            {name}
          </Button>
          {almFile && almFile[name]?.bpm && (
            <span className="text-sm text-muted-foreground rounded-md bg-muted px-2 py-0.5">
              {almFile[name].bpm} BPM
            </span>
          )}
        </div>
        {name.endsWith(".als") && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() => onOpen(path)}
                  className="rounded-md p-1 hover:bg-muted transition-colors"
                >
                  <img
                    className="h-5 w-5"
                    src="/live_9_project_icon.png"
                    alt="Ableton Live icon"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t("Open in Ableton")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
};

export default FolderView;

"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { writeTextFile } from "@tauri-apps/api/fs";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddTagDialogue from "@/components/AddTagDialogue";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Ableton from "@/lib/Ableton";

export const Tags = ({
  setAlmFile,
  almFile,
  projectDirectory,
  config,
  setConfig,
  setFilterByTags,
  xmpKeywords,
  setXmpKeywords,
}) => {
  const availableTags = config.tags;
  const { t } = useTranslation();
  const copyAlmFile = { ...almFile };

  useEffect(() => {
    const fetchXmpKeywords = async () => {
      const keywords = await Ableton.parseXmpFiles(projectDirectory);
      setXmpKeywords(keywords);
    };

    fetchXmpKeywords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDirectory]);

  const writeTagToAlmFile = async (tag) => {
    function addOrUpdateObjectWithTag(mainObject, addObject, key) {
      if (!Object.prototype.hasOwnProperty.call(mainObject, key)) {
        mainObject[key] = {};
      }
      if (!Object.prototype.hasOwnProperty.call(mainObject, key)) {
        mainObject[key] = addObject;
      } else {
        mainObject[key] = { ...mainObject[key], ...addObject };
      }
    }

    addOrUpdateObjectWithTag(copyAlmFile, tag, "tags");

    setAlmFile(copyAlmFile);
    return writeTextFile(
      `${projectDirectory}/alm.json`,
      JSON.stringify(copyAlmFile, null, 2),
    );
  };

  const removeTag = async (key) => {
    const copyAlmFile = { ...almFile };
    delete almFile.tags[key];
    await writeTextFile(
      `${projectDirectory}/alm.json`,
      JSON.stringify(copyAlmFile, null, 2),
    );
    setAlmFile(copyAlmFile);
  };

  return (
    <div className="flex flex-row">
      {almFile?.tags &&
        Object.entries(almFile.tags).map(([key, tag]) => (
          <div key={tag.value} className="flex flex-row box-border m-0.5 h-6">
            <Badge
              title={`Filter by ${tag.label}`}
              key={tag.value}
              variant={tag.variant}
              className="px-1 focus-visible:outline-none"
              onClick={() =>
                setFilterByTags((prevState) => [...prevState, tag])
              }
            >
              {tag.label}
            </Badge>
            <span
              title={`Remove ${tag.label} tag`}
              className={cn(
                badgeVariants({ variant: tag.variant }),
                "px-0 box-border border",
              )}
              onClick={() => removeTag(key)}
            >
              <Cross2Icon />
            </span>
          </div>
        ))}
      {xmpKeywords.map((tagObj, index) => {
        const tag = Object.values(tagObj)[0];
        return (
          <Badge
            key={index}
            variant="outline"
            className="px-1 m-0.5 h-6"
            onClick={() => setFilterByTags((prevState) => [...prevState, tag])}
          >
            <span className="text-muted-foreground pr-1">{tag.group}</span>
            <span>{tag.label}</span>
          </Badge>
        );
      })}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-fit">
          <div className="flex flex-row box-border m-0.5 h-6">
            <Badge
              title={t("add tag")}
              variant="outline"
              className="py-0.5 focus-visible:outline-none px-2 h-6"
            >
              <PlusIcon />
            </Badge>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableTags &&
            Object.entries(availableTags).map(([key, tag]) => (
              <DropdownMenuItem
                onClick={() => writeTagToAlmFile({ [key]: tag })}
                key={key}
              >
                {tag.label}
              </DropdownMenuItem>
            ))}
          <AddTagDialogue setConfig={setConfig} config={config} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

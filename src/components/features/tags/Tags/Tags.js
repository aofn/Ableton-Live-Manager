"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AddTagDialogue from "@/components/features/tags/AddTagDialogue";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Ableton from "@/lib/Ableton";
import { useAlmFile } from "@/components/hooks/useAlmFile";

export const Tags = ({
  projectDirectory,
  config,
  setConfig,
  setFilterByTags,
}) => {
  const { t } = useTranslation();
  const { almData, addTag, removeTag, xmpKeywords, updateXmpKeywords } =
    useAlmFile(projectDirectory);
  const availableTags = config.tags;

  useEffect(() => {
    const fetchXmpKeywords = async () => {
      const keywords = await Ableton.parseXmpFiles(projectDirectory);
      updateXmpKeywords(keywords);
    };

    fetchXmpKeywords();
  }, [projectDirectory, updateXmpKeywords]);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row flex-wrap gap-1">
        {almData?.tags &&
          Object.entries(almData.tags).map(([key, tag]) => (
            <div key={tag.value} className="flex flex-row box-border h-6">
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
                  "px-0 box-border border cursor-pointer",
                )}
                onClick={() => removeTag(key)}
              >
                <Cross2Icon />
              </span>
            </div>
          ))}

        {/* XMP Keywords */}
        {xmpKeywords.map((tagObj, index) => {
          const tag = Object.values(tagObj)[0];
          return (
            <Badge
              key={index}
              title={`Filter by ${tag.label}`}
              variant={tag.variant}
              className="px-1 h-6"
              onClick={() =>
                setFilterByTags((prevState) => [...prevState, tag])
              }
            >
              {tag.label}
            </Badge>
          );
        })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t("Add Tag")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableTags &&
            Object.entries(availableTags).map(([key, tag]) => (
              <DropdownMenuItem key={key} onSelect={() => addTag(tag)}>
                <Badge variant={tag.variant}>{tag.label}</Badge>
              </DropdownMenuItem>
            ))}
          <AddTagDialogue config={config} setConfig={setConfig} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

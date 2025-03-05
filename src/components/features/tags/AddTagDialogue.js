"use client";
{
  /* eslint-disable no-prototype-builtins */
}
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { BaseDirectory, writeTextFile } from "@tauri-apps/plugin-fs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AddTagDialogue({ config, setConfig }) {
  const { t } = useTranslation();
  const [style, setStyle] = useState("default");
  const [tagName, setTagName] = useState("");

  const writeTagToConfig = async () => {
    const copyConfig = { ...config };

    function addOrUpdateObjectWithTag(mainObject, tag, style) {
      if (!mainObject.tags) {
        mainObject.tags = {};
      }

      if (!Object.prototype.hasOwnProperty.call(mainObject.tags, tag)) {
        mainObject.tags[tag] = { label: tag, variant: style, value: tag };
      }
    }

    addOrUpdateObjectWithTag(copyConfig, tagName, style);
    // otherwise we save the changes
    // setAlmFile(newFile)
    setConfig(copyConfig);
    return writeTextFile(`config.json`, JSON.stringify(copyConfig, null, 2), {
      dir: BaseDirectory.Data,
    });
  };

  const handleInput = (e) => {
    setTagName(e);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          {t("New Tag ...")}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Add new tag")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-4">
            <Input
              id="name"
              placeholder="new tag name ..."
              value={tagName}
              onChange={(e) => handleInput(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-row justify-between">
            <Select onValueChange={(e) => setStyle(e)} defaultValue={style}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="destructive">Important</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant={style} className="box-border m-0.5">
              {tagName || "preview"}
            </Badge>
          </div>
          <div className="grid grid-cols items-center  end-0 gap-4">
            <Button
              onClick={writeTagToConfig}
              disabled={!tagName || config.tags?.hasOwnProperty(tagName)}
              id="username"
              value="@peduarte"
              className="col-span-2"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

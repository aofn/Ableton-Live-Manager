"use client";

import React from "react";
import { open } from "@tauri-apps/api/dialog";
import { MenubarItem } from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";
import { BaseDirectory, writeTextFile, readDir } from "@tauri-apps/api/fs";
export default function ReadDirectory({
  config,
  setConfig,
  setProjectDirectory,
}) {
  const { t } = useTranslation();
  const readDirectory = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected !== null) {
      setProjectDirectory(selected);

      const entries = await readDir(selected, {
        recursive: true,
      });

      const folderObject = {
        name: selected.split("/").pop(),
        path: selected,
        children: entries.map((entry) => ({
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
    }
  };

  return (
    <MenubarItem onClick={readDirectory}>
      {t("Add Ableton Project")}
    </MenubarItem>
  );
}

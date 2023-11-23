"use client";

import React from "react";
import { open } from "@tauri-apps/api/dialog";
import { MenubarItem } from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";
import { BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
export default function ReadDirectory({
  config,
  setConfig,
  setProjectDirectory,
}) {
  const { t } = useTranslation();
  const readDirectory = async () => {
    // const entries = await readDir('users', {dir: BaseDirectory.AppData, recursive: true});
    // processEntries(entries)
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single directory
      setProjectDirectory(selected);
      const copyConfig = { ...config };
      copyConfig.directoryPath = selected;
      return writeTextFile(`config.json`, JSON.stringify(copyConfig, null, 2), {
        dir: BaseDirectory.Data,
      });

      localStorage.setItem("ableton-project-directory", selected);
    }
  };

  return (
    <MenubarItem onClick={readDirectory}>
      {t("Change Ableton Project Folder")}
    </MenubarItem>
  );
}

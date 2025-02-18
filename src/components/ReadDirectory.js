"use client";

import React from "react";
import { open } from "@tauri-apps/api/dialog";
import { MenubarItem } from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";

export default function ReadDirectory({
  setProjectDirectory,
  handleAddingFolder,
}) {
  const { t } = useTranslation();
  const readDirectory = async () => {
    const selected = await open({
      directory: true,
      multiple: true,
    });

    if (selected && selected.length > 0) {
      for (const folder of selected) {
        setProjectDirectory(folder);
        await handleAddingFolder(folder);
      }
    }
  };

  return (
    <MenubarItem onClick={readDirectory}>
      {t("Add Ableton Project")}
    </MenubarItem>
  );
}

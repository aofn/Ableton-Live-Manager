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
      multiple: false,
    });

    if (selected !== null) {
      setProjectDirectory(selected);
      await handleAddingFolder(selected);
    }
  };

  return (
    <MenubarItem onClick={readDirectory}>
      {t("Add Ableton Project")}
    </MenubarItem>
  );
}

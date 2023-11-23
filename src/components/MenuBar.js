"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";
const MenuBar = () => {
  const { t } = useTranslation("menu");
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>{t("Settings")}</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>{t("Open")}</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
export default MenuBar;

"use client";

import { useTranslation } from "react-i18next";
import ReadDirectory from "@/components/ReadDirectory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { setConfig } from "next/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ChevronDownIcon } from "@radix-ui/react-icons";

const RemoveTags = ({ config, projectDirectory }) => {
  const [tagsToRemove, setTagsToRemove] = useState([]);
  const { t } = useTranslation("settings");

  const removeTags = async () => {
    const copyConfig = { ...config };
    for (const tag of tagsToRemove) {
      delete copyConfig.tags[tag];
    }
    await writeTextFile(
      `${projectDirectory}/alm.json`,
      JSON.stringify(copyConfig, null, 2),
    );
    setConfig(copyConfig);
  };

  const handleSelect = (tag) => {
    setTagsToRemove((prevState) => {
      if (prevState.includes(tag))
        return prevState.filter((item) => item !== tag);
      else return [...prevState, tag];
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          {t("Remove Tags")}
        </MenubarItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {t("Remove Tags")}
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {/*@TODO Table can be component, also used in DisplayThirdPartyPlugins.js*/}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Name")}</TableHead>
              <TableHead className="text-right">{t("Remove")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.tags &&
              Object.keys(config.tags).map((tag) => {
                return <TagRow key={tag} label={tag} callback={handleSelect} />;
              })}
          </TableBody>
        </Table>
        <Button disabled={tagsToRemove.length === 0} onClick={removeTags}>
          {t("Remove")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

//@TODO can probably be component also used in DisplayThirdPartyPlugins.js
const TagRow = ({ label, callback }) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked((prevState) => {
      return !prevState;
    });
    callback(label, !checked);
  };

  return (
    <TableRow key={label}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-right">
        <Checkbox checked={checked} onCheckedChange={handleChange} />
      </TableCell>
    </TableRow>
  );
};

const Settings = ({ config, setConfig, handleAddingFolder }) => {
  const { t } = useTranslation("settings");

  return (
    <Menubar className="border-none bg-sidebar">
      <MenubarMenu>
        <MenubarTrigger className="flex flex-row justify-between w-full">
          <span>{t("Ableton Live Manager")}</span>
          <ChevronDownIcon />
        </MenubarTrigger>
        <MenubarContent>
          <ReadDirectory
            config={config}
            setConfig={setConfig}
            handleAddingFolder={handleAddingFolder}
          />
          <RemoveTags config={config} />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
export default Settings;

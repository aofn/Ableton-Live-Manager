"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import React, { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import _ from "lodash";
import { useTranslation } from "react-i18next";

// sort projects by name
const sortByName = (a, b) => {
  return _.sortBy([a, b], ["name"]);
};

// sort function to sort directoryEntries by tags within alm.tags key if alm key exists
const sortByTags = (a, b) => {
  const aTags = a.alm?.tags ? Object.values(a.alm.tags) : [];
  const bTags = b.alm?.tags ? Object.values(b.alm.tags) : [];

  const sortedATags = _.sortBy(aTags, ["value", "label"]);
  const sortedBTags = _.sortBy(bTags, ["value", "label"]);

  const aTagsString = sortedATags.map((tag) => tag.value).join("");
  const bTagsString = sortedBTags.map((tag) => tag.value).join("");

  // * -1 reverses order so tags are on top of list
  return aTagsString.localeCompare(bTagsString) * -1;
};

const AppSidebar = ({
  projects,
  onClick,
  selectedProjectPath,
  handleDelete,
  filterInput,
}) => {
  const [sortMethod, setSortMethod] = useState("");
  const { t } = useTranslation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader>{t("Ableton Live Manager")}</SidebarHeader>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction title="Add Project">
            <PlusIcon /> <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu className="list-none">
              {projects
                .filter((entry) =>
                  entry.name.toLowerCase().includes(filterInput.toLowerCase()),
                )
                .sort(sortMethod.value === "name" ? sortByName : sortByTags)
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => onClick(item)}
                      isActive={selectedProjectPath === item.path}
                    >
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(item.path);
                          }}
                        >
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
export default AppSidebar;

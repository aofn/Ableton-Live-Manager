import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import React, { useState, useEffect } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import Settings from "@/components/Settings";
import { writeTextFile } from "@tauri-apps/api/fs";
import { BaseDirectory } from "@tauri-apps/api/fs";
import DraggableProject from "@/components/DraggableProject";
import CollapsibleGroup from "@/components/CollapsibleGroup";

const AppSidebar = ({
  projects,
  onClick,
  selectedProjectPath,
  config,
  setConfig,
  handleAddingFolder,
}) => {
  const [groups, setGroups] = useState(config.groups || []);
  const [newGroupName, setNewGroupName] = useState("");
  const [toggleCreateGroup, setToggleCreateGroup] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (config.groups) {
      setGroups(config.groups);
    }
  }, [config.groups]);

  const handleAddGroup = async () => {
    if (newGroupName.trim() !== "") {
      const updatedGroups = [...groups, { name: newGroupName, projects: [] }];
      setGroups(updatedGroups);
      setNewGroupName("");

      const updatedConfig = { ...config, groups: updatedGroups };
      setConfig(updatedConfig);
      await writeTextFile(
        "config.json",
        JSON.stringify(updatedConfig, null, 2),
        {
          dir: BaseDirectory.Data,
        },
      );
    }
  };

  const handleAddProjectToGroup = async (groupName, project) => {
    if (!groupName || !project) {
      console.error("Missing required data:", { groupName, project });
      return;
    }

    const updatedGroups = groups.map((group) => {
      if (group.name === groupName) {
        // Check if project already exists in group
        const projectExists = group.projects.some(
          (p) => p.path === project.path,
        );
        if (projectExists) {
          console.log("Project already exists in group");
          return group;
        }
        console.log("Adding project to group");
        return { ...group, projects: [...group.projects, project] };
      }
      return group;
    });

    console.log("Updated groups:", updatedGroups);
    setGroups(updatedGroups);

    try {
      const updatedConfig = { ...config, groups: updatedGroups };
      setConfig(updatedConfig);
      await writeTextFile(
        "config.json",
        JSON.stringify(updatedConfig, null, 2),
        {
          dir: BaseDirectory.Data,
        },
      );
      console.log("Config file updated successfully");
    } catch (error) {
      console.error("Error updating config file:", error);
    }
  };

  const updateConfigFile = async (newConfig) => {
    try {
      await writeTextFile("config.json", JSON.stringify(newConfig, null, 2), {
        dir: BaseDirectory.Data,
      });
    } catch (error) {
      console.error("Error updating config file:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="px-0">
          <Settings
            config={config}
            setConfig={setConfig}
            handleAddingFolder={handleAddingFolder}
          />
        </SidebarHeader>
        <SidebarGroupLabel>{t("Groups")}</SidebarGroupLabel>
        {groups.length > 0 && (
          <SidebarGroup>
            <SidebarMenu className="list-none">
              {groups.map((group) => (
                <CollapsibleGroup
                  key={group.name}
                  group={group}
                  handleAddProjectToGroup={handleAddProjectToGroup}
                  onClick={onClick}
                  selectedProjectPath={selectedProjectPath}
                  config={config}
                  setConfig={setConfig}
                  updateConfigFile={updateConfigFile}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
        <SidebarGroup className="list-none text-muted-foreground">
          <SidebarMenuItem>
            {toggleCreateGroup ? (
              <>
                <SidebarInput
                  placeholder={t("New Group Name")}
                  value={newGroupName}
                  autoFocus
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onBlur={() => setToggleCreateGroup(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddGroup();
                      setToggleCreateGroup(false);
                    }
                  }}
                />
              </>
            ) : (
              <SidebarMenuButton
                onClick={() => setToggleCreateGroup(true)}
                className="flex justify-between w-full"
              >
                <span>{t("Create New Group")}</span>
                <PlusIcon />
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroupLabel>{t("Projects")}</SidebarGroupLabel>
        <SidebarGroup>
          <SidebarMenu className="list-none">
            {projects.map((project) => (
              <DraggableProject
                key={project.path}
                project={project}
                onClick={onClick}
                selectedProjectPath={selectedProjectPath}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

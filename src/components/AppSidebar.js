import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { PlusIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Settings from "@/components/Settings";
import { writeTextFile } from "@tauri-apps/api/fs";
import { BaseDirectory } from "@tauri-apps/api/fs";
import DraggableProject from "@/components/DraggableProject";
import CollapsibleGroup from "@/components/CollapsibleGroup";
import { ThemeToggle } from "@/components/ThemeToggle";
import SidebarSearch from "@/components/SidebarSearch";
import { useAlmFile } from "@/components/hooks/useAlmFile";
import Ableton from "@/lib/Ableton";

const AppSidebar = ({
  projects,
  onClick,
  selectedProjectPath,
  config,
  setConfig,
  handleDelete,
  handleAddingFolder,
}) => {
  const [groups, setGroups] = useState(config.groups || []);
  const [newGroupName, setNewGroupName] = useState("");
  const [toggleCreateGroup, setToggleCreateGroup] = useState(false);
  const [isGroupsCollapsed, setIsGroupsCollapsed] = useState(false);
  const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [allTags, setAllTags] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (config.groups) {
      setGroups(config.groups);
    }
  }, [config.groups]);

  // Extract all unique tags from projects
  useEffect(() => {
    const tags = new Set();

    projects.forEach((project) => {
      if (project.xmpKeywords) {
        // Get just the objects from xmpKeywords
        Object.entries(project.xmpKeywords).forEach(([key, keywordObj]) => {
          tags.add(Object.values(keywordObj)[0]);
        });
      }
      if (project.alm?.tags) {
        Object.values(project.alm.tags).forEach((tag) => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags));
  }, [projects]);

  // Handle search and filter
  const handleSearchAndFilter = (searchTerm, selectedTags) => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(searchLower),
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((project) => {
        let hasMatchingTag = false;

        // Check ALM tags
        if (project.alm?.tags) {
          const almTags = Object.entries(project.alm.tags)
            .filter(([_, isEnabled]) => isEnabled)
            .map(([tagName]) => tagName);

          hasMatchingTag = selectedTags.some((selectedTag) =>
            almTags.includes(selectedTag),
          );
        }

        // Check XMP keywords
        if (project.xmpKeywords && !hasMatchingTag) {
          const xmpTags = Object.values(project.xmpKeywords).map(
            (keywordObj) => Object.values(keywordObj)[0],
          );

          hasMatchingTag = selectedTags.some((selectedTag) =>
            xmpTags.some((xmpTag) => xmpTag.value === selectedTag),
          );
        }

        return hasMatchingTag;
      });
    }

    setFilteredProjects(filtered);
  };

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
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsGroupsCollapsed(!isGroupsCollapsed)}
        >
          <ChevronDownIcon
            className={cn(
              "h-3 w-3 shrink-0 transition-transform duration-200",
              !isGroupsCollapsed ? "rotate-0" : "-rotate-90",
            )}
          />
          <SidebarGroupLabel>{t("Groups")}</SidebarGroupLabel>
        </div>
        {!isGroupsCollapsed && (
          <>
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
                      className="text-xs"
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
                    className="flex justify-between w-full text-xs"
                  >
                    <span>{t("Create New Group")}</span>
                    <PlusIcon />
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarGroup>
          </>
        )}
        <SidebarSeparator />

        {/* Projects section */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsProjectsCollapsed(!isProjectsCollapsed)}
        >
          <ChevronDownIcon
            className={cn(
              "h-3 w-3 shrink-0 transition-transform duration-200",
              !isProjectsCollapsed ? "rotate-0" : "-rotate-90",
            )}
          />
          <SidebarGroupLabel>{t("Projects")}</SidebarGroupLabel>
        </div>

        {!isProjectsCollapsed && (
          <SidebarGroup>
            <SidebarMenu className="list-none">
              {filteredProjects.map((project) => (
                <DraggableProject
                  key={project.path}
                  project={project}
                  onDelete={handleDelete}
                  onClick={onClick}
                  selectedProjectPath={selectedProjectPath}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-4 border-t">
          <div className="flex-1 min-w-0">
            <SidebarSearch
              onSearch={(searchTerm, selectedTags) =>
                handleSearchAndFilter(searchTerm, selectedTags)
              }
              onFilterTags={(selectedTags) =>
                handleSearchAndFilter("", selectedTags)
              }
              allTags={allTags}
            />
          </div>
          <div className="flex-none">
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

import React, { useState, useRef, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarInput,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import DroppableGroup from "@/components/layout/AppSidebar/DroppableGroup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MoreHorizontal } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
const CollapsibleGroup = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newGroupName, setNewGroupName] = useState(props.group.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const inputRef = useRef(null);

  const handleOpenChange = (open) => {
    if (!props.group.isDropping) {
      setIsOpen(open);
    }
  };

  const handleDrop = async () => {
    setIsOpen(true);
  };

  const handleRemoveFromGroup = (projectPath) => {
    const updatedGroup = {
      ...props.group,
      projects: props.group.projects.filter(
        (project) => project.path !== projectPath,
      ),
    };
    updateGroups(updatedGroup);
  };

  const handleRenameGroup = () => {
    setIsRenaming(true);
    setNewGroupName(props.group.name);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleRenameSubmit = () => {
    if (newGroupName.trim() && newGroupName !== props.group.name) {
      const updatedGroup = {
        ...props.group,
        name: newGroupName.trim(),
      };
      updateGroups(updatedGroup);
    }
    setIsRenaming(false);
  };

  const handleDeleteGroup = () => {
    const updatedGroups = props.config.groups.filter(
      (group) => group.name !== props.group.name,
    );
    const newConfig = {
      ...props.config,
      groups: updatedGroups,
    };
    props.setConfig(newConfig);
    props.updateConfigFile?.(newConfig);
  };

  const updateGroups = (updatedGroup) => {
    const updatedGroups = props.config.groups.map((group) =>
      group.name === props.group.name ? updatedGroup : group,
    );
    const newConfig = {
      ...props.config,
      groups: updatedGroups,
    };
    props.setConfig(newConfig);
    props.updateConfigFile?.(newConfig);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        handleRenameSubmit();
      }
    };

    if (isRenaming) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRenaming]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteGroup();
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const renderGroupContent = () => {
    const filteredProjects = props.group.projects.filter((project) =>
      project.name.toLowerCase().includes(props.searchTerm.toLowerCase()),
    );

    return (
      <div onClick={(e) => e.stopPropagation()}>
        {filteredProjects.length > 0 ? (
          <SidebarMenuSub className="list-none">
            {filteredProjects.map((project) => (
              <ContextMenu key={project.path}>
                <ContextMenuTrigger>
                  <SidebarMenuButton
                    className="text-xs"
                    onClick={() => props.onClick(project)}
                    isActive={props.selectedProjectPath === project.path}
                  >
                    {project.name}
                  </SidebarMenuButton>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleRemoveFromGroup(project.path)}
                  >
                    Remove from group
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </SidebarMenuSub>
        ) : (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Drop projects here
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DroppableGroup
        group={props.group}
        handleAddProjectToGroup={(groupName, project) => {
          setIsOpen(true);
          props.handleAddProjectToGroup(groupName, project);
        }}
        onDrop={handleDrop}
      >
        <div className="w-full">
          <Collapsible
            className="group/collapsible"
            open={isOpen}
            onOpenChange={handleOpenChange}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  onClick={(e) => {
                    if (props.group.isDropping) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <ChevronDownIcon
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-200",
                      isOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                  {isRenaming ? (
                    <SidebarInput
                      ref={inputRef}
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameSubmit();
                        }
                        if (e.key === "Escape") {
                          setIsRenaming(false);
                          setNewGroupName(props.group.name);
                        }
                        e.stopPropagation();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      placeholder="Group name..."
                    />
                  ) : (
                    <SidebarGroupLabel>{props.group.name}</SidebarGroupLabel>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal />
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem onSelect={handleRenameGroup}>
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={handleDeleteClick}
                    className="text-red-600 focus:text-red-600"
                  >
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>

            <CollapsibleContent>{renderGroupContent()}</CollapsibleContent>
          </Collapsible>
        </div>
      </DroppableGroup>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Group"
        confirmText="Delete Group"
        cancelText="Cancel"
        variant="destructive"
      >
        Are you sure you want to delete &quot;{props.group.name}&quot;? This
        action cannot be undone and all projects will be removed from this
        group.
      </ConfirmationDialog>
    </>
  );
};

export default CollapsibleGroup;

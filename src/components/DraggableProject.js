import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useDrag } from "react-dnd";
import { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const DraggableProject = ({
  project,
  onClick,
  selectedProjectPath,
  onDelete,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(true);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PROJECT",
    item: () => {
      console.log("Starting drag with project:", project);
      return { project };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log("Drag ended. Drop result:", dropResult);
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (e) => {
    e?.preventDefault();
    onDelete(project);
    setIsDeleteDialogOpen(false);
    setShowContextMenu(true);
  };

  const handleCancelDelete = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDeleteDialogOpen(false);
    // Small delay before showing context menu again
    setTimeout(() => {
      setShowContextMenu(true);
    }, 100);
  };

  useEffect(() => {
    if (isDragging) console.log("project is dragged");
  }, [isDragging]);

  return (
    <>
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {showContextMenu && (
          <ContextMenu>
            <ContextMenuTrigger>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(project);
                  }}
                  isActive={selectedProjectPath === project.path}
                >
                  {project.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleDeleteClick}
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
        {!showContextMenu && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={(e) => {
                e.stopPropagation();
                onClick(project);
              }}
              isActive={selectedProjectPath === project.path}
            >
              {project.name}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="destructive"
      >
        Are you sure you want to delete &quot;{project.name}&quot; from the
        application? This action will remove the project from all groups and
        cannot be undone.
      </ConfirmationDialog>
    </>
  );
};

export default DraggableProject;

import { useDrop } from "react-dnd";
import { useEffect } from "react";

const DroppableGroup = ({
  group,
  handleAddProjectToGroup,
  onDrop,
  children,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "PROJECT",
      hover: (item, monitor) => {
        // When item is being dragged over, ensure parent knows we're in a drop operation
        if (monitor.isOver({ shallow: true })) {
          group.isDropping = true;
        } else {
          group.isDropping = false;
        }
      },
      drop: (item, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        console.log("Drop event triggered");

        // Handle the actual project drop
        handleAddProjectToGroup(group.name, item.project);
        onDrop && onDrop();

        // Reset the dropping state after the drop
        group.isDropping = false;

        return { dropped: true };
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [group, handleAddProjectToGroup, onDrop],
  );

  // Clean up isDropping flag when component unmounts or drop ends
  useEffect(() => {
    return () => {
      group.isDropping = false;
    };
  }, [group]);

  return (
    <div
      ref={drop}
      style={{
        position: "relative",
        backgroundColor:
          isOver && canDrop ? "rgba(0, 0, 0, 0.1)" : "transparent",
        transition: "background-color 0.2s ease",
        width: "100%",
        height: "100%",
        minHeight: group.projects.length === 0 ? "4rem" : "2rem",
      }}
      onClick={(e) => e.stopPropagation()} // Prevent click events from bubbling up
    >
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          border:
            group.projects.length === 0
              ? `2px dashed ${
                  isOver && canDrop
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(0, 0, 0, 0.2)"
                }`
              : isOver && canDrop
                ? "2px dashed rgba(0, 0, 0, 0.2)"
                : "none",
          borderRadius: "4px",
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default DroppableGroup;

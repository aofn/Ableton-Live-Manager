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
      drop: (item, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        // Handle the actual project drop
        handleAddProjectToGroup(group.name, item.project);
        onDrop && onDrop();

        return { dropped: true };
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
      }),
      hover: () => {
        group.isDropping = true;
      },
    }),
    [group, handleAddProjectToGroup, onDrop],
  );

  useEffect(() => {
    return () => {
      group.isDropping = false;
    };
  }, [group]);

  return (
    <div
      ref={drop}
      className="w-full"
      style={{
        position: "relative",
        backgroundColor:
          isOver && canDrop ? "rgba(0, 0, 0, 0.1)" : "transparent",
        transition: "background-color 0.2s ease",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {isOver && canDrop && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            border: "2px dashed rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            zIndex: 0,
          }}
        />
      )}
    </div>
  );
};

export default DroppableGroup;

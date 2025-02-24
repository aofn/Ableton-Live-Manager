import { useDragLayer } from "react-dnd";
import Index from "./features/projects/DragPreview";

const CustomDragLayer = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Index name={item.project.name} />
    </div>
  );
};

export default CustomDragLayer;

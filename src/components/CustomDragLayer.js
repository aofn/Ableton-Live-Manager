import { useDragLayer } from "react-dnd";
import DragPreview from "./DragPreview";

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
      <DragPreview name={item.project.name} />
    </div>
  );
};

export default CustomDragLayer;

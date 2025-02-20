import { useDrop } from "react-dnd";
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DroppableGroup = ({
  group,
  handleAddProjectToGroup,
  onDrop,
  children,
}) => {
  const resetDropState = useCallback(() => {
    if (group.isDropping) {
      group.isDropping = false;
    }
  }, [group]);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "PROJECT",
      drop: (item, monitor) => {
        if (monitor.didDrop()) {
          return;
        }
        handleAddProjectToGroup(group.name, item.project);
        onDrop && onDrop();
        resetDropState();
        return { dropped: true };
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
        canDrop: !!monitor.canDrop(),
      }),
      hover: (item, monitor) => {
        if (monitor.isOver({ shallow: true })) {
          group.isDropping = true;
        }
      },
      canDrop: (item, monitor) => {
        if (!monitor.isOver({ shallow: true })) {
          resetDropState();
        }
        return true;
      },
    }),
    [group, handleAddProjectToGroup, onDrop, resetDropState],
  );

  useEffect(() => {
    return () => {
      resetDropState();
    };
  }, [resetDropState]);

  useEffect(() => {
    if (!isOver) {
      resetDropState();
    }
  }, [isOver, resetDropState]);

  return (
    <motion.div
      ref={drop}
      className={`w-full relative ${
        isOver && canDrop ? "bg-black bg-opacity-10" : "bg-transparent"
      }`}
      animate={{
        backgroundColor:
          isOver && canDrop ? "rgba(0, 0, 0, 0.1)" : "transparent",
      }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <AnimatePresence>
        {isOver && canDrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            <svg className="w-full h-full">
              <motion.rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="8 8"
                rx="4"
                initial={{
                  strokeDashoffset: 0,
                }}
                animate={{
                  strokeDashoffset: [-20, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 4,
                  ease: "linear",
                }}
                className="text-foreground opacity-50"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DroppableGroup;

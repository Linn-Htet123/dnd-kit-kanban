import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { ID, Task } from "../type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TaskCard = ({
  task,
  deleteTask,
}: {
  task: Task;
  deleteTask: (id: ID) => void;
}) => {
  const [isMouseOver, setIsMousOver] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: false,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        key={task.id}
        className="px-2 py-7 opacity-25 bg-slate-700 rounded-lg flex justify-between items-center cursor-grab my-2"
      />
    );
  }
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setIsMousOver(true)}
        onMouseLeave={() => setIsMousOver(false)}
        key={task.id}
        className="px-2 py-4 bg-slate-700 rounded-lg flex justify-between items-center cursor-grab my-2"
      >
        <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-auto whitespace-pre-wrap ">
          {task.content}
        </p>
        {isMouseOver && (
          <div
            className="cursor-pointer hover:text-red-500 stroke-slate-200"
            onClick={() => deleteTask(task.id)}
          >
            <TrashIcon />
          </div>
        )}
      </div>
    </>
  );
};

export default TaskCard;

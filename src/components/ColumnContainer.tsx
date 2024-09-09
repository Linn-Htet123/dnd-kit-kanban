import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, ID, Task } from "../type";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import TaskCard from "./Task";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";

interface Props {
  column: Column;
  deleteColumn: (id: ID) => void;
  updateColumnTitle: (id: ID, title: string) => void;
  createTask: (columnID: ID) => void;
  tasks: Task[];
  deleteTask: (id: ID) => void;
  setTask: React.Dispatch<React.SetStateAction<Task[]>>;
}

const ColumnContainer = ({
  column,
  deleteColumn,
  updateColumnTitle,
  createTask,
  tasks,
  deleteTask,
  setTask,
}: Props) => {
  const [isEdit, setIsEdit] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: isEdit,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const tasksID = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const [currentDragTask, setCurrentDragTask] = useState<Task | null>(null);
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setCurrentDragTask(event.active.data.current?.task);
    }
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTaskID = active.id;
    const overTaskID = over.id;
    if (activeTaskID === overTaskID) return;

    setTask((prev) => {
      const activeIDx = prev.findIndex((task) => task.id === activeTaskID);
      const overIDx = prev.findIndex((task) => task.id === overTaskID);
      prev[activeIDx].columnID = prev[overIDx].columnID;

      return arrayMove(prev, activeIDx, overIDx);
    });
  };
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-[350px] opacity-20 h-[400px] min-h-[]400px: rounded-lg bg-slate-800  text-white"
      ></div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[350px] min-h-[400px] rounded-lg bg-slate-800 border-2 border-slate-900 text-white flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center px-2 bg-slate-700"
        onClick={() => setIsEdit(true)}
      >
        <div className="flex justify-center items-center p-2 w-5 h-5 text-sm bg-slate-900 rounded-full">
          0
        </div>
        <div className="flex justify-between p-4 flex-grow font-medium cursor-grab">
          {isEdit && (
            <input
              autoFocus
              value={column.title}
              onChange={(e) => {
                updateColumnTitle(column.id, e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setIsEdit(false);
              }}
              onBlur={() => {
                setIsEdit(false);
              }}
              className="bg-slate-400 outline-none px-3"
            />
          )}
          {!isEdit && <span>{column.title}</span>}
          <button
            className="stroke-slate-300 hover:stroke-white px-4 rounded"
            onClick={() => deleteColumn(column.id)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Content will grow to take up the remaining space */}
      <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver}>
        <div className="flex-grow py-4 px-2">
          <SortableContext items={tasksID}>
            {tasks.map((task) => {
              if (task.columnID !== column.id) return null;
              return (
                <TaskCard task={task} key={task.id} deleteTask={deleteTask} />
              );
            })}
          </SortableContext>
        </div>
        {createPortal(
          <DragOverlay>
            {currentDragTask && (
              <TaskCard task={currentDragTask} deleteTask={deleteTask} />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      {/* Footer sticks to the bottom */}
      <div
        className="px-2 py-3 bg-slate-100 font-medium m-2 text-black text-center rounded-lg cursor-pointer"
        onClick={() => createTask(column.id)}
      >
        Add
      </div>
    </div>
  );
};

export default ColumnContainer;

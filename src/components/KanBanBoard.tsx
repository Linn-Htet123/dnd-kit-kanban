import { useMemo, useState } from "react";
import { Column, ID, Task } from "../type";
import { v4 as uuid } from "uuid";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

const KanBanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [currentDraggedCol, setCurrentDraggedCol] = useState<Column | null>(
    null
  );

  const columnsID = useMemo(() => columns.map((col) => col.id), [columns]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setCurrentDraggedCol(event.active.data.current?.column);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeColumnID = active.id;
    const overColumnID = over.id;
    if (activeColumnID === overColumnID) return;

    setColumns((prev) => {
      const activeColumnIdx = prev.findIndex(
        (col) => col.id === activeColumnID
      );
      const overColumnIdx = prev.findIndex((col) => col.id === overColumnID);
      return arrayMove(prev, activeColumnIdx, overColumnIdx);
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTaskID = active.id;
    const overTaskID = over.id;

    if (activeTaskID === overTaskID) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeIDx = prev.findIndex((task) => task.id === activeTaskID);
        const overIDx = prev.findIndex((task) => task.id === overTaskID);
        prev[activeIDx].columnID = prev[overIDx].columnID;

        return arrayMove(prev, activeIDx, overIDx);
      });
    }
  };

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: uuid(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns((prev) => [...prev, columnToAdd]);
  };

  const deleteColumn = (id: ID) => {
    setColumns((prev) => prev.filter((col) => col.id !== id));
  };

  const updateColumnTitle = (id: ID, title: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title } : col))
    );
  };

  const createTask = (columnID: ID) => {
    setTasks((prev) => [
      ...prev,
      {
        id: uuid() + Math.floor(Math.random() * 100),
        columnID,
        content: `Task ${prev.length + 1}`,
      },
    ]);
  };

  const deleteTask = (taskID: ID) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskID));
  };

  return (
    <div className="flex min-h-screen overflow-x-auto overflow-y-auto items-center m-auto px-10">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        sensors={sensors}
      >
        <div className="m-auto flex flex-col-reverse gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsID}>
              {columns.map((col: Column) => (
                <ColumnContainer
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumnTitle={updateColumnTitle}
                  key={col.id}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnID === col.id)}
                  deleteTask={deleteTask}
                  setTask={setTasks}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => createNewColumn()}
            className="h-[40px] min-w-[250px] w-[250px] rounded-lg bg-black border-2 border-slate-900 text-white "
          >
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {currentDraggedCol && (
              <ColumnContainer
                key={currentDraggedCol.id}
                tasks={tasks.filter(
                  (task) => task.columnID === currentDraggedCol.id
                )}
                column={currentDraggedCol}
                updateColumnTitle={updateColumnTitle}
                deleteColumn={deleteColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                setTask={setTasks}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default KanBanBoard;

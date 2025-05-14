"use client";
import { trpc } from "@/server/client";
import { useState } from "react";
export default function TaskList() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const utils = trpc.useContext();

  const tasks = trpc.task.getTasks.useQuery();
  const createTask = trpc.task.createTask.useMutation({
    onSuccess: () => {
      utils.task.getTasks.invalidate();
      setNewTaskTitle("");
    },
  });

  const toggleTask = trpc.task.toggleTask.useMutation({
    onSuccess: () => {
      utils.task.getTasks.invalidate();
      setNewTaskTitle("");
    },
  });

  const deleteTask = trpc.task.deleteTask.useMutation({
    onSuccess: () => {
      utils.task.getTasks.invalidate();
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTask.mutate({ title: newTaskTitle });
    }
  };

  if (tasks.isLoading) return <div>Loading tasks...</div>;
  if (tasks.error) return <div>Error loading tasks</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Your Tasks</h2>

      <form onSubmit={handleCreateTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={createTask.isPending}
          >
            {createTask.isPending ? "Adding..." : "Add Task"}
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {tasks.data?.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-3 border rounded"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask.mutate({ id: task.id })}
                className="h-5 w-5"
              />
              <span
                className={task.completed ? "line-through text-gray-500" : ""}
              >
                {task.title}
              </span>
            </div>
            <button
              onClick={() => deleteTask.mutate({ id: task.id })}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}

        {tasks.data?.length === 0 && (
          <p className="text-gray-500">No tasks yet. Add one above!</p>
        )}
      </ul>
    </div>
  );
}

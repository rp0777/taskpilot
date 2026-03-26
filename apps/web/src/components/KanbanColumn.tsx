'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { Column, Task, updateColumn, deleteColumn } from '@/lib/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface KanbanColumnProps {
  column: Column;
  onRefresh: () => void;
}

export default function KanbanColumn({ column, onRefresh }: KanbanColumnProps) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  });

  const tasks = [...(column.tasks || [])].sort((a, b) => a.order - b.order);
  const taskIds = tasks.map(t => t.id);

  const handleTitleSave = async () => {
    if (titleValue.trim() && titleValue.trim() !== column.title) {
      try {
        await updateColumn(column.id, { title: titleValue.trim() });
        onRefresh();
      } catch (err) {
        console.error('Failed to update column:', err);
        setTitleValue(column.title);
      }
    } else {
      setTitleValue(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleDeleteColumn = async () => {
    if (!confirm(`Delete "${column.title}" and all its tasks?`)) return;
    try {
      await deleteColumn(column.id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete column:', err);
    }
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTitleValue(column.title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-sm font-semibold text-gray-700 bg-white border border-indigo-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-semibold text-gray-700 uppercase tracking-wide cursor-pointer hover:text-indigo-600 transition-colors"
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600">
            {tasks.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    handleDeleteColumn();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors duration-200 ${
          isOver
            ? 'bg-indigo-50 ring-2 ring-indigo-300 ring-inset'
            : 'bg-gray-100/80'
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setEditingTask(task)}
            />
          ))}
        </SortableContext>

        <button
          onClick={() => setShowTaskModal(true)}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {showTaskModal && (
        <TaskModal
          columnId={column.id}
          order={tasks.length}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => {
            setShowTaskModal(false);
            onRefresh();
          }}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          columnId={column.id}
          order={editingTask.order}
          onClose={() => setEditingTask(null)}
          onSaved={() => {
            setEditingTask(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

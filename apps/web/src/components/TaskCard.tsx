'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, Tag } from 'lucide-react';
import { Task } from '@/lib/api';
import { format } from 'date-fns';

const priorityConfig = {
  LOW: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  MEDIUM: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  HIGH: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  URGENT: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority] || priorityConfig.LOW;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-150 ${
        isDragging ? 'opacity-50 shadow-lg rotate-2 scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>
          {task.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${priority.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {task.priority}
            </span>
            {task.label && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                <Tag className="h-3 w-3" />
                {task.label}
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

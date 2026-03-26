'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Board, Column, Task, getBoard, createColumn, moveTask } from '@/lib/api';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import BoardFilters, { FilterState } from './BoardFilters';

interface KanbanBoardProps {
  boardId: string;
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [filters, setFilters] = useState<FilterState>({ search: '', priority: '', label: '' });
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(boardId);
      setBoard(data);
      setColumns(
        [...(data.columns || [])].sort((a, b) => a.order - b.order)
      );
    } catch (err) {
      console.error('Failed to fetch board:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Collect all unique labels across all tasks
  const allLabels = useMemo(() => {
    const labelSet = new Set<string>();
    columns.forEach(col =>
      col.tasks?.forEach(task => {
        if (task.label) labelSet.add(task.label);
      })
    );
    return Array.from(labelSet).sort();
  }, [columns]);

  // Count total and matching tasks
  const totalTasks = useMemo(
    () => columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0),
    [columns]
  );

  const taskMatchesFilter = useCallback(
    (task: Task): boolean => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.label && task.label !== filters.label) return false;
      return true;
    },
    [filters]
  );

  // Build filtered columns — tasks that don't match are hidden
  const filteredColumns = useMemo(() => {
    const hasActiveFilter = filters.search || filters.priority || filters.label;
    if (!hasActiveFilter) return columns;
    return columns.map(col => ({
      ...col,
      tasks: col.tasks?.filter(taskMatchesFilter) || [],
    }));
  }, [columns, filters, taskMatchesFilter]);

  const matchingTasks = useMemo(
    () => filteredColumns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0),
    [filteredColumns]
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      await createColumn({
        title: newColumnTitle.trim(),
        order: columns.length,
        boardId,
      });
      setNewColumnTitle('');
      setIsAddingColumn(false);
      fetchBoard();
    } catch (err) {
      console.error('Failed to create column:', err);
    }
  };

  const findColumnByTaskId = (taskId: string): Column | undefined => {
    return columns.find(col =>
      col.tasks?.some(t => t.id === taskId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);
    let overColumn: Column | undefined;

    if (overId.startsWith('column-')) {
      overColumn = columns.find(c => c.id === overId.replace('column-', ''));
    } else {
      overColumn = findColumnByTaskId(overId);
    }

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns(prev => {
      const activeColIndex = prev.findIndex(c => c.id === activeColumn.id);
      const overColIndex = prev.findIndex(c => c.id === overColumn.id);

      const activeTask = prev[activeColIndex].tasks.find(t => t.id === activeId);
      if (!activeTask) return prev;

      const newColumns = [...prev];

      newColumns[activeColIndex] = {
        ...newColumns[activeColIndex],
        tasks: newColumns[activeColIndex].tasks.filter(t => t.id !== activeId),
      };

      const overTaskIndex = overId.startsWith('column-')
        ? newColumns[overColIndex].tasks.length
        : newColumns[overColIndex].tasks.findIndex(t => t.id === overId);

      const insertIndex = overTaskIndex >= 0 ? overTaskIndex : newColumns[overColIndex].tasks.length;

      newColumns[overColIndex] = {
        ...newColumns[overColIndex],
        tasks: [
          ...newColumns[overColIndex].tasks.slice(0, insertIndex),
          { ...activeTask, columnId: overColumn.id },
          ...newColumns[overColIndex].tasks.slice(insertIndex),
        ],
      };

      return newColumns;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);

    if (!activeColumn) return;

    // Same column reorder
    if (!overId.startsWith('column-')) {
      const overColumn = findColumnByTaskId(overId);
      if (overColumn && activeColumn.id === overColumn.id && activeId !== overId) {
        const oldIndex = activeColumn.tasks.findIndex(t => t.id === activeId);
        const newIndex = activeColumn.tasks.findIndex(t => t.id === overId);

        setColumns(prev => {
          const colIndex = prev.findIndex(c => c.id === activeColumn.id);
          const newColumns = [...prev];
          newColumns[colIndex] = {
            ...newColumns[colIndex],
            tasks: arrayMove(newColumns[colIndex].tasks, oldIndex, newIndex),
          };
          return newColumns;
        });
      }
    }

    // Persist move to server
    const currentColumn = columns.find(col =>
      col.tasks?.some(t => t.id === activeId)
    );
    if (currentColumn) {
      const taskIndex = currentColumn.tasks.findIndex(t => t.id === activeId);
      try {
        await moveTask(activeId, {
          columnId: currentColumn.id,
          order: taskIndex >= 0 ? taskIndex : 0,
        });
      } catch (err) {
        console.error('Failed to move task:', err);
        fetchBoard();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Board not found</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{board.description}</p>
            )}
          </div>
        </div>
        <BoardFilters
          filters={filters}
          onFiltersChange={setFilters}
          labels={allLabels}
          totalTasks={totalTasks}
          matchingTasks={matchingTasks}
        />
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-5 h-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {filteredColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                onRefresh={fetchBoard}
              />
            ))}

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3 scale-105">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Add Column */}
          <div className="w-72 shrink-0">
            {isAddingColumn ? (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddColumn}
                    disabled={!newColumnTitle.trim()}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Column
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layout, Trash2, Calendar } from 'lucide-react';
import { Board, getBoards, deleteBoard } from '@/lib/api';
import CreateBoardModal from './CreateBoardModal';
import { format } from 'date-fns';

export default function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const fetchBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this board?')) return;
    try {
      await deleteBoard(id);
      setBoards(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Boards</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your projects and tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Layout className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No boards yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Create your first board to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => router.push(`/board/${board.id}`)}
              className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Layout className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <button
                  onClick={(e) => handleDelete(e, board.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100 text-lg">{board.title}</h3>
              {board.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{board.description}</p>
              )}
              <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(board.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {board.columns?.length || 0} columns
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {board.columns?.reduce((acc, col) => acc + (col.tasks?.length || 0), 0) || 0} tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(board) => {
            setBoards(prev => [...prev, board]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

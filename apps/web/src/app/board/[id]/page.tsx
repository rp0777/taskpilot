import KanbanBoard from '@/components/KanbanBoard';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  return <KanbanBoard boardId={id} />;
}

import { PrismaClient, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();

  // Create a default board
  const board = await prisma.board.create({
    data: {
      title: 'My First Board',
      description: 'A sample Kanban board to get you started',
    },
  });

  // Create columns
  const todoColumn = await prisma.column.create({
    data: {
      title: 'To Do',
      order: 0,
      boardId: board.id,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      title: 'In Progress',
      order: 1,
      boardId: board.id,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      title: 'Done',
      order: 2,
      boardId: board.id,
    },
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project repository',
        description: 'Initialize Git repo with proper .gitignore and README',
        order: 0,
        priority: Priority.HIGH,
        label: 'setup',
        columnId: doneColumn.id,
      },
      {
        title: 'Design database schema',
        description: 'Create Prisma schema with Board, Column, and Task models',
        order: 1,
        priority: Priority.HIGH,
        label: 'backend',
        columnId: doneColumn.id,
      },
      {
        title: 'Build REST API endpoints',
        description: 'Implement CRUD operations for boards, columns, and tasks',
        order: 0,
        priority: Priority.URGENT,
        label: 'backend',
        columnId: inProgressColumn.id,
      },
      {
        title: 'Add drag-and-drop support',
        description: 'Implement drag-and-drop for tasks between columns',
        order: 0,
        priority: Priority.MEDIUM,
        label: 'frontend',
        columnId: todoColumn.id,
      },
      {
        title: 'Create board settings page',
        description: 'Allow users to rename and delete boards',
        order: 1,
        priority: Priority.LOW,
        label: 'frontend',
        columnId: todoColumn.id,
      },
      {
        title: 'Write unit tests',
        description: 'Add tests for all service methods',
        order: 2,
        priority: Priority.MEDIUM,
        label: 'testing',
        dueDate: new Date('2026-04-15'),
        columnId: todoColumn.id,
      },
    ],
  });

  console.log('Seed data created successfully!');
  console.log(`  Board: "${board.title}" (${board.id})`);
  console.log(`  Columns: To Do, In Progress, Done`);
  console.log(`  Tasks: 6 sample tasks created`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

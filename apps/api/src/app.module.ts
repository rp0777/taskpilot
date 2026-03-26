import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [PrismaModule, BoardsModule, ColumnsModule, TasksModule],
})
export class AppModule {}

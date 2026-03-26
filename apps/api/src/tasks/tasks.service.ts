import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(columnId: string) {
    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { column: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        order: dto.order,
        priority: dto.priority,
        label: dto.label,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        columnId: dto.columnId,
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async move(id: string, dto: MoveTaskDto) {
    const task = await this.findOne(id);
    const oldColumnId = task.columnId;
    const oldOrder = task.order;
    const newColumnId = dto.columnId;
    const newOrder = dto.order;

    await this.prisma.$transaction(async (tx) => {
      // Remove from old position: shift tasks in old column down
      await tx.task.updateMany({
        where: {
          columnId: oldColumnId,
          order: { gt: oldOrder },
        },
        data: { order: { decrement: 1 } },
      });

      // Make space in new position: shift tasks in new column up
      await tx.task.updateMany({
        where: {
          columnId: newColumnId,
          order: { gte: newOrder },
          id: { not: id },
        },
        data: { order: { increment: 1 } },
      });

      // Move the task
      await tx.task.update({
        where: { id },
        data: {
          columnId: newColumnId,
          order: newOrder,
        },
      });
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const task = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id } });

      // Shift remaining tasks in the column up
      await tx.task.updateMany({
        where: {
          columnId: task.columnId,
          order: { gt: task.order },
        },
        data: { order: { decrement: 1 } },
      });
    });

    return task;
  }
}

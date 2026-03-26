import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(boardId: string) {
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!column) {
      throw new NotFoundException(`Column with ID "${id}" not found`);
    }

    return column;
  }

  async create(dto: CreateColumnDto) {
    return this.prisma.column.create({
      data: dto,
      include: {
        tasks: true,
      },
    });
  }

  async update(id: string, dto: UpdateColumnDto) {
    await this.findOne(id);

    return this.prisma.column.update({
      where: { id },
      data: dto,
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async reorder(id: string, dto: ReorderColumnDto) {
    const column = await this.findOne(id);
    const oldOrder = column.order;
    const newOrder = dto.newOrder;

    if (oldOrder === newOrder) {
      return column;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder > oldOrder) {
        // Moving down: shift columns between old+1 and new up by 1
        await tx.column.updateMany({
          where: {
            boardId: column.boardId,
            order: { gt: oldOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        // Moving up: shift columns between new and old-1 down by 1
        await tx.column.updateMany({
          where: {
            boardId: column.boardId,
            order: { gte: newOrder, lt: oldOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      await tx.column.update({
        where: { id },
        data: { order: newOrder },
      });
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.column.delete({
      where: { id },
    });
  }
}

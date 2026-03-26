import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { tasks: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    return board;
  }

  async create(dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateBoardDto) {
    await this.findOne(id);

    return this.prisma.board.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.board.delete({
      where: { id },
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';

@ApiTags('Columns')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all columns for a board' })
  @ApiQuery({
    name: 'boardId',
    description: 'Filter columns by board UUID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all columns for the specified board with their tasks',
  })
  findAll(@Query('boardId', ParseUUIDPipe) boardId: string) {
    return this.columnsService.findAll(boardId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new column' })
  @ApiResponse({ status: 201, description: 'Column created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateColumnDto) {
    return this.columnsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a column' })
  @ApiParam({ name: 'id', description: 'Column UUID' })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, dto);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder a column within its board' })
  @ApiParam({ name: 'id', description: 'Column UUID' })
  @ApiResponse({ status: 200, description: 'Column reordered successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  reorder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderColumnDto,
  ) {
    return this.columnsService.reorder(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a column' })
  @ApiParam({ name: 'id', description: 'Column UUID' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.remove(id);
  }
}

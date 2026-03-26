import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from './create-task.dto';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'The updated title of the task',
    example: 'Updated task title',
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({
    description: 'The updated description of the task',
    example: 'Updated description with more detail',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The updated display order of the task',
    example: 2,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'The updated priority level',
    enum: Priority,
    example: 'URGENT',
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'The updated label/tag',
    example: 'frontend',
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    description: 'The updated due date in ISO 8601 format',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

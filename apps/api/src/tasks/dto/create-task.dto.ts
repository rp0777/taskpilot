import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsEnum,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Implement user authentication',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the task',
    example: 'Add JWT-based authentication with login and signup endpoints',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The display order of the task within its column (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({
    description: 'The priority level of the task',
    enum: Priority,
    default: Priority.MEDIUM,
    example: 'HIGH',
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'A label/tag for the task',
    example: 'backend',
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    description: 'The due date of the task in ISO 8601 format',
    example: '2026-04-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    description: 'The UUID of the column this task belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  columnId: string;
}

import { IsString, IsInt, IsUUID, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({
    description: 'The title of the column',
    example: 'To Do',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: 'The display order of the column (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({
    description: 'The UUID of the board this column belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  boardId: string;
}

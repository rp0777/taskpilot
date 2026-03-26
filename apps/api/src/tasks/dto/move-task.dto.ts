import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({
    description: 'The UUID of the target column to move the task to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  columnId: string;

  @ApiProperty({
    description: 'The new order position within the target column',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  order: number;
}

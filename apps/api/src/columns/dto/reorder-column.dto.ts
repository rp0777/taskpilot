import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderColumnDto {
  @ApiProperty({
    description: 'The new order position for the column',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  newOrder: number;
}

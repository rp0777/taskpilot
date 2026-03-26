import { IsString, IsInt, IsOptional, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateColumnDto {
  @ApiPropertyOptional({
    description: 'The updated title of the column',
    example: 'In Review',
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({
    description: 'The updated display order of the column',
    example: 2,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  order?: number;
}

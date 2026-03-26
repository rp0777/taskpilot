import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiPropertyOptional({
    description: 'The updated title of the board',
    example: 'Updated Board Title',
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({
    description: 'The updated description of the board',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

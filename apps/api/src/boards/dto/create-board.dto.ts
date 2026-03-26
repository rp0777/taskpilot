import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    description: 'The title of the board',
    example: 'My Project Board',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    description: 'An optional description for the board',
    example: 'A board to track project tasks',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

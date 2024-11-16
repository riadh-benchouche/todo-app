import { IsInt, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @Min(0)
  limit: number;

  @IsInt()
  @Min(0)
  offset: number;
}
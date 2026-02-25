import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsIn([5, 10, 15, 25])
  pageSize: number = 10;
}

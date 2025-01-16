import { IsNotEmpty, IsInt, IsArray, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}

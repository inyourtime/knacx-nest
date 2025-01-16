import { IsInt, IsNumber, IsString, Length, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  description: string;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  })
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}

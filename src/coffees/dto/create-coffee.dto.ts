import { IsString } from 'class-validator';

export class CreateCoffeeDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly brand: string;
  // 字符串数组
  @IsString({
    each: true,
  })
  readonly flavors: string[];
}

import { Injectable } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  findAll() {
    console.log('1');
  }
  findOne(id: number) {
    console.log(id);
  }
  create(createCoffeeDto: CreateCoffeeDto) {
    console.log(createCoffeeDto);
  }
  update(id: number, updateCofferDto: UpdateCoffeeDto) {
    console.log(id);
  }
  remove(id: number) {
    console.log(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly cofferRepository: Repository<Coffee>,
  ) {}
  findAll() {
    return this.cofferRepository.find();
  }
  async findOne(id: number) {
    const coffee = await this.cofferRepository.findOne({
      where: {
        id,
      },
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }
  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this.cofferRepository.create(createCoffeeDto);
    return this.cofferRepository.save(coffee);
  }
  async update(id: number, updateCofferDto: UpdateCoffeeDto) {
    const coffee = await this.cofferRepository.preload({
      id,
      ...updateCofferDto,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.cofferRepository.save(coffee);
  }
  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.cofferRepository.remove(coffee);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly cofferRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
  ) {}
  findAll() {
    return this.cofferRepository.find({
      relations: ['flavors'],
    });
  }
  async findOne(id: number) {
    const coffee = await this.cofferRepository.findOne({
      where: {
        id,
      },
      relations: ['flavors'],
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }
  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    const coffee = this.cofferRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.cofferRepository.save(coffee);
  }
  async update(id: number, updateCofferDto: UpdateCoffeeDto) {
    const flavors =
      updateCofferDto.flavors &&
      (await Promise.all(
        updateCofferDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));
    const coffee = await this.cofferRepository.preload({
      id,
      ...updateCofferDto,
      flavors,
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
  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: {
        name,
      },
    });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }
}

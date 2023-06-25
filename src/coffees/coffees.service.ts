import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { DataSource, Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';
import { PaginationQuery } from './dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';

@Injectable({
  // 请求了才会被初始化
  scope: Scope.REQUEST,
})
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly cofferRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private dataSource: DataSource,
  ) {}
  findAll(paginationQuery: PaginationQuery) {
    const { limit, offset } = paginationQuery;
    return this.cofferRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
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

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations += 1;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = {
        coffeeId: coffee.id,
      };
      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);
      await queryRunner.commitTransaction();
      return coffee;
    } catch (error) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
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

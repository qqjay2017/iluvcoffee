import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flavor } from './flavor.entity';

@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  brand: string;

  @JoinTable()
  @ManyToMany((type) => Flavor, (flavor) => flavor.coffees, {
    // 级联插入
    cascade: true, // ['insert']
  })
  flavors: Flavor[];
}

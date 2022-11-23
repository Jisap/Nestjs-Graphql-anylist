import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('listItems')
@ObjectType()
export class ListItem {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number )
  quantity: number;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  completed: boolean;

  // Relaciones

  // Muchas listas de artículos pueden estar en una lista de un usuario -> ManyToOne
  @ManyToOne(() => List, (list) => list.listItem, { lazy: true })
  @Field(() => List)
  list: List;

  // Muchas listas de artículos solo pueden tener items únicos
  @ManyToOne(() => Item, (item) => item.listItem, { lazy: true } )
  @Field(() => Item)
  item:Item;
}

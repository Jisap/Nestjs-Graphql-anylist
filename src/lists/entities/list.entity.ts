import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListItem } from 'src/list-item/entities/list-item.entity';

@Entity({name: 'lists'})
@ObjectType()
export class List {

  @PrimaryGeneratedColumn('uuid')
  @Field( () => ID )
  id:string;

  @Column()
  @Field( () => String )
  name:string;

  // relacion, index('userId-list-index')
  // Muchas listas podrán estar en un usuario
  // list se va a relacionar con la entidad user // El campo resultante sera user.lists
  @ManyToOne(() => User, (user) => user.lists, { nullable: false, lazy: true })
  @Index('userId-list-index')
  @Field(() => User)
  user: User;

  // Una lista de un usuario puede tener muchas list de artículos -> OneToMany
  @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
  //@Field(() => [ListItem])                                                          // Lo gestionamos a través de un resolveField
  listItem: ListItem;
}

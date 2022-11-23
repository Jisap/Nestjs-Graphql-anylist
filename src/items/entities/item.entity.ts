import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListItem } from 'src/list-item/entities/list-item.entity';

@Entity({name: 'items'})
@ObjectType()
export class Item {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID )
  id: string;

  @Column()
  @Field(() => String )
  name: string;

  // @Column()
  // @Field(() => Float )
  // quantity: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true } )
  quantityUnits?: string;

  // Muchos items pueden estar en la lista de un usuario
  // items se va a relacionar con la entidad User, // definimos que campo vamos a usar para definir esta relación
  @ManyToOne(() => User, ( user ) => user.items, { nullable: false, lazy: true } )  // typeorm // lazy: Cuando se haga una consulta sobre items tambien me traera info sobre los users
  @Index('userId-index')                                                // Añadimos un índice para hacer más rápidas las consultas
  @Field(() => User )                                                   // Graphql 
  user:User                                                             // typeorm 

  // El item puede estar en varios list-items
  @OneToMany(() => ListItem, ( listItem ) => listItem.item, { lazy: true })
  @Field(() => [ListItem])
  listItem: ListItem[]
}

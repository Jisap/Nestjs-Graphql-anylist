import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './../../items/entities/item.entity';
import { List } from './../../lists/entities/list.entity';


@Entity({name: 'users'})
@ObjectType()
export class User {
 
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  fullName: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column()
  //@Field(() => String) // No se coloca para que no se puedan hacer querys sobre las passwords
  password: string;

  @Column({
    type: 'text',
    array: true,
    default: ['user']
  })
  @Field(() => [String])
  roles: string[];

  @Column({ 
    type: 'boolean',
    default: true
  })
  @Field(() => Boolean )
  isActive: boolean;

  //Relaciones
  //Muchos usuarios son modificados por uno       
  @ManyToOne( () => User, (user) => user.lastUpdateBy, { nullable: true, lazy: true })  // Un user modifica a otros users creando lastUpdatedBy
  @JoinColumn({ name: 'lastUpdateBy'})
  @Field(() => User, { nullable: true })
  lastUpdateBy?:User;

  //Un usuario puede tener muchos items en su lista 
  //User se va a relacionar con la entidad Item // El campo resultante de la relación será item.user
  @OneToMany( () => Item, ( item ) => item.user, { lazy:true } )
  //@Field( () => [Item] )                                          // Suprimimos este campo en graphql para gestionarlo a través de un custom resolver
  items: Item[]                                                     // llamado getItemByUser de users.resolvers

  //Un usuario puede tener muchas listas
  //User se va a relacionar con List // El campo resultante de la relación será list.user
  @OneToMany(() => List, (list) => list.user)
  //@Field( () => [List] )
  lists: List[];

}


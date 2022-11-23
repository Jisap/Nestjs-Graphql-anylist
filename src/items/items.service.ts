import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { User } from '../users/entities/user.entity';
import { Item } from './entities/item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';



@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository( Item )
    private readonly itemsRepository: Repository<Item>                // Inyeccción de instancia de tipo Item
  ){}

  async create(createItemInput: CreateItemInput, user:User): Promise<Item> {  // El servicio usa la función create que recibe el dto createItemInput y user que añade el item a su lista
    const newItem = this.itemsRepository.create({ ...createItemInput, user }) // Instancia de tipo Item con el contenido del ...dto, más el user que lo creo
    return await this.itemsRepository.save( newItem );                        // Grabamos en bd dicha instancia 
  }

  async findAll( 
    user:User, 
    paginationArgs:PaginationArgs,
    searchArgs: SearchArgs
    ):Promise<Item[]> {
    // Filtrar, paginar
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    // return this.itemsRepository.find({  // Devuelve todos los items
    //   take: limit,                      // limitado a un nº determinado de items
    //   skip: offset,                     // saltando a una posición determinada de item en la lista
    //   where: {                          // donde
    //     user: {                         // el usuario de bd
    //       id: user.id                   // sea igual a usuario que vienen como argumento ( jwt de de los headers )
    //     },
    //     name: Like(`%${search }%`)      // Y el name del item sea parecido al término de busqueda
    //   }
    // })
    
    const queryBuilder = this.itemsRepository.createQueryBuilder() // Sistema alternativo de query idéntico al anterior pero más corto que devoverá todos los items
      .take( limit )                                               // con un cierto límite 
      .skip( offset )                                              // un cierto salto de items 
      .where(`"userId" = :userId`, { userId: user.id })            // donde el usuario de bd (userId) = al usuario que viene como args jwt en los headers ( user.id )

    if( search ) {                                                 // Y si existe el término de busqueda
      queryBuilder.andWhere( 'LOWER(name) like :name', { name: `%${ search.toLowerCase() }%`}) // donde
    }             // el name del item en minúsculas en bd sea parecido al término de busqueda

    return queryBuilder.getMany()
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ 
      id,                                                                 // Instancia tipo item según id del item
      user: {                                                             // pertenecientes al usuario logueado
        id: user.id
    } })                     
    if ( !item ) throw new NotFoundException(`Item with id: ${ id } not found`)

    //item.user = user

    return item;
  }

  async update( id: string, updateItemInput: UpdateItemInput, user:User ): Promise<Item> {
    await this.findOne( id, user )                                            // Buscamos un item que le pertenezca al usuario logueado
    const item = await this.itemsRepository.preload( updateItemInput )        // Creamos una instancia del item, si el item existe se actualiza
    if (!item) throw new NotFoundException(`Item with id: ${id} not found`)
    return this.itemsRepository.save( item )                                  // Acontinuación se graba en bd
  }

  async remove(id: string, user:User):Promise<Item> {
    //TODO: soft delete, intregidad referencial
    const item = await this.findOne( id, user );
    await this.itemsRepository.remove( item );
    return { ...item, id }
  }

  async itemCountByUser( user:User ):Promise<number> {  // Número de items que tiene los usuarios de la tabla item
    return this.itemsRepository.count({                 // Contamos el número de items de toda la tabla
      where:{                                           // donde
        user:{                                          // el usuario de bd en la tabla de item (userId)
          id: user.id                                   // sea igual al usuario que viene como argumento
        }
      }// Resumiendo: Cuantas veces aparece el id de un usuario en la tabla de items
    })
  }
}

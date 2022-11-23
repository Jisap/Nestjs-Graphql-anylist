import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '../lists/entities/list.entity';
import { Repository } from 'typeorm';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository( ListItem )
    private readonly listItemsRepository: Repository<ListItem>
  ){}


  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
   
    const { itemId, listId, ...rest } = createListItemInput;
   
    const newListItem = this.listItemsRepository.create( {
      ...rest,
      item:{ id: itemId },
      list:{ id: listId }
    });

    await this.listItemsRepository.save( newListItem ) // Se graba
  
    return this.findOne( newListItem.id ); // Y despues los leemos. Esto permite cargar todas la relaciones
  }

  async findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs ):Promise<ListItem[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem') // <-- Nombre para las relaciones
      .innerJoin('listItem.item', 'item') // <--- palabra clave selecciona registros que tienen valores coincidentes en ambas tablas.
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id }); // id de listItem = id de list ( relación ManyToOne -> Muchas listas de artículos pueden estar en una lista de un usuario)
              // id de la lista de usuario en listItem (a quien pertenece en listItem) = id de lista de usuario
    if (search) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` });
    }

    return queryBuilder.getMany(); 
  }

  async countListItemsByList(list: List): Promise<number> {
    return this.listItemsRepository.count({
      where: { list: { id: list.id } } // donde el id del list = id pasado por argumento 
    });
  }

  async findOne(id: string):Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({ id });
    if(!listItem) throw new NotFoundException(`List item with id ${ id } not found`)
    return listItem;
  }

  async update(
    id: string, updateListItemInput: UpdateListItemInput
  ):Promise<ListItem> {
    
    const { listId, itemId, ...rest } = updateListItemInput;  // Lista a la que pertenece e id del item que contiene. rest= quantity, completed e id del listItem

    const queryBuilder = this.listItemsRepository.createQueryBuilder()
      .update()                                               // Actualizamos
      .set( rest )                                            // rest = id, quantity y completed
      .where('id = :id', { id })                              // donde el id que queremos actualizar en listItem sea = id del argumento
  
      // También se actualizará listId y el itemId
      if ( listId ) queryBuilder.set({ list: { id: listId }}) // Si la lista a la que pertenece el listItem existe se modifica
      if ( itemId ) queryBuilder.set({ item: { id: itemId }}) // Si el id del item que pertenece al listItem existe se modifica
    
    await queryBuilder.execute();

    return this.findOne( id );
    
    }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}

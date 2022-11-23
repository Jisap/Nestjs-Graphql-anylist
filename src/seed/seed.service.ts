import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../lists/entities/list.entity';

import { UsersService } from '../users/users.service';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { ItemsService } from '../items/items.service';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd:boolean;

    constructor(
        private readonly configService: ConfigService,
        
        @InjectRepository(Item)
        private readonly itemsRepository:Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemService: ListItemService,

    ){
        this.isProd = configService.get('STATE') === 'prod'
    }

    async executedSeed(){

        if( this.isProd ){                                               // Si estamos en producción no se podrá ejecutar el seed
            throw new UnauthorizedException('We cannot run SEED on Prod')
        }
        
        // Limpiar la base de datos
        await this.deleteDataBase();

        // Crear usuarios
        const user = await this.loadUsers();

        // Crear items
        await this.loadItems( user );

        // Crear listas
        const list = await this.loadLists( user );  // Necesitamos el usuario que la creo

        //Crear listItems
        const items = await this.itemsService.findAll( user, { limit: 15, offset: 0 }, {}); // Necesitamos los items -> necesitan tambien el usuario que lo inserto
        await this.loadListItems( list, items )

        return true;
    }

    async deleteDataBase(){

        //Borrar ListItem
        await this.listItemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        //Borrar Lists
        await this.listsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        //Borrar items
        await this.itemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        //Borrar users
        await this.usersRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUsers(): Promise<User>{

        const users = [];

        for ( const user of SEED_USERS ){
            users.push( await this.usersService.create( user ))
        }

        return users[0]
    }

    async loadItems(user:User): Promise<void>{

        const itemsPromises = []

        for (const item of SEED_ITEMS) {
            itemsPromises.push( this.itemsService.create(item, user))
        }

        await Promise.all( itemsPromises )
    }

    async loadLists( user:User ):Promise<List>{

        const lists = [];

        for (const list of SEED_LISTS) {
            lists.push(await this.listsService.create( list, user))
        }

        return lists[0]
    }

    async loadListItems( list:List, items: Item[] ){

        for( const item of items){
            this.listItemService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false : true, 
                listId: list.id,
                itemId: item.id,
            })
        }
    }
}

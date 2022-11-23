import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List } from './entities/list.entity';
import { ListItemModule } from '../list-item/list-item.module';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [
    TypeOrmModule.forFeature([ List ]),
    ListItemModule, // Importamos el modulo de ListItem para poder ejecutar el ResolveField de ListItem ( listas de art pertenecientes a lista de usuario )
  ],
  exports:[
    TypeOrmModule,
    ListsService,
  ]
})
export class ListsModule {}

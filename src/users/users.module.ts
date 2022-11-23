import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from '../items/items.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  providers: [
    UsersResolver, 
    UsersService
  ],
  imports:[
    TypeOrmModule.forFeature([ User ]),
    ItemsModule, // Para el conteo de items por usuario
    ListsModule // Para obtener las listas por usuario
  ],
  exports:[
    TypeOrmModule,        // Nos permite inyectar repositorios de usuarios
    UsersService          // Se exporta para usarlo en la creación de usuarios en el authModule
  ]
})
export class UsersModule {}

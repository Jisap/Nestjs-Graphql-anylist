import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { ItemsService } from '../items/items.service';

import { User } from './entities/user.entity';
import { Item } from '../items/entities/item.entity';


import { UpdateUserInput } from './dto/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { List } from '../lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';

// inputs -> peticiones post en el body // args -> query parameters como una petición get

@Resolver(() => User)
@UseGuards( JwtAuthGuard )                                     // Sino hay un jwt en los headers que identifique un user no dejará pasar. Si lo hay tenemos un req.user
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService
    ) {}


  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArgs,                         // Se obtienen los validRoles de los query parameters
    @CurrentUser([ValidRoles.admin]) user:User                  // Solo los usuarios que tengan el role de admin podrán obtener el listado
  ):Promise<User[]> {
    return this.usersService.findAll( validRoles.roles );
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string, // Hay que proporcionar un id válido (UUID)
    @CurrentUser([ValidRoles.admin]) user: User                 // El usuario tiene que ser admin
  ):Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User, { name: 'blockUser' } )
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string,   // Id del usuario a bloquear
    @CurrentUser([ValidRoles.admin]) user: User                   // Usuario logueado con role de admin
  ):Promise<User> {
    return this.usersService.block(id, user);                     // Pasamos al service esa id y el usuario que administra el bloqueo
  }

  @ResolveField(() => Int, { name: 'itemCount' }) // Modificación en nuestro esquema Users creando un nuevo campo 'itemCount' 
  async itemCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,   // Solo un admin puede hacer un conteo
    @Parent() user:User                                 // Obtenemos información del padre ( usuarios a los que pertencen los items )
  ): Promise<number>{  
    return this.itemsService.itemCountByUser( user )    // Esos usuarios se envían al itemService
  }
  
  @ResolveField(() => [Item], { name: 'items' })  // Modificación en nuestro esquema users para crear nuevo campo 'Items' al que poder agregar args de paginación y search
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,   // Solo un admin puede ver los items de un usuario
    @Parent() user: User,                               // Obtenemos información del padre ( usuarios que tiene item en sus listas)
    @Args() paginationArgs: PaginationArgs,             // Se pueden establecer args de paginación 
    @Args() searchArgs: SearchArgs,                     // también arg de búsqueda
  ): Promise<Item[]> {
    return this.itemsService.findAll( user, paginationArgs, searchArgs )  // Los usuarios iterados se envían al itemService  
  }

  @ResolveField(() => [List], { name: 'lists' })        // Creamos el campo lists pertenecientes al user
  async getListsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,   // Solo un admin puede ver las listas de los usuarios
    @Parent() user: User,                               // Obtenemos información del padre ( usuarios que hacen sus listas)
    @Args() paginationArgs: PaginationArgs,             // Se puede establecer paginación
    @Args() searchArgs: SearchArgs,                     // y tambien arg de busqueda
  ): Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @ResolveField(() => Int, { name: 'listCount' })       // Creamos el campo listCount en la tabla de usuarios
  async listCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User
  ): Promise<number> {
    return this.listsService.listCountByUser(user);     // Nos devuelve el nº de listas que tiene cada usuario
  }
}

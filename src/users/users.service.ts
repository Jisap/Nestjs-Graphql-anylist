import { User } from './entities/user.entity';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SignupInput } from '../auth/dto/inputs';
import { Repository } from 'typeorm';
// import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ValidRoles } from './../auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {

private logger: Logger = new Logger('UsersService');

constructor(
  @InjectRepository(User)
  private readonly usersRepository: Repository<User> // Inyección de instancias de tipo User
){}

            //email-fullname-password
  async create( signupInput: SignupInput ):Promise<User> {
    
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync( signupInput.password, 10 )
      });
      return await this.usersRepository.save( newUser )
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll( roles: ValidRoles[] ):Promise<User[]> {
    
    // No tenemos roles en la busqueda
    if ( roles.length === 0 ) return this.usersRepository.find({
      // No es necesario porque tenemos lazy en las relaciones la user.entity 
      // relations: {
      //   lastUpdateBy: true
      // }
    });

    // tenemos roles 
    return this.usersRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]') // Buscamos si la columna de roles en bd esta dentro de los roles que pasamos por parametro
      .setParameter('roles', roles) // Establecemos ese paramétro
      .getMany()  // Devolvemos el resultado
  }

  findOne( id:string ):Promise<User>{
    throw new Error(`findOne method not implemented`)
  }

  async findOneByEmail( email: string):Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email })
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        detail: `${ email } not found`
      })
    }
  }

  async findOneById( id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id })
    } catch (error) {
      this.handleDBErrors({
        code: 'error-002',
        detail: `${id} not found`
      })
    }
  }

  async update(
    id: string, 
    updateUserInput: UpdateUserInput,
    updatedBy: User
  ):Promise<User>{
    try {
      const user = await this.usersRepository.preload({         // Creamos una instancia del usuario y si existe se actualiza
        ...updateUserInput,
        id,
      }); 
      user.lastUpdateBy = updatedBy                                          
      return await this.usersRepository.save( user )
    } catch (error) {
      this.handleDBErrors({error})
    }
  }

  async block( id: string, adminUser:User ):Promise<User> {

    const userToBlock = await this.findOneById( id );
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    return await this.usersRepository.save( userToBlock )
  }

  private handleDBErrors( error: any): never { // Este método nunca devuelve un valor solo una excepción
    
    if( error.code === '23505' ){                                       // Error por correo duplicado en la creación de un usuario nuevo
      throw new BadRequestException( error.detail )
    }

    if( error.code === 'error-001'){
      throw new BadRequestException( error.detail )                     // Error por email no existente en bd para login
    }

    this.logger.error( error );
    throw new InternalServerErrorException('PLease check server logs'); // Cualquier otro tipo de error
    
  }
}

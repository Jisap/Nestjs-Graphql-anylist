import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
//import { User } from 'src/users/entities/user.entity';
import { SignupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService, // Inyección del servicio de creación de usuarios
        private readonly jwtService: JwtService      // Inyección del servicio de creación de jwt basado en el JwtModule
    ){}

    private getJwtToken( userId:string ){
        return this.jwtService.sign({ id: userId }); // Usamos el service del jwtModule para crear un jwt en base a un id
    
    }

    async signup( singupInput: SignupInput):Promise<AuthResponse>{

        //Crear un usuario
        const user = await this.usersService.create( singupInput )

        //Crear JWT
        const token = this.getJwtToken( user.id )

        return { 
            token,
            user
        }
    }

    async login( loginInput:LoginInput ):Promise<AuthResponse> {

        const { email, password } = loginInput;
        const user = await this.usersService.findOneByEmail( email );
                                // front   // bd    
        if( !bcrypt.compareSync( password, user.password )){
            throw new BadRequestException('Email/Password do not match');
        }

        const token = this.getJwtToken(user.id)

        return{ 
            token,
            user
        }
    }

    async validateUser( id: string ): Promise<User>{

        const user = await this.usersService.findOneById( id )  // Se busca un usuario en base a un id contenido en un jwt
        
        if( !user.isActive )
            throw new UnauthorizedException(`User is inactive, talk with and admin`)
        
        delete user.password;

        console.log({user})

        return user
    }

    revalidateToken( user: User ): AuthResponse {

        const token = this.getJwtToken( user.id )

        return{ 
            token, user
        }
    }
}

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/entities/user.entity";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){  // Esta clase define la estrategia del jwt que por defecto tiene el
                                                                // nombre de 'jwt'
   constructor(
      private readonly authService: AuthService,
      configService: ConfigService,
   ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),               // Llave que utilizaremos para firmar/leer los tokens
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()    // Donde van a ir los tokens ( headers )
        })
     }

     async validate( payload: JwtPayload ): Promise<User>{              // Devolución de un usuario en base a un payload validado
        
      const { id } = payload;                                           // Del payload contenido en los header obtenemos el id
      const user = await this.authService.validateUser( id )            // Con ese id obtenemos el usuario
      return user; // req.user                                          // Lo retornamos al siguiente decorador como req.user.

     
     }
}
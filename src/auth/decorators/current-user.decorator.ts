import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "../../users/entities/user.entity";
import { ValidRoles } from "../enums/valid-roles.enum";


export const CurrentUser = createParamDecorator( 

    ( roles:ValidRoles[]=[], context: ExecutionContext ) => {                       // Recibimos los roles y el usuario validado del JwtStrategy

        const ctx = GqlExecutionContext.create( context )                           // Contexto cambiado a tipo graphql
        const user: User = ctx.getContext().req.user;                               // Obtención del usuario contenido en el contexto

        if(!user ){
            throw new InternalServerErrorException('No user inside the request')    // Si no existe el user mensaje de error
        }

        if( roles.length === 0 ) return user;                                       // Si existe el user y no lleva role dejamos pasar la petición y retornamos el user    

        for ( const role of user.roles ){                                           // Si existe el usr y lleva role comprobamos que sea alguno de los permitidos
            if( roles.includes( role as ValidRoles )){                      
                return user                                                         // En caso afirmativo retornamos el user y dejamos pasar la petición    
            }
        }

        throw new ForbiddenException(
            `User ${ user.fullName } need a valid role as [${ roles }]`   // Sino hay validRoles mensaje de error.
        )
})
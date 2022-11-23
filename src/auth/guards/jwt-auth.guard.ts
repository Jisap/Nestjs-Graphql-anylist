import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

// Los guards determinan si una solicitud dada será manejada por el controlador de ruta o no,
// dependiendo de ciertas condiciones.

// Dado que GraphQL recibe un tipo diferente de datos en la solicitud entrante, 
// el contexto de ejecución que reciben tanto los guards como los interceptores es algo diferente con GraphQL frente a REST.
// Los resolvers de GraphQL tienen un conjunto distinto de argumentos: root, args, context e info.
// Por lo tanto, los guards e interceptores deben transformar el genérico ExecutionContext en un GqlExecutionContext

export class JwtAuthGuard extends AuthGuard('jwt') {          // Guard personalizado basado en AuthGuard de nestjs/passport
                                                              // usando la estrategia 'jwt' -> validate  
                                                              // Básicamente el payload contenido en los headers pasa a la
                                                              // función validate del jwt.strategy

    getRequest( context: ExecutionContext ){                  // El contexto que maneja nest (headers y params de la ruta) por defecto es de tipo Rest
        const ctx = GqlExecutionContext.create( context );    // Ese contexto lo cambiamos a un tipo que lo entienda graphql     
        const request = ctx.getContext().req;                 // Todas las solicitudes (request) que pasen por el JwtAuthGuard tendran una nomenclatura 
        return request;                                       // Graphql y pasarán a la func. validate del jwtStrategy              
    }

}
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';
import { ItemsModule } from './items/items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ListsModule } from './lists/lists.module';
import { ListItemModule } from './list-item/list-item.module';



@Module({
  imports: [

    ConfigModule.forRoot(),                                          // Configuración para variables de entorno

    
    
    
    // GraphQLModule.forRoot<ApolloDriverConfig>({                   // Configuracion básica del modulo graphql
    //   driver: ApolloDriver,
    //   // debug: false,
    //   playground: false,
    //   plugins: [ApolloServerPluginLandingPageLocalDefault],
    //   autoSchemaFile: join( process.cwd(), 'src/schema.gql'),
    // }),


    GraphQLModule.forRootAsync({                                      // Configuracion del módulo graphql con bloqueo de esquema 
      driver: ApolloDriver,
      imports:[ AuthModule ],                                               // Importamos el AuthModule
      inject:[ JwtService ],                                                // Inyectamos su servicio JwtService
      useFactory: async( jwtService: JwtService ) => ({                     // Cuando se haya cargado se ejecturán los valores de las siguientes dependencias
          playground: false,                                                // IDE de gql apagado
          plugins: [ApolloServerPluginLandingPageLocalDefault],             // IDE Apolo activado
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),              // Generación automática del esquema graphql en base a un context (querys, mutaciones, headers, args)
          context({ req }){                                                 // Obtendremos el context y vincularemos su carga a la obtención
            
            // const token = req.headers.authorization?.replace('Bearer ',''); // del token
            // if(!token) throw new Error('Token needed')

            // const payload = jwtService.decode( token ) // id, iat, exp      // y su carga útil 
            // if (!payload) throw new Error('Token not valid')
          }                                                                    // Sino se obtienen no se podrá cargar el esquema por falta de contexto  
      })
    }),


    
    TypeOrmModule.forRoot({    // Para la integración con bases de datos SQL y NoSQL, Nest proporciona el @nestjs/typeorm paquete
      type: 'postgres',        // typeOrm permite la interacción entre nuestras entitys y nuestra base de datos
      // ssl: ( process.env.STATE === 'prod' )
      //   ? { rejectUnauthorized: false,
      //       sslmode: 'require'
      //     }
      //   : false as any,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),

    ItemsModule,

    UsersModule,

    AuthModule,

    SeedModule,

    CommonModule,

    ListsModule,

    ListItemModule,
  ],
  
  controllers: [],
  providers: [],
})
export class AppModule {

  // constructor(){
  //   console.log("Control de variables")
  //   console.log("STATE", process.env.STATE)
  //   console.log("host", process.env.DB_HOST)
  //   console.log("port", +process.env.DB_PORT)
  //   console.log("username", process.env.DB_USERNAME)
  //   console.log("password", process.env.DB_PASSWORD)
  //   console.log("database", process.env.DB_NAME)
  // }
}

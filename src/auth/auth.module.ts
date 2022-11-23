import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [AuthResolver, AuthService, JwtStrategy],
  exports: [ JwtStrategy, PassportModule, JwtModule ],
  imports:[

    ConfigModule,   // Importación del ConfigModule para usar las variables de entorno

    UsersModule,     // Importamos de UsersModule lo que ese modulo exporta -> UsersService
  
    PassportModule.register({ defaultStrategy: 'jwt' }), // Módulo para implementar la estrategia de autenticación por JWT
  
    JwtModule.registerAsync({                             // Configuración del JwtModule
      imports: [ ConfigModule ],                          // Usará las env
      inject: [ ConfigService ],                          // a través del ConfigService. 
      useFactory: (configService:ConfigService) => {      // Y para ello utilizará un proveedor dinámico que devolverá 
        return{
          secret: configService.get('JWT_SECRET'),        // la env que necesita JWT
          signOptions: {                                  // y las opciones de su duración
            expiresIn: '4h'
          }
        }
      }
    })
  ]
})
export class AuthModule {}

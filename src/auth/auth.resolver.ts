import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignupInput, LoginInput, } from './dto/inputs';
import { ValidRoles } from './enums/valid-roles.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {

  constructor(private readonly authService: AuthService) {}

  @Mutation( () => AuthResponse, { name: 'signup' })    // Signup
  async signup(
    @Args('signupImput') signupInput:SignupInput
  ):Promise<AuthResponse> {
    return this.authService.signup( signupInput)
  }


  @Mutation( () => AuthResponse, { name: 'login' })     // Login
  async login(
    @Args('loginImput') loginInput:LoginInput
  ): Promise<AuthResponse> {
    return this.authService.login( loginInput )
  }

  @Query( () => AuthResponse, { 'name': 'revalite' })   // En este query enviamos un jwt en los headers
  @UseGuards( JwtAuthGuard )                            // este jwt pasa al JwtAuthGuard -> jwtStrategy -> id -> validateUser -> req.user
  revalidateToken(
    @CurrentUser( /**[ValidRoles.admin]*/ ) user:User   // user = req.user y evaluación de si este usuario tiene el role de admin
  ):AuthResponse {
    return this.authService.revalidateToken( user )     // return { newtoken, user } 
    
   
  }
}

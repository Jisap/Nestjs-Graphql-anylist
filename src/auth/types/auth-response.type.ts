import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";

@ObjectType()                       
export class AuthResponse { // Esta respuesta la damos nostros como un objeto personalizado para la autenticación en los querys

    @Field(() => String)
    token: string;

    @Field(() => User)
    user: User;
}
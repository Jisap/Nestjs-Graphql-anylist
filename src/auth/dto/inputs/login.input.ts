import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()                        // Esperamos que el frontend nos de información de este tipo (inputs)
export class LoginInput {

    @Field(() => String)
    @IsEmail()
    email: string;

    @Field(() => String)
    @MinLength(6)
    password:string
}

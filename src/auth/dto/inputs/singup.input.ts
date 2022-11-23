import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

@InputType()                        // Esperamos que el frontend nos de información de este tipo (inputs)
export class SignupInput {

    @Field(() => String)
    @IsEmail()
    email: string;

    @Field(() => String)
    @IsNotEmpty()
    fullName:string;

    @Field(() => String)
    @MinLength(6)
    password:string
}

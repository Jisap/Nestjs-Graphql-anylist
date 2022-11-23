import { ArgsType, Field } from "@nestjs/graphql";
import { IsArray } from "class-validator";
import { ValidRoles } from "../../../auth/enums/valid-roles.enum";

@ArgsType()                     // Decorador que marca una clase como un tipo de argumento de resolver
export class ValidRolesArgs {

    @Field( () => [ValidRoles], { nullable: true }) //gql
    @IsArray()
    roles: ValidRoles[] = [];                       //ts
}

import { registerEnumType } from "@nestjs/graphql";



export enum ValidRoles {        // Tipo enum de graphql para ValidRoles
    admin = 'admin',            // que detalla que roles son válidos
    user = 'user',
    superUser = 'superUser'
}

registerEnumType( ValidRoles, { name: 'ValidRoles', description: 'Enumeración de roles permitidos'})

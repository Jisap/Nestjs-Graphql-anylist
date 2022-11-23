import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from '../items/items.module';
import { ListItemModule } from '../list-item/list-item.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports:[
    ConfigModule,
    ItemsModule,
    ListItemModule,
    ListsModule,
    UsersModule,
  ]
})
export class SeedModule {}

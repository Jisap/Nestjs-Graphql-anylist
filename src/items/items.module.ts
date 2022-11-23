import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Item } from './entities/item.entity';
import { ItemsService } from './items.service';
import { ItemsResolver } from './items.resolver';

@Module({
  providers: [
    ItemsResolver,
     ItemsService
  ],
  imports:[
    TypeOrmModule.forFeature([ Item ])
  ],
  exports:[
    ItemsService,
    TypeOrmModule
  ]
})
export class ItemsModule {}

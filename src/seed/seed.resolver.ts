import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {

  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => Boolean, { name: 'executedSeed'})
  async executedSeed(): Promise<boolean>{
    return this.seedService.executedSeed();
  }
}

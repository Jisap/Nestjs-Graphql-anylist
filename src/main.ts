import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe(
      { whitelist: true,
        //forbidNonWhitelisted: true, // Evita que la gente envie más información de la que se espera según dtos
      }                               // Lo desactivamos para poder enviar el SearchArgs ademas de los PaginationsArgs
    )
  );

  await app.listen( process.env.PORT || 3000);
}
bootstrap();

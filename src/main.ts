import 'dotenv/config'

import { NestFactory } from '@nestjs/core'

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'

import { AppModule } from './app.module'

patchNestJsSwagger()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableVersioning()

  const config = new DocumentBuilder()
    .setTitle('My Game Vault')
    .setDescription('The my game vault API description')
    .setVersion('1.0')
    .addTag('games')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()

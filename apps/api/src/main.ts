import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // OpenAPI Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('BusinessOS AI — Enterprise Multi-Tenant REST API')
    .setDescription('Production-grade NestJS REST API supporting RBAC, tenant isolation, AI co-pilot tools, and Razorpay billing.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 BusinessOS NestJS Production API running at: http://localhost:${port}/api`);
  console.log(`📄 Swagger OpenAPI Documentation running at: http://localhost:${port}/api/docs`);
}

bootstrap();

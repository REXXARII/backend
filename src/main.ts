import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const databaseUrl = process.env.DATABASE_URL;
  const tenantId = process.env.CITT_TENANT_ID;
  const jwtSecret = process.env.JWT_SECRET;
  if (!databaseUrl || !tenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId)) {
    throw new Error('DATABASE_URL y un CITT_TENANT_ID UUID válido son obligatorios.');
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('CITT Stock API')
    .setDescription('Documentación oficial de los endpoints para la gestión de inventario y trazabilidad del CITT')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory); // Esto habilitará la ruta /api

  await app.listen(Number(process.env.PORT ?? 3001));
}
void bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
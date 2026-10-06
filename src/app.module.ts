import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // Usuario por defecto
      password: '99MQS.VOG', // Reemplaza esto con tu clave de pgAdmin
      database: 'citt_stock_db',
      autoLoadEntities: true,
      synchronize: false, // En false porque ya creamos las 8 tablas en pgAdmin
    }),
  ],
})
export class AppModule {}
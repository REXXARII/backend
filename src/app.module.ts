import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ItemsModule } from './modules/items/items.module';
import { LoansModule } from './modules/loans/loans.module';
import { RolesModule } from './modules/roles/roles.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';

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
    TenantsModule,
    UsersModule,
    CategoriesModule,
    LocationsModule,
    ItemsModule,
    LoansModule,
    RolesModule,
    StockMovementsModule,
  ],
})
export class AppModule {}
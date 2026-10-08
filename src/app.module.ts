import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importación de todos los módulos que se crearon en el sistema
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ItemsModule } from './modules/items/items.module';
import { LoansModule } from './modules/loans/loans.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres.whfzdcivfhganpctttjb:B.Xs_N-A6nbKE2S@aws-1-sa-east-1.pooler.supabase.com:5432/postgres', // Pon tu clave real
      autoLoadEntities: true,
      synchronize: false, // Solo para desarrollo, no usar en producción
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    // Se deben registrar cada módulo aquí para que sus rutas funcionen
    TenantsModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    LocationsModule,
    ItemsModule,
    LoansModule,
    StockMovementsModule,
  ],
})
export class AppModule {}
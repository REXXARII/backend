import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ItemsModule } from './modules/items/items.module';
import { LoansModule } from './modules/loans/loans.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { NeonModule } from './modules/neon/neon.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard, RolesGuard } from './auth/auth.guards';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      ssl: process.env.DATABASE_SSL === 'false'
        ? false
        : {
            rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
          },
      extra: {
        options: `-c app.tenant_id=${process.env.CITT_TENANT_ID}`,
      },
    }),
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    LocationsModule,
    ItemsModule,
    LoansModule,
    StockMovementsModule,
    NeonModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

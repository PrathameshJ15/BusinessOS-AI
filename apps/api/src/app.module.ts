import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { BookingsModule } from './bookings/bookings.module';
import { MarketingModule } from './marketing/marketing.module';
import { WebsitesModule } from './websites/websites.module';
import { AIModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    AuthModule,
    CustomersModule,
    BookingsModule,
    MarketingModule,
    WebsitesModule,
    AIModule,
    DashboardModule,
    TasksModule,
  ],
})
export class AppModule {}

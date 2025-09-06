import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

const connectionString = process.env.DB_CONNECTION ?? '';

@Module({
  imports: [MongooseModule.forRoot(connectionString), UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

const ConfigModuleWithOptions = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
  validationSchema: Joi.object({
    DB_CONNECTION: Joi.string().required(),
    PORT: Joi.number().port().default(3002),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
    FRONTEND_URL: Joi.string().required(),
  }),
});

@Module({
  imports: [
    ConfigModuleWithOptions,
    MongooseModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CONNECTION'),
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

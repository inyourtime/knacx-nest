import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.getOrThrow('DB_HOST_1'),
            port: configService.getOrThrow('DB_PORT_1'),
            username: configService.getOrThrow('DB_USER_1'),
            password: configService.getOrThrow('DB_PASSWORD_1'),
            database: configService.getOrThrow('DB_NAME_1'),
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            synchronize: configService.getOrThrow('DB_SYNC_1') === 'true',
            namingStrategy: new SnakeNamingStrategy(),
          }),
        }),
        TypeOrmModule.forRootAsync({
          name: 'secondary',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.getOrThrow('DB_HOST_2'),
            port: configService.getOrThrow('DB_PORT_2'),
            username: configService.getOrThrow('DB_USER_2'),
            password: configService.getOrThrow('DB_PASSWORD_2'),
            database: configService.getOrThrow('DB_NAME_2'),
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            synchronize: configService.getOrThrow('DB_SYNC_2') === 'true',
            namingStrategy: new SnakeNamingStrategy(),
          }),
        }),
      ],
    };
  }
}

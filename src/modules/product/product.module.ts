import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/database/typeorm/entities/product.entity';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), BullModule.registerQueue({ name: 'product' })],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/database/typeorm/entities/product.entity';
import { Workbook } from 'exceljs';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create({ ...createProductDto });
    return this.productRepository.save(product);
  }

  async findAll() {
    const cache = await this.cacheManager.get('products');
    if (cache) {
      console.log('from cache');
      return cache;
    }

    const products = await this.productRepository.find();
    await this.cacheManager.set('products', products);

    return products;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { affected } = await this.productRepository.update(id, updateProductDto);
    if (affected === 0) {
      throw new BadRequestException();
    }
  }

  async remove(id: number) {
    const { affected } = await this.productRepository.softDelete(id);
    if (affected === 0) {
      throw new BadRequestException();
    }
  }

  async exportCsv() {
    const products = await this.productRepository.find({});

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Stock', key: 'stock', width: 10 },
    ];

    worksheet.addRows(products);

    return workbook.csv.writeBuffer();
  }
}

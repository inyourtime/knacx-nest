import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from 'src/database/typeorm/entities/product.entity';
import { Order } from 'src/database/typeorm/entities/order.entity';
import { OrderItem } from 'src/database/typeorm/entities/order-item.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(userId: number, { orderItems }: CreateOrderDto) {
    return this.dataSource.transaction(async (tx) => {
      let totalPrice = 0;

      const items = await Promise.all(
        orderItems.map(async ({ productId, quantity }) => {
          const product = await tx.findOne(Product, { where: { id: productId } });
          if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
          }

          if (product.stock < quantity) {
            throw new UnprocessableEntityException(
              `Insufficient stock for product ID ${productId}`,
            );
          }

          totalPrice += product.price * quantity;

          return { product, quantity, price: product.price };
        }),
      );

      const order = tx.create(Order, { user: { id: userId }, totalPrice });
      const savedOrder = await tx.save(Order, order);

      const orderItemsEntries = items.map((item) =>
        tx.create(OrderItem, {
          order: savedOrder,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }),
      );

      await tx.save(OrderItem, orderItemsEntries);

      await Promise.all(
        items.map((item) =>
          tx.update(Product, item.product.id, {
            stock: item.product.stock - item.quantity,
          }),
        ),
      );

      return tx.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['order_items', 'order_items.product'],
      });
    });
  }

  async findAll(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: {
        orderItems: {
          product: true,
        },
      },
    });
  }

  async findOne(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: {
        orderItems: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}

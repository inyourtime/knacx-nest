import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/common/auth/jwt/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.orderService.create(req.user.userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@Req() req) {
    return this.orderService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orderId')
  findOne(@Param('orderId') orderId: string, @Req() req) {
    return this.orderService.findOne(req.user.userId, +orderId);
  }
}

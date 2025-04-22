import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateOrderDto,
  FindOrdersDto,
  UpdateOrderDto,
} from '../dto/order.dto';
import { OrderService } from '../service/order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto); // was createOrder
  }

  @Get()
  async findAll(@Query() query: FindOrdersDto) {
    return this.orderService.findAll(query); // was findOrders
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id); // was findOrderById
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto); // was updateOrder
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderService.remove(id); // was deleteOrder
  }
}

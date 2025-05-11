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
    return this.orderService.create(dto);
  }

  @Get()
  async findAll(@Query() query: FindOrdersDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}

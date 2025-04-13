import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Put,
    Patch,
    Delete,
  } from '@nestjs/common';
  import { OrderService } from '../service/order.service';
  import { CreateOrderDto, UpdateOrderDto, FindOrdersDto } from '../dto/order.dto';
  
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
  
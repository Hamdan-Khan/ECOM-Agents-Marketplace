import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from 'src/database/entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto, FindOrdersDto } from 'src/dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  // Create Order
  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = this.orderRepository.create(createOrderDto);
    await this.orderRepository.save(order);
    return this.toResponseDto(order);
  }

  // Find All Orders with Pagination
  async findAll(findOrdersDto: FindOrdersDto): Promise<{ items: OrderResponseDto[]; total: number; page: number; limit: number; pages: number }> {
    // Ensure default values for pagination
    const { page = 1, limit = 10, payment_status, order_type, user_id, agent_id } = findOrdersDto;

    const [items, total] = await this.orderRepository.findAndCount({
      where: { payment_status, order_type, user_id, agent_id },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(this.toResponseDto),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // Find One Order
  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },  // This is the correct syntax as per your working example
    });
    if (!order) {
      throw new Error('Order not found');
    }
    return this.toResponseDto(order);
  }

  // Update Order
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    await this.orderRepository.update(id, updateOrderDto);
    const updatedOrder = await this.orderRepository.findOne({
      where: { id },
    });
    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    return this.toResponseDto(updatedOrder);
  }

  // Remove Order
  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }

  // Convert to Response DTO
  private toResponseDto(order: OrderEntity): OrderResponseDto {
    return {
        id: order.id,
        user_id: order.user_id,
        agent_id: order.agent_id,
        payment_status: order.payment_status,
        order_type: order.order_type,
        price: order.price,
        transaction_id: order.transaction_id,
        created_by: order.created_by,
        created_at: order.created_at,
        updated_at: order.updated_at,
      };
      
  }
}

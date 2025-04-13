import { PaymentStatus, OrderType } from 'src/database/entities/order.entity';

// Base DTO with common properties
export class BaseOrderDto {
  user_id: string;
  agent_id: string;
  payment_status: PaymentStatus;
  order_type: OrderType;
  price: number;
  transaction_id: string;
}

// DTO for creating a new order
export class CreateOrderDto extends BaseOrderDto {
  created_by: string; // ID of the user who creates the order
}

// DTO for updating an existing order
export class UpdateOrderDto {
  payment_status?: PaymentStatus;
  order_type?: OrderType;
  price?: number;
  transaction_id?: string;
}

// DTO for returning order data to clients (response)
export class OrderResponseDto extends BaseOrderDto {
  id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// DTO for pagination and filtering
export class FindOrdersDto {
  page?: number = 1;
  limit?: number = 10;
  payment_status?: PaymentStatus;
  order_type?: OrderType;
  user_id?: string;  // Filter by user
  agent_id?: string; // Filter by agent
  minPrice?: number; // Optional filter for minimum price
  maxPrice?: number; // Optional filter for maximum price
  query?: string; // Optional search term for any field (e.g., transaction_id)
}

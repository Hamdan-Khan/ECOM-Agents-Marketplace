import {
  PaymentGateway,
  PaymentStatus,
} from '../database/entities/payment.entity';

// Base DTO with common properties
export class BasePaymentDto {
  order_id: string;
  user_id: string;
  payment_gateway: PaymentGateway;
  amount: number;
  transaction_id: string;
}

// DTO for payment creation
export class CreatePaymentDto extends BasePaymentDto {
  payment_status?: PaymentStatus = PaymentStatus.PENDING;
}

// DTO for updating payment information
export class UpdatePaymentDto {
  payment_status?: PaymentStatus;
}

// DTO for payment responses
export class PaymentResponseDto {
  id: string;
  order_id: string;
  user_id: string;
  payment_gateway: PaymentGateway;
  payment_status: PaymentStatus;
  amount: number;
  transaction_id: string;
  created_at: Date;

  // Include related entities when needed
  order?: any;
  user?: any;
}

// DTO for finding payments with pagination and filters
export class FindPaymentsDto {
  page?: number = 1;
  limit?: number = 10;
  user_id?: string;
  order_id?: string;
  payment_status?: PaymentStatus;
  payment_gateway?: PaymentGateway;
  date_from?: Date;
  date_to?: Date;
}

// DTO for payment status update
export class UpdatePaymentStatusDto {
  payment_status: PaymentStatus;
}

// DTO for payment verification
export class VerifyPaymentDto {
  transaction_id: string;
  payment_gateway: PaymentGateway;
}

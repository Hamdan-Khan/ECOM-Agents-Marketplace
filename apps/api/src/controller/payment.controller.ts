import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentStatus } from '../database/entities/payment.entity';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  UpdatePaymentDto,
} from '../dto/payment.dto';
import { PaymentService } from '../service/payment.service';

@Controller('payments')
// @UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  async findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentService.findAll();
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.findByUser(userId);
  }

  @Get('order/:orderId')
  async findByOrder(
    @Param('orderId') orderId: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.findByOrder(orderId);
  }

  @Get('transaction/:transactionId')
  async findByTransactionId(
    @Param('transactionId') transactionId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.findByTransactionId(transactionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.updatePaymentStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.paymentService.remove(id);
  }
}

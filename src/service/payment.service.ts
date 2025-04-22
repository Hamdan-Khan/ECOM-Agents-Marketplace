import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaymentEntity,
  PaymentStatus,
} from '../database/entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      relations: ['order', 'user'],
    });
  }

  async findByUser(userId: string): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: { user_id: userId },
      relations: ['order'],
    });
  }

  async findByOrder(orderId: string): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: { order_id: orderId },
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'user'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    const payment = await this.findOne(id);
    const updatedPayment = Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(updatedPayment);
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<PaymentEntity> {
    const payment = await this.findOne(id);
    payment.payment_status = status;
    return this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  async findByTransactionId(transactionId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { transaction_id: transactionId },
      relations: ['order', 'user'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with transaction ID ${transactionId} not found`,
      );
    }

    return payment;
  }
}

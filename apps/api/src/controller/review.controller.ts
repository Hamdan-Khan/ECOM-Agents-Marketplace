import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateReviewDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from '../dto/review.dto';
import { ReviewService } from '../service/review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() dto: CreateReviewDto): Promise<ReviewResponseDto> {
    return await this.reviewService.create(dto);
  }

  @Get()
  async findAll(): Promise<ReviewResponseDto[]> {
    return await this.reviewService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReviewResponseDto> {
    return await this.reviewService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.reviewService.delete(id);
  }
}

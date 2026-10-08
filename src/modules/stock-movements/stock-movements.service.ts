import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
  ) {}

  async create(createMovementDto: CreateStockMovementDto) {
    // Regla de Negocio: Conversión matemática de consumibles
    const isGrams = createMovementDto.unit.toLowerCase() === 'g' || createMovementDto.unit.toLowerCase() === 'gramos';

    if (isGrams) {
      createMovementDto.quantity = createMovementDto.quantity / 1000;
      createMovementDto.unit = 'kg'; 
      createMovementDto.movement_description = `${createMovementDto.movement_description || ''} (Auto-convertido de gramos a Kg)`.trim();
    }

    const newMovement = this.movementRepository.create(createMovementDto);
    return await this.movementRepository.save(newMovement);
  }

  async findAll() {
    return await this.movementRepository.find();
  }

  async findOne(id: string) {
    const movement = await this.movementRepository.findOneBy({ id });
    if (!movement) {
      throw new NotFoundException(`El movimiento con ID ${id} no existe.`);
    }
    return movement;
  }

  async update(id: string, updateMovementDto: UpdateStockMovementDto) {
    await this.findOne(id);
    await this.movementRepository.update(id, updateMovementDto as any);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const movement = await this.findOne(id);
    return await this.movementRepository.remove(movement);
  }
}
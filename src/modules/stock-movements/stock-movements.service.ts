import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

//Este archivo define el servicio para gestionar los movimientos de stock en el sistema.
@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
  ) {}

  // crea un nuevo movimiento de stock, si la unidad es gramos, la convierte a kilogramos y ajusta la descripción
  async create(createMovementDto: CreateStockMovementDto) {
    const isGrams = createMovementDto.unit.toLowerCase() === 'g' || createMovementDto.unit.toLowerCase() === 'gramos';

    if (isGrams) {
      createMovementDto.quantity = createMovementDto.quantity / 1000;
      createMovementDto.unit = 'kg'; 
      createMovementDto.movement_description = `${createMovementDto.movement_description || ''} (Auto-convertido de gramos a Kg)`.trim();
    }

    // crea y guarda el nuevo movimiento de stock en la base de datos
    const newMovement = this.movementRepository.create(createMovementDto);
    return await this.movementRepository.save(newMovement);
  }

  // encuentra todos los movimientos de stock en la base de datos
  async findAll() {
    return await this.movementRepository.find();
  }

  // encuentra un movimiento de stock por su ID, si no existe lanza una excepción
  async findOne(id: string) {
    const movement = await this.movementRepository.findOneBy({ id });
    if (!movement) {
      throw new NotFoundException(`El movimiento con ID ${id} no existe.`);
    }
    return movement;
  }

  // actualiza un movimiento de stock por su ID, si no existe lanza una excepción
  async update(id: string, updateMovementDto: UpdateStockMovementDto) {
    await this.findOne(id);
    await this.movementRepository.update(id, updateMovementDto as any);
    return await this.findOne(id);
  }

  // elimina un movimiento de stock por su ID, si no existe lanza una excepción
  async remove(id: string) {
    const movement = await this.findOne(id);
    return await this.movementRepository.remove(movement);
  }
}
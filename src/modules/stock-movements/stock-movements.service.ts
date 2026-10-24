import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    createMovementDto.tenant_id = process.env.CITT_TENANT_ID!;
    const isGrams = createMovementDto.unit.toLowerCase() === 'g' || createMovementDto.unit.toLowerCase() === 'gramos';

    if (isGrams) {
      createMovementDto.quantity = createMovementDto.quantity / 1000;
      createMovementDto.unit = 'kg'; 
      createMovementDto.movement_description = `${createMovementDto.movement_description || ''} (Auto-convertido de gramos a Kg)`.trim();
    }
    if (!Number.isFinite(createMovementDto.quantity)) {
      throw new BadRequestException('La cantidad debe ser un número válido.');
    }

    // crea y guarda el nuevo movimiento de stock en la base de datos
    const newMovement = this.movementRepository.create({
      tenant_id: createMovementDto.tenant_id,
      item_id: createMovementDto.item_id,
      user_id: createMovementDto.user_id,
      quantity: createMovementDto.quantity.toFixed(3),
      unit: createMovementDto.unit,
      movement_description: createMovementDto.movement_description,
    });
    return await this.movementRepository.save(newMovement);
  }

  // encuentra todos los movimientos de stock en la base de datos
  async findAll() {
    return await this.movementRepository.find({ where: { tenant_id: process.env.CITT_TENANT_ID! } });
  }

  // encuentra un movimiento de stock por su ID, si no existe lanza una excepción
  async findOne(id: string) {
    const movement = await this.movementRepository.findOneBy({ id, tenant_id: process.env.CITT_TENANT_ID! });
    if (!movement) {
      throw new NotFoundException(`El movimiento con ID ${id} no existe.`);
    }
    return movement;
  }

  // actualiza un movimiento de stock por su ID, si no existe lanza una excepción
  async update(id: string, updateMovementDto: UpdateStockMovementDto) {
    await this.findOne(id);
    const fields: Partial<StockMovement> = {};
    if (updateMovementDto.item_id !== undefined) fields.item_id = updateMovementDto.item_id;
    if (updateMovementDto.user_id !== undefined) fields.user_id = updateMovementDto.user_id;
    if (updateMovementDto.quantity !== undefined) {
      if (!Number.isFinite(updateMovementDto.quantity)) {
        throw new BadRequestException('La cantidad debe ser un número válido.');
      }
      fields.quantity = updateMovementDto.quantity.toFixed(3);
    }
    if (updateMovementDto.unit !== undefined) fields.unit = updateMovementDto.unit;
    if (updateMovementDto.movement_description !== undefined) {
      fields.movement_description = updateMovementDto.movement_description;
    }
    await this.movementRepository.update({ id, tenant_id: process.env.CITT_TENANT_ID! }, fields);
    return await this.findOne(id);
  }

  // elimina un movimiento de stock por su ID, si no existe lanza una excepción
  async remove(id: string) {
    const movement = await this.findOne(id);
    return await this.movementRepository.remove(movement);
  }
}
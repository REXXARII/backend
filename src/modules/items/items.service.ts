import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

// Este archivo define el servicio para gestionar los items en el sistema.
@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  // crea un nuevo item, verificando que el código único no exista para evitar duplicados
  async create(createItemDto: CreateItemDto) {
    // Verifica si ya existe un item con el mismo código
    const existingItem = await this.itemRepository.findOneBy({ code: createItemDto.code });
    // Si el código ya existe, lanza una excepción de conflicto
    if (existingItem) {
      throw new ConflictException(`El código de activo ${createItemDto.code} ya se encuentra registrado.`);
    }

    // crea y guarda el nuevo item en la base de datos
    const newItem = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(newItem);
  }

  // encuentra todos los items en la base de datos
  async findAll() {
    return await this.itemRepository.find();
  }

  // encuentra un item por su ID, si no existe lanza una excepción
  async findOne(id: string) {
    const item = await this.itemRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`El activo con ID ${id} no existe en la base de datos.`);
    }
    return item;
  }

  // actualiza un item por su ID, si no existe lanza una excepción
  async update(id: string, updateItemDto: UpdateItemDto) {
    await this.findOne(id);
    await this.itemRepository.update(id, updateItemDto);
    return await this.findOne(id);
  }

  // elimina un item por su ID, si no existe lanza una excepción
  async remove(id: string) {
    const item = await this.findOne(id);
    return await this.itemRepository.remove(item);
  }
}
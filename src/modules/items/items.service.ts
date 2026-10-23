import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Category } from '../categories/entities/category.entity';
import { Location } from '../locations/entities/location.entity';

// Este archivo define el servicio para gestionar los items en el sistema.
@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  // crea un nuevo item, verificando que el código único no exista para evitar duplicados
  async create(createItemDto: CreateItemDto) {
    createItemDto.tenant_id = process.env.CITT_TENANT_ID!;
    // Verifica si ya existe un item con el mismo código
    const existingItem = await this.itemRepository.findOneBy({
      code: createItemDto.code,
      tenant_id: createItemDto.tenant_id,
    });
    // Si el código ya existe, lanza una excepción de conflicto
    if (existingItem) {
      throw new ConflictException(`El código de activo ${createItemDto.code} ya se encuentra registrado.`);
    }

    // crea y guarda el nuevo item en la base de datos
    const stock = createItemDto.stock === undefined ? 0 : this.parseStock(createItemDto.stock);
    const newItem = this.itemRepository.create({
      tenant_id: createItemDto.tenant_id,
      category_id: createItemDto.category_id,
      location_id: createItemDto.location_id,
      code: createItemDto.code,
      name: createItemDto.name,
      status: createItemDto.status,
      stock: stock.toFixed(3),
      unit: createItemDto.unit,
      is_consumable: createItemDto.is_consumable,
      serial_number: createItemDto.serial_number,
    });
    return await this.itemRepository.save(newItem);
  }

  // encuentra todos los items en la base de datos
  async findAll() {
    const tenantId = process.env.CITT_TENANT_ID!;
    const [items, categories, locations] = await Promise.all([
      this.itemRepository.find({ where: { tenant_id: tenantId } }),
      this.categoryRepository.find({ where: { tenant_id: tenantId } }),
      this.locationRepository.find({ where: { tenant_id: tenantId } }),
    ]);
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const locationById = new Map(locations.map((location) => [location.id, location]));

    return items.map((item) => ({
      id: item.id,
      tenant_id: item.tenant_id,
      category_id: item.category_id,
      location_id: item.location_id,
      code: item.code,
      name: item.name,
      status: item.status,
      stock: Number(item.stock),
      unit: item.unit,
      is_consumable: item.is_consumable,
      serial_number: item.serial_number,
      qr_code: item.code,
      category: item.category_id ? categoryById.get(item.category_id) ?? null : null,
      location: item.location_id ? locationById.get(item.location_id) ?? null : null,
    }));
  }

  // encuentra un item por su ID, si no existe lanza una excepción
  async findOne(id: string) {
    const item = await this.itemRepository.findOneBy({ id, tenant_id: process.env.CITT_TENANT_ID! });
    if (!item) {
      throw new NotFoundException(`El activo con ID ${id} no existe en la base de datos.`);
    }
    return item;
  }

  // actualiza un item por su ID, si no existe lanza una excepción
  async update(id: string, updateItemDto: UpdateItemDto) {
    await this.findOne(id);
    const fields: Partial<Item> = {};
    if (updateItemDto.category_id !== undefined) fields.category_id = updateItemDto.category_id;
    if (updateItemDto.location_id !== undefined) fields.location_id = updateItemDto.location_id;
    if (updateItemDto.code !== undefined) fields.code = updateItemDto.code;
    if (updateItemDto.name !== undefined) fields.name = updateItemDto.name;
    if (updateItemDto.status !== undefined) fields.status = updateItemDto.status;
    if (updateItemDto.stock !== undefined) fields.stock = this.parseStock(updateItemDto.stock).toFixed(3);
    if (updateItemDto.unit !== undefined) fields.unit = updateItemDto.unit;
    if (updateItemDto.is_consumable !== undefined) fields.is_consumable = updateItemDto.is_consumable;
    if (updateItemDto.serial_number !== undefined) fields.serial_number = updateItemDto.serial_number;
    await this.itemRepository.update(
      { id, tenant_id: process.env.CITT_TENANT_ID! },
      fields,
    );
    return await this.findOne(id);
  }

  // elimina un item por su ID, si no existe lanza una excepción
  async remove(id: string) {
    const item = await this.findOne(id);
    return await this.itemRepository.remove(item);
  }

  private parseStock(value: number) {
    const stock = Number(value);
    if (!Number.isFinite(stock) || stock < 0) {
      throw new BadRequestException('El stock debe ser un número mayor o igual que cero.');
    }
    return stock;
  }
}
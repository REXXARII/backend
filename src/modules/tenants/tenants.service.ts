import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

// Servicio para manejar la lógica de negocio relacionada con sedes, incluyendo operaciones CRUD y validaciones.
@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  // Crea una nueva sede después de verificar que no exista una sede con el mismo nombre.
  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.tenantRepository.findOneBy({ name: createTenantDto.name });
    // Si ya existe una sede con el mismo nombre, lanza una excepción de conflicto.
    if (existing) {
      throw new ConflictException(`La sede ${createTenantDto.name} ya se encuentra registrada.`);
    }
    // Crea y guarda la nueva sede en la base de datos.
    const tenant = this.tenantRepository.create(createTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  // Recupera todas las sedes existentes en la base de datos.
  async findAll() {
    return await this.tenantRepository.find();
  }

  // Recupera una sede específica por su ID, lanzando una excepción si no se encuentra.
  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`La sede con ID ${id} no existe.`);
    }
    return tenant;
  }

  // Actualiza una sede existente después de verificar que exista, y devuelve la sede actualizada.
  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id);
    await this.tenantRepository.update(id, updateTenantDto);
    return await this.findOne(id);
  }

  // Elimina una sede existente después de verificar que exista, y devuelve la sede eliminada.
  async remove(id: string) {
    const tenant = await this.findOne(id);
    return await this.tenantRepository.remove(tenant);
  }
}
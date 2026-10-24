import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

//El servicio de roles proporciona métodos para crear, leer, actualizar y eliminar roles en la base de datos, utilizando el repositorio de TypeORM para interactuar con la entidad Role.
@Injectable()
export class RolesService {

  // Inyecta el repositorio de la entidad Role para interactuar con la base de datos.
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Crea un nuevo rol en la base de datos utilizando los datos proporcionados en el DTO de creación de rol.
  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.tenant_id = process.env.CITT_TENANT_ID!;
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  // Obtiene todos los roles de la base de datos.
  async findAll() {
    const tenantId = process.env.CITT_TENANT_ID!;
    return await this.roleRepository.createQueryBuilder('role')
      .where('role.tenant_id = :tenantId', { tenantId })
      .orWhere('role.tenant_id IS NULL')
      .getMany();
  }

  // Obtiene un rol por su ID. Si no se encuentra, lanza una excepción NotFoundException.
  async findOne(id: string) {
    const role = await this.roleRepository.findOneBy({ id, tenant_id: process.env.CITT_TENANT_ID! });
    if (!role) throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    return role;
  }

  // Actualiza un rol existente por su ID utilizando los datos proporcionados en el DTO de actualización de rol. Si el rol no se encuentra, lanza una excepción NotFoundException.
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);
    await this.roleRepository.update({ id, tenant_id: process.env.CITT_TENANT_ID! }, updateRoleDto);
    return await this.findOne(id);
  }

  // Elimina un rol por su ID. Si el rol no se encuentra, lanza una excepción NotFoundException.
  async remove(id: string) {
    const role = await this.findOne(id);
    return await this.roleRepository.remove(role);
  }
}
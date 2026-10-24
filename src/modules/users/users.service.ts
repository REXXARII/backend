import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    // Inyectar el repositorio de usuarios
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Crear un nuevo usuario
  async create(createUserDto: CreateUserDto) {
    const tenantId = process.env.CITT_TENANT_ID!;
    const existing = await this.userRepository.findOneBy({ email: createUserDto.email, tenant_id: tenantId });
    if (existing) { // Verificar si el correo ya está registrado
      throw new ConflictException(`El correo ${createUserDto.email} ya está registrado.`);
    }
    const passwordHash = await hash(createUserDto.password, 12);
    const user = this.userRepository.create({
      tenant_id: tenantId,
      role_id: createUserDto.role_id,
      name: createUserDto.name,
      email: createUserDto.email,
      run: createUserDto.run,
      school: createUserDto.school,
      password_hash: passwordHash,
      is_blocked: createUserDto.is_blocked,
    });
    const saved = await this.userRepository.save(user);
    return this.findOne(saved.id);
  }

  // Obtener todos los usuarios
  async findAll() {
    const tenantId = process.env.CITT_TENANT_ID!;
    const [users, roles] = await Promise.all([
      this.userRepository.find({
        where: { tenant_id: tenantId },
        select: {
          id: true,
          tenant_id: true,
          role_id: true,
          name: true,
          email: true,
          run: true,
          school: true,
          is_blocked: true,
          created_at: true,
        },
      }),
      this.roleRepository.createQueryBuilder('role')
        .where('role.tenant_id = :tenantId', { tenantId })
        .orWhere('role.tenant_id IS NULL')
        .getMany(),
    ]);
    const roleById = new Map(roles.map((role) => [role.id, role.name]));
    return users.map(({ password_hash: _passwordHash, ...user }) => ({
      ...user,
      role: user.role_id ? roleById.get(user.role_id) ?? null : null,
    }));
  }

  // Buscar un usuario por ID
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id: process.env.CITT_TENANT_ID! },
      select: {
        id: true,
        tenant_id: true,
        role_id: true,
        name: true,
        email: true,
        run: true,
        school: true,
        is_blocked: true,
        created_at: true,
      },
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return user;
  }

  // Actualizar un usuario por ID
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const { password, ...fields } = updateUserDto;
    await this.userRepository.update(
      { id, tenant_id: process.env.CITT_TENANT_ID! },
      {
        ...fields,
        ...(password ? { password_hash: await hash(password, 12) } : {}),
      },
    );
    return await this.findOne(id);
  }

  // Eliminar un usuario por ID
  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.userRepository.remove(user);
  }
}
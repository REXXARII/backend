import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    // Inyectar el repositorio de usuarios
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crear un nuevo usuario
  async create(createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existing) { // Verificar si el correo ya está registrado
      throw new ConflictException(`El correo ${createUserDto.email} ya está registrado.`);
    }
    // Crear y guardar el nuevo usuario
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // Obtener todos los usuarios
  async findAll() {
    return await this.userRepository.find();
  }

  // Buscar un usuario por ID
  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return user;
  }

  // Actualizar un usuario por ID
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  // Eliminar un usuario por ID
  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.userRepository.remove(user);
  }
}
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// DTO para actualizar un usuario existente
export class UpdateUserDto extends PartialType(CreateUserDto) {}
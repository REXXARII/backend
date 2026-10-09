import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

//Representa un DTO para actualizar un rol, extendiendo las propiedades del DTO de creación de rol y permitiendo que todas las propiedades sean opcionales.
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
// Define el DTO (Data Transfer Object) para actualizar un item en el sistema
import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {}
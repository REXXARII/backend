import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';

// DTO para actualizar una ubicación existente
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
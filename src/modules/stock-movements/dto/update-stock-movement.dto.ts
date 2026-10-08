import { PartialType } from '@nestjs/mapped-types';
import { CreateStockMovementDto } from './create-stock-movement.dto';

//Este archivo define la estructura de datos para actualizar un movimiento de stock en el sistema. 
//Se utiliza como un DTO (Data Transfer Object) para transferir datos entre el cliente y el servidor.
export class UpdateStockMovementDto extends PartialType(CreateStockMovementDto) {}
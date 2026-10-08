//Este archivo define la estructura de datos para crear un movimiento de stock en el sistema. 
//Se utiliza como un DTO (Data Transfer Object) para transferir datos entre el cliente y el servidor.
export class CreateStockMovementDto {
  tenant_id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  unit: string;
  movement_description?: string;
}
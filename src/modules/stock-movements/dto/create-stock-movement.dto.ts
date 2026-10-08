export class CreateStockMovementDto {
  tenant_id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  unit: string;
  movement_description?: string;
}
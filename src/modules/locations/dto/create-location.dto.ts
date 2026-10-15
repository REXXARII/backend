// DTO para crear una nueva ubicación
export class CreateLocationDto {
  tenant_id: string;
  name: string;
  description?: string;
}
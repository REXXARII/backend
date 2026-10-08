// Define el DTO (Data Transfer Object) para crear un nuevo item en el sistema
export class CreateItemDto {
  tenant_id: string;
  category_id?: string;
  location_id?: string;
  code: string;
  name: string;
  status?: string;
}
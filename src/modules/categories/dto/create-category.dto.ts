//DTO (Data Transfer Object) para crear una nueva categoría, definiendo los campos necesarios para la creación de la categoría.
export class CreateCategoryDto {
  tenant_id: string;
  name: string;
}
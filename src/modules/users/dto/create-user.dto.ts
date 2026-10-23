// DTO para crear un nuevo usuario
export class CreateUserDto {
  tenant_id: string;
  role_id?: string;
  name: string;
  email: string;
  password_hash: string;
  is_blocked?: boolean;
}
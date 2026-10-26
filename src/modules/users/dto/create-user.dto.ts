// DTO para crear un nuevo usuario
export class CreateUserDto {
  role_id?: string;
  name!: string;
  email!: string;
  run!: string;
  school!: string;
  password!: string;
  is_blocked?: boolean;
}
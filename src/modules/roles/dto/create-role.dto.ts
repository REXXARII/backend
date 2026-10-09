export class CreateRoleDto {
  tenant_id?: string;
  name: string;
  permissions: Record<string, any>;
}
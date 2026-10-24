export type SessionRole = 'ADMIN' | 'AYUDANTE' | 'GLOBAL';

export interface AuthenticatedUser {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  run: string;
  role_id: string;
  role: SessionRole;
  role_name: string;
  school: string;
  is_blocked: boolean;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/roles/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import type { AuthenticatedUser, JwtPayload, SessionRole } from './auth.types';

const SCHOOLS = new Set([
  'Construcción',
  'Mecánica',
  'Administración',
  'Informática',
  'Salud',
  'Turismo',
  'Naturaleza',
]);

const ROLE_ALIASES: Record<string, SessionRole> = {
  ADMIN: 'ADMIN',
  ADMINISTRADOR: 'ADMIN',
  AYUDANTE: 'AYUDANTE',
  ALUMNO_LIDER: 'AYUDANTE',
  GLOBAL: 'GLOBAL',
  USUARIO_GLOBAL: 'GLOBAL',
};

const ROLE_LABELS: Record<SessionRole, string> = {
  ADMIN: 'Administrador',
  AYUDANTE: 'Alumno Líder',
  GLOBAL: 'Usuario Global',
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const run = this.normalizeRun(dto.run);
    if (!this.isValidRun(run) || typeof dto.password !== 'string') {
      throw new UnauthorizedException('RUN o contraseña incorrectos.');
    }

    const user = await this.users.findOne({
      where: { run, tenant_id: process.env.CITT_TENANT_ID! },
    });
    if (!user || user.is_blocked || !(await compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('RUN o contraseña incorrectos.');
    }

    return this.createSession(user);
  }

  async register(dto: RegisterDto) {
    if (
      typeof dto.name !== 'string' ||
      dto.name.trim().length < 2 ||
      dto.name.trim().length > 255 ||
      typeof dto.email !== 'string' ||
      typeof dto.password !== 'string' ||
      dto.password.length < 8 ||
      dto.password.length > 72 ||
      typeof dto.school !== 'string' ||
      !SCHOOLS.has(dto.school)
    ) {
      throw new UnprocessableEntityException('Revisa el nombre, correo, escuela y contraseña (8 a 72 caracteres).');
    }

    const run = this.normalizeRun(dto.run);
    if (!this.isValidRun(run)) {
      throw new UnprocessableEntityException('El RUN ingresado no es válido.');
    }

    const tenantId = process.env.CITT_TENANT_ID!;
    const email = dto.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new UnprocessableEntityException('El correo ingresado no es válido.');
    }

    const duplicate = await this.users.findOne({
      where: [{ run, tenant_id: tenantId }, { email, tenant_id: tenantId }],
    });
    if (duplicate) {
      throw new ConflictException('Ya existe una cuenta con ese RUN o correo.');
    }

    const globalRole = await this.findRole('GLOBAL');
    const user = this.users.create({
      tenant_id: tenantId,
      role_id: globalRole.id,
      name: dto.name.trim(),
      email,
      run,
      school: dto.school,
      password_hash: await hash(dto.password, 12),
      is_blocked: false,
    });

    return this.createSession(await this.users.save(user));
  }

  async getSessionUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.users.findOne({
      where: { id: userId, tenant_id: process.env.CITT_TENANT_ID! },
    });
    if (!user || user.is_blocked) throw new UnauthorizedException('La sesión ya no es válida.');
    const role = await this.roles.findOne({
      where: { id: user.role_id, tenant_id: process.env.CITT_TENANT_ID! },
    });
    if (!role) throw new UnauthorizedException('La cuenta no tiene un rol válido.');
    return this.toAuthenticatedUser(user, role);
  }

  private async createSession(user: User) {
    const role = await this.roles.findOne({
      where: { id: user.role_id, tenant_id: process.env.CITT_TENANT_ID! },
    });
    if (!role) throw new UnauthorizedException('La cuenta no tiene un rol válido.');

    const authenticatedUser = this.toAuthenticatedUser(user, role);
    const accessToken = await this.jwt.signAsync({
      tenantId: authenticatedUser.tenant_id,
    } satisfies Omit<JwtPayload, 'sub'>, {
      subject: user.id,
    });
    return { access_token: accessToken, user: authenticatedUser };
  }

  private async findRole(roleName: string) {
    const role = await this.roles.findOne({
      where: { name: roleName, tenant_id: process.env.CITT_TENANT_ID! },
    });
    if (!role) {
      throw new UnprocessableEntityException('Faltan los roles iniciales del sistema; ejecuta la migración de roles.');
    }
    return role;
  }

  private toAuthenticatedUser(user: User, role: Role): AuthenticatedUser {
    const roleName = role.name.toUpperCase().replace(/[\s-]+/g, '_');
    const mappedRole = ROLE_ALIASES[roleName];
    if (!mappedRole) throw new UnauthorizedException('El rol asociado a la cuenta no está habilitado.');
    return {
      id: user.id,
      tenant_id: user.tenant_id,
      name: user.name,
      email: user.email,
      run: user.run ? this.formatRun(user.run) : '',
      role_id: role.id,
      role: mappedRole,
      role_name: ROLE_LABELS[mappedRole],
      school: user.school ?? '',
      is_blocked: user.is_blocked,
    };
  }

  private normalizeRun(value: unknown) {
    if (typeof value !== 'string') return '';
    return value.replace(/[.\-\s]/g, '').toUpperCase();
  }

  private formatRun(value: string) {
    const run = this.normalizeRun(value);
    const number = run.slice(0, -1);
    return `${number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${run.slice(-1)}`;
  }

  private isValidRun(run: string) {
    return /^\d{7,8}[0-9K]$/.test(run);
  }
}

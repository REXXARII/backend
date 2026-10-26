import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../modules/roles/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let roles: { findOne: jest.Mock };
  const tenantId = '11111111-1111-4111-8111-111111111111';
  const role = {
    id: '22222222-2222-4222-8222-222222222222',
    tenant_id: tenantId,
    name: 'ADMIN',
    permissions: {},
  };

  beforeEach(async () => {
    process.env.CITT_TENANT_ID = tenantId;
    const user = {
      id: '33333333-3333-4333-8333-333333333333',
      tenant_id: tenantId,
      role_id: role.id,
      name: 'Cuenta de prueba',
      email: 'cuenta@example.com',
      run: '163216548',
      school: 'Informática',
      password_hash: await hash('correcta123', 4),
      is_blocked: false,
    };
    users = {
      findOne: jest.fn().mockResolvedValue(user),
      create: jest.fn((input) => input),
      save: jest.fn(async (input) => ({ ...input, id: user.id })),
    };
    roles = { findOne: jest.fn().mockResolvedValue(role) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(Role), useValue: roles },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    delete process.env.CITT_TENANT_ID;
  });

  it('authenticates by normalized RUN and issues a tenant-scoped session', async () => {
    const session = await service.login({ run: '16.321.654-8', password: 'correcta123' });

    expect(users.findOne).toHaveBeenCalledWith({
      where: { run: '163216548', tenant_id: tenantId },
    });
    expect(session.access_token).toBe('token');
    expect(session.user.role).toBe('ADMIN');
    expect(session.user.tenant_id).toBe(tenantId);
  });

  it('rejects invalid credentials and blocked accounts', async () => {
    await expect(service.login({ run: '16.321.654-8', password: 'incorrecta' }))
      .rejects.toThrow('RUN o contraseña incorrectos.');

    users.findOne.mockResolvedValueOnce({ is_blocked: true });
    await expect(service.login({ run: '16.321.654-8', password: 'correcta123' }))
      .rejects.toThrow('RUN o contraseña incorrectos.');
  });

  it('registers accounts with the GLOBAL role and a bcrypt password hash', async () => {
    users.findOne.mockResolvedValueOnce(null);
    roles.findOne.mockResolvedValue({
      ...role,
      id: '44444444-4444-4444-8444-444444444444',
      name: 'GLOBAL',
    });

    const session = await service.register({
      name: ' Nueva Cuenta ',
      email: 'NUEVA@example.com',
      run: '20.123.456-K',
      school: 'Construcción',
      password: 'nueva1234',
    });
    const savedUser = users.create.mock.calls[0][0] as User;

    expect(savedUser.role_id).toBe('44444444-4444-4444-8444-444444444444');
    expect(savedUser.name).toBe('Nueva Cuenta');
    expect(savedUser.email).toBe('nueva@example.com');
    expect(await compare('nueva1234', savedUser.password_hash)).toBe(true);
    expect(session.user.role).toBe('GLOBAL');
  });
});

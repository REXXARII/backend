import 'dotenv/config';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Role } from '../src/modules/roles/entities/role.entity';
import { User } from '../src/modules/users/entities/user.entity';

const tenantId = process.env.CITT_TENANT_ID;
const demoPassword = process.env.DEMO_PASSWORD;

if (process.env.NODE_ENV !== 'development' || process.env.ALLOW_DEMO_ACCOUNTS !== 'true') {
  throw new Error('La carga de usuarios demo está deshabilitada. Requiere habilitación explícita en desarrollo local.');
}
if (!tenantId || !demoPassword || demoPassword.length < 8 || demoPassword.length > 72) {
  throw new Error('Configura CITT_TENANT_ID y un DEMO_PASSWORD de 8 a 72 caracteres.');
}

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Role],
  synchronize: false,
  ssl: process.env.DATABASE_SSL === 'false'
    ? false
    : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' },
  extra: { options: `-c app.tenant_id=${tenantId}` },
});

const demoUsers = [
  {
    name: 'Paz Constanza Morales Saavedra',
    email: 'pc.morales@profesor.duoc.cl',
    run: '16.321.654-8',
    school: 'Administración',
    role: 'ADMIN',
  },
  {
    name: 'Rocío Torres',
    email: 'rocio.torres@duocuc.cl',
    run: '19.882.112-k',
    school: 'Informática',
    role: 'AYUDANTE',
  },
  {
    name: 'Camila Soto',
    email: 'camila.soto@duocuc.cl',
    run: '18.765.432-1',
    school: 'Administración',
    role: 'GLOBAL',
  },
];

async function seedDemoUsers() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const roles = dataSource.getRepository(Role);
  const passwordHash = await hash(demoPassword!, 12);
  let created = 0;

  try {
    for (const demoUser of demoUsers) {
      const role = await roles.findOneBy({ name: demoUser.role, tenant_id: tenantId! });
      if (!role) throw new Error(`No se encontró el rol ${demoUser.role}. Ejecuta las migraciones.`);
      const existing = await users.findOne({
        where: [
          { run: demoUser.run.replace(/[.\-\s]/g, '').toUpperCase(), tenant_id: tenantId! },
          { email: demoUser.email, tenant_id: tenantId! },
        ],
      });
      if (existing) continue;

      await users.save(users.create({
        tenant_id: tenantId!,
        role_id: role.id,
        name: demoUser.name,
        email: demoUser.email,
        run: demoUser.run.replace(/[.\-\s]/g, '').toUpperCase(),
        school: demoUser.school,
        password_hash: passwordHash,
        is_blocked: false,
      }));
      created += 1;
    }
    console.log(`Usuarios demo creados: ${created}.`);
  } finally {
    await dataSource.destroy();
  }
}

void seedDemoUsers().catch((error: unknown) => {
  console.error('No se pudieron crear los usuarios de demostración.', error);
  process.exitCode = 1;
});

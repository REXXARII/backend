ALTER TABLE users
  ADD COLUMN IF NOT EXISTS run varchar(12),
  ADD COLUMN IF NOT EXISTS school varchar(100);

CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_run_unique
  ON users (tenant_id, run)
  WHERE run IS NOT NULL;

INSERT INTO roles (tenant_id, name, permissions)
SELECT tenant.id, role.name, role.permissions::jsonb
FROM tenants AS tenant
CROSS JOIN (
  VALUES
    ('ADMIN', '{"can_manage_users":true,"can_manage_inventory":true}'),
    ('AYUDANTE', '{"can_manage_users":false,"can_manage_inventory":true}'),
    ('GLOBAL', '{"can_manage_users":false,"can_manage_inventory":false}')
) AS role(name, permissions)
WHERE tenant.id = current_setting('app.tenant_id', true)::uuid
  AND NOT EXISTS (
    SELECT 1
    FROM roles AS existing
    WHERE existing.tenant_id = tenant.id
      AND existing.name = role.name
  );

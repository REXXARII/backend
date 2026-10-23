ALTER TABLE items
  ADD COLUMN IF NOT EXISTS stock numeric(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit varchar(30) NOT NULL DEFAULT 'unidades',
  ADD COLUMN IF NOT EXISTS is_consumable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS serial_number varchar(150);

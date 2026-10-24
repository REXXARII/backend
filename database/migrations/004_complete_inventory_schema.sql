ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE stock_movements
  ADD COLUMN IF NOT EXISTS quantity numeric(10, 3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit varchar(20) NOT NULL DEFAULT 'unidades';

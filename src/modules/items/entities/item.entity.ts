import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

//Define la entidad "Item" que representa un activo en el sistema, con sus propiedades y tipos de datos correspondientes.
@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'OPERATIVE' })
  status: string;
}
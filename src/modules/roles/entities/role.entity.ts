import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

//Representa una entidad de rol en la base de datos, con propiedades para el ID, el ID del inquilino, el nombre y los permisos asociados al rol.
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'jsonb' })
  permissions: Record<string, any>;
}
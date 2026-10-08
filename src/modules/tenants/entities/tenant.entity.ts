import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;
}
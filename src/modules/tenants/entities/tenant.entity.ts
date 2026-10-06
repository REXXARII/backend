import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tenants') // Así se llama tu tabla en PostgreSQL
export class Tenant {
  @PrimaryGeneratedColumn('uuid') // Genera el UUID automático
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>; // Permite guardar la parametrización dinámica
}
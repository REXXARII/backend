import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('loans')  // Entidad que representa un préstamo o pedido en la base de datos
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  item_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  school_origin: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  due_date: Date | null;

  @Column({ type: 'boolean', default: false })
  is_returned: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
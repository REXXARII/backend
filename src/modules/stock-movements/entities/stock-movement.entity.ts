import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  item_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantity: number;

  @Column({ type: 'varchar', length: 20, default: 'unidades' })
  unit: string;

  @Column({ type: 'text', nullable: true })
  movement_description: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
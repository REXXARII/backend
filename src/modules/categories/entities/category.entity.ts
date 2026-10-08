import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

//Entidad de categoría que representa la tabla "categories" en la base de datos
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
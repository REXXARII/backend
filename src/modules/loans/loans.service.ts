import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

@Injectable()
export class LoansService {  // Servicio para manejar la lógica de negocio relacionada con préstamos y pedidos
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createLoanDto: CreateLoanDto) {
    const tenantId = process.env.CITT_TENANT_ID!;
    return this.dataSource.transaction(async (manager) => {
      const loans = manager.getRepository(Loan);
      const items = manager.getRepository(Item);
      const users = manager.getRepository(User);
      const movements = manager.getRepository(StockMovement);
      const item = await items.findOne({
        where: { id: createLoanDto.item_id, tenant_id: tenantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) throw new NotFoundException('El activo no existe en este tenant.');

      const user = await users.findOneBy({ id: createLoanDto.user_id, tenant_id: tenantId });
      if (!user) throw new NotFoundException('El usuario no existe en este tenant.');
      if (user.is_blocked) throw new BadRequestException('El usuario está bloqueado y no puede realizar movimientos.');

      if (createLoanDto.type === 'DEVOLUCION') {
        const openLoan = await loans.findOne({
          where: {
            tenant_id: tenantId,
            item_id: item.id,
            user_id: user.id,
            type: 'PRESTAMO',
            is_returned: false,
          },
          order: { created_at: 'DESC' },
        });
        if (!openLoan) throw new BadRequestException('No existe un préstamo pendiente para devolver este activo.');
        openLoan.is_returned = true;
        return loans.save(openLoan);
      }

      if (createLoanDto.type !== 'PRESTAMO' && createLoanDto.type !== 'PEDIDO') {
        throw new BadRequestException('Tipo de movimiento no válido.');
      }
      if (createLoanDto.type === 'PRESTAMO' && !createLoanDto.due_date) {
        throw new BadRequestException('Los préstamos temporales exigen una fecha límite de retorno.');
      }

      const quantity = Number(createLoanDto.quantity ?? 1);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser un número mayor que cero.');
      }

      if (createLoanDto.type === 'PEDIDO') {
        if (!item.is_consumable) throw new BadRequestException('Solo se pueden pedir consumibles.');
        if (Number(item.stock) < quantity) throw new BadRequestException('No hay stock suficiente.');
        item.stock = (Number(item.stock) - quantity).toFixed(3);
        await items.save(item);
        await movements.save(movements.create({
          tenant_id: tenantId,
          item_id: item.id,
          user_id: user.id,
          quantity: (-quantity).toFixed(3),
          unit: createLoanDto.unit ?? item.unit,
          movement_description: `PEDIDO: ${createLoanDto.school_origin}`,
        }));
      } else {
        const openLoans = await loans.find({
          where: { tenant_id: tenantId, item_id: item.id, type: 'PRESTAMO', is_returned: false },
        });
        const reserved = openLoans.reduce((total, loan) => total + Number(loan.quantity), 0);
        if (Number(item.stock) - reserved < quantity) {
          throw new BadRequestException('No hay unidades disponibles para prestar.');
        }
      }

      const loan = loans.create({
        item_id: createLoanDto.item_id,
        user_id: createLoanDto.user_id,
        school_origin: createLoanDto.school_origin,
        type: createLoanDto.type,
        tenant_id: tenantId,
        quantity: quantity.toFixed(3),
        unit: createLoanDto.unit ?? item.unit,
        due_date: createLoanDto.type === 'PEDIDO' ? null : createLoanDto.due_date,
        is_returned: createLoanDto.type === 'PEDIDO',
      });
      return loans.save(loan);
    });
  }

  // Obtención de todos los préstamos o pedidos
  async findAll() {
    return await this.loanRepository.find({ where: { tenant_id: process.env.CITT_TENANT_ID! } });
  }

  // Obtención de un préstamo o pedido por ID
  async findOne(id: string) {
    const loan = await this.loanRepository.findOneBy({ id, tenant_id: process.env.CITT_TENANT_ID! });
    if (!loan) {
      throw new NotFoundException(`El registro con ID ${id} no existe en la base de datos.`);
    }
    return loan;
  }

  // Actualización de un préstamo o pedido
  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const existingLoan = await this.findOne(id); 
    
    // Validación para evitar cambios de tipo no permitidos
    if (existingLoan.type === 'PRESTAMO' && updateLoanDto.type === 'PEDIDO') {
      throw new BadRequestException('No es posible cambiar el tipo de registro: un préstamo de equipo no puede convertirse en un pedido consumible.');
    }

    // Validación para evitar cambios de tipo no permitidos
    if (updateLoanDto.type === 'DEVOLUCION') {
        updateLoanDto.is_returned = true;
    }

    // Validación para préstamos temporales: si se cambia el tipo a "PRESTAMO", se debe proporcionar una fecha límite de retorno
    await this.loanRepository.update({ id, tenant_id: process.env.CITT_TENANT_ID! }, updateLoanDto as any);
    return await this.findOne(id);
  }

  // Eliminación de un préstamo o pedido
  async remove(id: string) {
    const loan = await this.findOne(id);
    return await this.loanRepository.remove(loan);
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {  // Servicio para manejar la lógica de negocio relacionada con préstamos y pedidos
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  // Creación de un nuevo préstamo o pedido
  async create(createLoanDto: CreateLoanDto) {
    if (createLoanDto.type === 'PRESTAMO' && !createLoanDto.due_date) {
      throw new BadRequestException('Los préstamos temporales exigen obligatoriamente una fecha límite de retorno.');
    }

    // Validación para pedidos: si el tipo es "PEDIDO", la fecha límite de retorno debe ser nula
    if (createLoanDto.type === 'PEDIDO') {
      createLoanDto.due_date = null;
    }

    // Validación para devoluciones: si el tipo es "DEVOLUCION", la fecha límite de retorno debe ser nula y el estado de devolución debe ser verdadero
    const newLoan = this.loanRepository.create(createLoanDto);
    return await this.loanRepository.save(newLoan);
  }

  // Obtención de todos los préstamos o pedidos
  async findAll() {
    return await this.loanRepository.find();
  }

  // Obtención de un préstamo o pedido por ID
  async findOne(id: string) {
    const loan = await this.loanRepository.findOneBy({ id });
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
    await this.loanRepository.update(id, updateLoanDto as any);
    return await this.findOne(id);
  }

  // Eliminación de un préstamo o pedido
  async remove(id: string) {
    const loan = await this.findOne(id);
    return await this.loanRepository.remove(loan);
  }
}
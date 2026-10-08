import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(createLoanDto: CreateLoanDto) {
    if (createLoanDto.type === 'PRESTAMO' && !createLoanDto.due_date) {
      throw new BadRequestException('Los préstamos temporales exigen obligatoriamente una fecha límite de retorno.');
    }

    if (createLoanDto.type === 'PEDIDO') {
      createLoanDto.due_date = null;
    }

    const newLoan = this.loanRepository.create(createLoanDto);
    return await this.loanRepository.save(newLoan);
  }

  async findAll() {
    return await this.loanRepository.find();
  }

  async findOne(id: string) {
    const loan = await this.loanRepository.findOneBy({ id });
    if (!loan) {
      throw new NotFoundException(`El registro con ID ${id} no existe en la base de datos.`);
    }
    return loan;
  }

  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const existingLoan = await this.findOne(id); 
    
    // Regla: Un préstamo no puede pasar a pedido (entrega definitiva)
    if (existingLoan.type === 'PRESTAMO' && updateLoanDto.type === 'PEDIDO') {
      throw new BadRequestException('No es posible cambiar el tipo de registro: un préstamo de equipo no puede convertirse en un pedido consumible.');
    }

    if (updateLoanDto.type === 'DEVOLUCION') {
        updateLoanDto.is_returned = true;
    }

    await this.loanRepository.update(id, updateLoanDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const loan = await this.findOne(id);
    return await this.loanRepository.remove(loan);
  }
}
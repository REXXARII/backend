import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(createLoanDto: any) {
    const { type, due_date } = createLoanDto;

    // Regla de negocio: Si es PRESTAMO, la fecha de retorno es obligatoria
    if (type === 'PRESTAMO' && !due_date) {
      throw new BadRequestException('Los préstamos temporales exigen obligatoriamente una fecha límite o de retorno.');
    }

    // Regla de negocio: Si es PEDIDO, la fecha de retorno se anula
    if (type === 'PEDIDO') {
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
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado.`);
    }
    return loan;
  }

  async update(id: string, updateLoanDto: any) {
    await this.findOne(id); // Verifica que exista
    await this.loanRepository.update(id, updateLoanDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const loan = await this.findOne(id);
    return await this.loanRepository.remove(loan);
  }
}
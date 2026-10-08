import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanDto } from './create-loan.dto';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {  // DTO para actualizar un préstamo o pedido existente
  is_returned?: boolean;
}
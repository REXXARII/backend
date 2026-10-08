export class CreateLoanDto {   // DTO para crear un nuevo préstamo o pedido
  tenant_id: string;
  item_id: string;
  user_id: string;
  school_origin: string;
  type: string;
  due_date?: Date | null;  //tipo de dato opcional, puede ser null
}
export class CreateLoanDto {
  tenant_id: string;
  item_id: string;
  user_id: string;
  school_origin: string;
  type: string;
  due_date?: Date | null;
}
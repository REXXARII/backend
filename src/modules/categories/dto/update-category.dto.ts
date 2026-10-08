import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

//actualiza la información de una categoría existente, permitiendo modificar solo los campos necesarios sin requerir todos los datos de la categoría.
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
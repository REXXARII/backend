import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Servicio para manejar la lógica de negocio relacionada con categorías, incluyendo operaciones CRUD y validaciones.
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Crea una nueva categoría después de verificar que no exista una categoría con el mismo nombre.
  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOneBy({ name: createCategoryDto.name });
    if (existingCategory) {
      throw new ConflictException(`La categoría ${createCategoryDto.name} ya existe en el sistema.`);
    }

    // Crea y guarda la nueva categoría en la base de datos.
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(newCategory);
  }

  // Recupera todas las categorías existentes en la base de datos.
  async findAll() {
    return await this.categoryRepository.find();
  }

  // Recupera una categoría específica por su ID, lanzando una excepción si no se encuentra.
  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`La categoría con ID ${id} no existe.`);
    }
    return category;
  }

  // Actualiza una categoría existente después de verificar que exista, y devuelve la categoría actualizada.
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    await this.categoryRepository.update(id, updateCategoryDto);
    return await this.findOne(id);
  }

  // Elimina una categoría existente después de verificar que exista, y devuelve la categoría eliminada.
  async remove(id: string) {
    const category = await this.findOne(id);
    return await this.categoryRepository.remove(category);
  }
}
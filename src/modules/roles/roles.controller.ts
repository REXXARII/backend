import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../../auth/auth.decorators';

//El controlador de roles define los endpoints de la API para crear, leer, actualizar y eliminar roles, delegando la lógica de negocio al servicio de roles.
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Crea un nuevo rol
  @Post()
  @Roles('ADMIN')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  // Obtiene todos los roles
  @Get()
  @Roles('ADMIN', 'AYUDANTE')
  findAll() {
    return this.rolesService.findAll();
  }

  // Obtiene un rol por su ID
  @Get(':id')
  @Roles('ADMIN', 'AYUDANTE')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  // Actualiza un rol existente por su ID
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  // Elimina un rol por su ID
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
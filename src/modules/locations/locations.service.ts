import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

// Servicio para manejar la lógica de negocio relacionada con las ubicaciones
@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    if (createLocationDto.name && createLocationDto.name.toUpperCase() === 'SIN CASILLERO') {
      createLocationDto.description = 'Ubicación virtual para equipos móviles sin asignación física fija.';
    }
    const location = this.locationRepository.create(createLocationDto);
    return await this.locationRepository.save(location);
  }

  async findAll() {
    return await this.locationRepository.find();
  }

  async findOne(id: string) {
    const location = await this.locationRepository.findOneBy({ id });
    if (!location) throw new NotFoundException(`Ubicación con ID ${id} no encontrada.`);
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    await this.findOne(id);
    await this.locationRepository.update(id, updateLocationDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const location = await this.findOne(id);
    return await this.locationRepository.remove(location);
  }
}
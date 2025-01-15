import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxiRouteDto } from './create-taxi_route.dto';

export class UpdateTaxiRouteDto extends PartialType(CreateTaxiRouteDto) {}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TaxiRoutesService } from './taxi_routes.service';
import { CreateTaxiRouteDto } from './dto/create-taxi_route.dto';

@Controller('taxi-routes')
export class TaxiRoutesController {
    constructor(private readonly taxiRoutesService: TaxiRoutesService) { }

    @Post()
    create(@Body() createdTaxiRouteDto: CreateTaxiRouteDto) {
        console.log(createdTaxiRouteDto);
        return this.taxiRoutesService.addRoute(createdTaxiRouteDto);
    }

    @Get(':id')
    findByRankId(@Param('id') id: string) {
        console.log('fetch route for id: ' + id);
        return this.taxiRoutesService.getRoutesByRankId(+id);
    }
}

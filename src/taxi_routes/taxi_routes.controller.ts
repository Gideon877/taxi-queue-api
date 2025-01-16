import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TaxiRoutesService } from './taxi_routes.service';
import { CreateTaxiRouteDto } from './dto/create-taxi_route.dto';
import { UpdateTaxiRouteDto } from './dto/update-taxi_route.dto';

@Controller('taxi-routes')
export class TaxiRoutesController {
    constructor(private readonly taxiRoutesService: TaxiRoutesService) { }

    @Post()
    create(@Body() createdTaxiRouteDto: CreateTaxiRouteDto) {
        return this.taxiRoutesService.onCreateRoute(createdTaxiRouteDto);
    }

    @Get(':id')
    findByRankId(@Param('id') id: string) {
        return this.taxiRoutesService.getRoutesByRankId(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaxiRouteDto: UpdateTaxiRouteDto) {
        return this.taxiRoutesService.updateRoute(+id, updateTaxiRouteDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.taxiRoutesService.deleteRoute(+id);
    }

    @Get('/route-details/:queueId')
    getRouteDetailsByQueueId(@Param('queueId') queueId:  string) {
        return this.taxiRoutesService.getRouteDetailsByQueueId(+queueId);
    }
}

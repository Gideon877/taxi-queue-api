import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateTaxiRouteDto {
    @IsInt()
    @IsNotEmpty()
    fromRankId: number;

    @IsInt()
    @IsNotEmpty()
    toRankId: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0, { message: 'Fare must be a positive value' })
    @Max(10000, { message: 'Fare must be less than 10,000' })
    fare: number;
}

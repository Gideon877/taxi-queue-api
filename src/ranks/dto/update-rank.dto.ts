import { PartialType } from '@nestjs/mapped-types';
import { CreateRankDto } from './create-rank.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRankDto extends PartialType(CreateRankDto) {
    
    @IsString()
    @IsNotEmpty()
    rankName: string

}

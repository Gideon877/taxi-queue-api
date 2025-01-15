import { IsNotEmpty, IsString } from "class-validator";

export class CreateRankDto {
    @IsString()
    @IsNotEmpty()
    rankName: string;
}

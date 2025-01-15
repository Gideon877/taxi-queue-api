import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueDto } from './create-queue.dto';
import { QueueField } from 'src/utils/enums';

export class UpdateQueueDto extends PartialType(CreateQueueDto) {
    @IsInt()
    @IsNotEmpty()
    queueId: number;

    @IsInt()
    @IsNotEmpty()
    count: number;

    @IsEnum(QueueField)
    @IsNotEmpty()
    field: QueueField;
}




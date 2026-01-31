import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoansRepository } from './loans.repository';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [LoansController],
    providers: [LoansService, LoansRepository],
    exports: [LoansService],
})
export class LoansModule { }

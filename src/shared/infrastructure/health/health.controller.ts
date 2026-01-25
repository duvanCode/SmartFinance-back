import { Controller, Get } from '@nestjs/common';
import {
    HealthCheckService,
    HealthCheck,
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
        private prisma: PrismaService,
    ) { }

    @Get()
    @HealthCheck()
    @ApiOperation({
        summary: 'Health check endpoint',
        description: 'Returns the health status of the application, including database, memory, and disk checks.',
    })
    @ApiResponse({
        status: 200,
        description: 'Application is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                info: {
                    type: 'object',
                    properties: {
                        database: { type: 'object', properties: { status: { type: 'string', example: 'up' } } },
                        memory_heap: { type: 'object', properties: { status: { type: 'string', example: 'up' } } },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 503,
        description: 'Application is unhealthy',
    })
    check() {
        return this.health.check([
            // Database check
            () => this.prismaHealth.pingCheck('database', this.prisma),

            // Memory check: heap should not exceed 300MB
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // Memory check: RSS should not exceed 500MB
            () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

            // Disk check: storage should have at least 10% free space
            // Note: This may not work in all environments (e.g., some containers)
            // () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.1 }),
        ]);
    }

    @Get('live')
    @ApiOperation({
        summary: 'Liveness probe',
        description: 'Simple endpoint to check if the application is running.',
    })
    @ApiResponse({ status: 200, description: 'Application is alive' })
    live() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Get('ready')
    @HealthCheck()
    @ApiOperation({
        summary: 'Readiness probe',
        description: 'Checks if the application is ready to receive traffic (database connected).',
    })
    @ApiResponse({ status: 200, description: 'Application is ready' })
    @ApiResponse({ status: 503, description: 'Application is not ready' })
    ready() {
        return this.health.check([
            () => this.prismaHealth.pingCheck('database', this.prisma),
        ]);
    }
}

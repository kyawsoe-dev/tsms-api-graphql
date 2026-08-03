import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

export class HealthStatus {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'up', description: 'Database connectivity' })
  database: string;

  @ApiProperty({ example: 123.45, description: 'Seconds since process start' })
  uptime: number;

  @ApiProperty({ example: '2026-08-03T10:00:00.000Z' })
  timestamp: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Liveness / readiness probe',
    description:
      'Returns 200 with `status: ok` when the service and its database are ' +
      'reachable, 503 otherwise.',
  })
  @ApiOkResponse({ type: HealthStatus, description: 'Service is healthy' })
  @ApiServiceUnavailableResponse({
    description: 'Database is unreachable',
  })
  async getHealth(): Promise<HealthStatus> {
    let database: string;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ok',
      database,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

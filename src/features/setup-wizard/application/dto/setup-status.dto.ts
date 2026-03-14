import { ApiProperty } from '@nestjs/swagger';

export class SetupStatusDto {
  @ApiProperty({ description: 'Whether the user has completed the initial setup wizard' })
  setupCompleted: boolean;
}

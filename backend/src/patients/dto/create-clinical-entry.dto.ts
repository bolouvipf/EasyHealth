import { IsString, IsOptional, IsDateString, IsObject } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateClinicalEntryDto {
  @ApiProperty({ example: "CONSULTATION" })
  @IsString()
  entryType: string

  @ApiProperty({ example: "Patient présente une fièvre persistante..." })
  @IsString()
  content: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ example: "client-uuid-v4" })
  @IsOptional()
  @IsString()
  clientId?: string

  @ApiPropertyOptional({ example: "2026-07-07T10:30:00Z" })
  @IsOptional()
  @IsDateString()
  recordedAt?: string
}

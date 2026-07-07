import { IsUUID, IsOptional, IsNumber, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class GenerateCodeDto {
  @ApiProperty({ description: "ID du dossier patient à partager" })
  @IsUUID()
  patientRecordId: string

  @ApiPropertyOptional({ description: "Durée de validité en minutes", default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expiresInMinutes?: number
}

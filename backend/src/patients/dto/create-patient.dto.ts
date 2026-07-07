import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreatePatientDto {
  @ApiProperty({ example: "Kouassi" })
  @IsString()
  nom: string

  @ApiProperty({ example: "Amadou" })
  @IsString()
  prenom: string

  @ApiPropertyOptional({ example: "1990-05-15" })
  @IsOptional()
  @IsDateString()
  dateNaissance?: string

  @ApiPropertyOptional({ example: "M" })
  @IsOptional()
  @IsString()
  sexe?: string

  @ApiPropertyOptional({ example: "O+" })
  @IsOptional()
  @IsString()
  groupeSanguin?: string

  @ApiPropertyOptional({ example: "+229 01 23 45 67" })
  @IsOptional()
  @IsString()
  telephone?: string

  @ApiPropertyOptional({ example: "Cotonou, Bénin" })
  @IsOptional()
  @IsString()
  adresse?: string

  @ApiPropertyOptional({ example: "Enseignant" })
  @IsOptional()
  @IsString()
  profession?: string

  @ApiPropertyOptional({ example: "Aucune" })
  @IsOptional()
  @IsString()
  allergies?: string

  @ApiPropertyOptional({ example: "Hypertension" })
  @IsOptional()
  @IsString()
  antecedentsMedicaux?: string

  @ApiPropertyOptional({ example: "Amlodipine 5mg" })
  @IsOptional()
  @IsString()
  traitementsEnCours?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentGiven?: boolean
}

import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNotEmpty, ValidateIf } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { UserRole } from "../../common/decorators/roles.decorator"

export class RegisterDto {
  @ApiProperty({ example: "jean.dupont@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "MotDePasse123!" })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ example: "Dupont" })
  @IsString()
  nom: string

  @ApiProperty({ example: "Jean" })
  @IsString()
  prenom: string

  @ApiProperty({ example: "medecin", enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole

  @ApiPropertyOptional({ example: "+229 01 23 45 67" })
  @IsOptional()
  @IsString()
  telephone?: string

  @ApiPropertyOptional({ example: "0123456789", description: "Numéro Personnel d'Identification (ANIP Bénin) — strictement facultatif" })
  @IsOptional()
  @IsString()
  npi?: string

  @ApiPropertyOptional({ example: "MED-2024-001234" })
  @ValidateIf((o: RegisterDto) => o.role && o.role !== UserRole.PATIENT)
  @IsString()
  @IsNotEmpty({ message: "Le numéro d'enregistrement professionnel est requis pour les professionnels" })
  professionalLicenseNumber?: string

  @ApiPropertyOptional({ example: "CHU de Cotonou" })
  @ValidateIf((o: RegisterDto) => o.role && o.role !== UserRole.PATIENT)
  @IsString()
  @IsNotEmpty({ message: "L'établissement est requis pour les professionnels" })
  establishment?: string
}

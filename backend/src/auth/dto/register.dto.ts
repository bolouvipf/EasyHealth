import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator"
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

  @ApiPropertyOptional({ example: "MED-2024-001234" })
  @IsOptional()
  @IsString()
  professionalLicenseNumber?: string
}

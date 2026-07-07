import { IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ResetPasswordDto {
  @ApiProperty({ description: "Token reçu par email" })
  @IsString()
  token: string

  @ApiProperty({ example: "NouveauMotDePasse123!" })
  @IsString()
  @MinLength(8)
  newPassword: string
}

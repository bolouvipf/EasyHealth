import { IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AccessByCodeDto {
  @ApiProperty({ description: "Code temporaire à 8 chiffres" })
  @IsString()
  code: string
}

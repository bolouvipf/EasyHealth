import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "../user.entity"
import { TokenBlacklistService } from "../blacklist.service"

interface JwtPayload {
  sub: string
  email: string
  role: string
  professionalStatus: string
  tokenVersion: number
  jti: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly blacklistService: TokenBlacklistService,
  ) {
    const secret = configService.get<string>("JWT_SECRET")
    if (!secret) {
      throw new Error("JWT_SECRET est obligatoire dans tous les environnements")
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  async validate(payload: JwtPayload) {
    if (this.blacklistService.has(payload.jti)) {
      throw new UnauthorizedException("Token révoqué individuellement")
    }
    const user = await this.userRepository.findOne({ where: { id: payload.sub } })
    if (!user || !user.isActive) throw new UnauthorizedException()
    if (payload.tokenVersion !== user.tokenVersion) throw new UnauthorizedException("Token révoqué")
    return { sub: user.id, email: user.email, role: user.role, professionalStatus: user.professionalStatus, jti: payload.jti }
  }
}

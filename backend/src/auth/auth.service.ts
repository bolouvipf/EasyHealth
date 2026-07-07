import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { User } from "./user.entity"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { UserRole } from "../common/decorators/roles.decorator"

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } })
    if (existing) throw new ConflictException("Cet email est déjà utilisé")

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(dto.password, salt)

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      professionalStatus: dto.role === UserRole.PATIENT ? "verified" : "pending",
    })

    await this.userRepository.save(user)
    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException("Email ou mot de passe incorrect")

    if (!user.isActive) throw new ForbiddenException("Compte désactivé")

    if (user.role !== UserRole.PATIENT && user.professionalStatus !== "verified") {
      throw new ForbiddenException(
        "Compte professionnel en attente de vérification. Veuillez contacter l'administration."
      )
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) throw new UnauthorizedException("Email ou mot de passe incorrect")

    user.lastLoginAt = new Date()
    await this.userRepository.save(user)

    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  }

  async verifyProfessional(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) throw new ForbiddenException("Utilisateur introuvable")
    user.professionalStatus = "verified"
    await this.userRepository.save(user)
    return this.sanitizeUser(user)
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } })
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      professionalStatus: user.professionalStatus,
    }
    return this.jwtService.sign(payload)
  }

  sanitizeUser(user: User) {
    const { password, ...rest } = user
    return rest
  }
}

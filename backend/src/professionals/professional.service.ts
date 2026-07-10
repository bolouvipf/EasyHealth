import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ProfessionalVerification } from "./professional.entity"
import { User } from "../auth/user.entity"

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(ProfessionalVerification)
    private readonly verificationRepository: Repository<ProfessionalVerification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createVerification(userId: string, licenseNumber: string, establishment?: string) {
    const existing = await this.verificationRepository.findOne({ where: { userId } })
    if (existing) return existing

    const verification = this.verificationRepository.create({
      userId,
      licenseNumber,
      establishment,
      status: "pending",
    })
    return this.verificationRepository.save(verification)
  }

  async findPending() {
    const verifications = await this.verificationRepository.find({ where: { status: "pending" } })
    const userIds = verifications.map((v) => v.userId)
    if (userIds.length === 0) return []

    const users = await this.userRepository.findByIds(userIds)
    const userMap = new Map(users.map((u) => [u.id, u]))

    return verifications.map((v) => ({
      ...v,
      user: userMap.get(v.userId) || null,
    }))
  }

  async verify(id: string, verifiedById: string) {
    const verification = await this.verificationRepository.findOne({ where: { id } })
    if (!verification) throw new NotFoundException("Demande de vérification introuvable")

    verification.status = "verified"
    verification.verifiedAt = new Date()
    verification.verifiedById = verifiedById
    await this.verificationRepository.save(verification)

    await this.userRepository.update(verification.userId, { professionalStatus: "verified" })

    return verification
  }

  async reject(id: string, reason: string) {
    const verification = await this.verificationRepository.findOne({ where: { id } })
    if (!verification) throw new NotFoundException("Demande de vérification introuvable")

    verification.status = "rejected"
    verification.rejectionReason = reason
    await this.verificationRepository.save(verification)

    await this.userRepository.update(verification.userId, { professionalStatus: "rejected" })

    return verification
  }
}

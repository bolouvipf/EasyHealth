import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, IsNull } from "typeorm"
import * as crypto from "crypto"
import { SharingCode } from "./sharing.entity"
import { AccessGrant } from "./access-grant.entity"
import { PatientRecord } from "../patients/patient.entity"
import { AuditService } from "../audit/audit.service"
import { AuditAction } from "../audit/audit.entity"

@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharingCode)
    private readonly sharingRepository: Repository<SharingCode>,
    @InjectRepository(AccessGrant)
    private readonly grantRepository: Repository<AccessGrant>,
    @InjectRepository(PatientRecord)
    private readonly patientRepository: Repository<PatientRecord>,
    private readonly auditService: AuditService
  ) {}

  async generateCode(patientRecordId: string, userId: string, expiresInMinutes = 30) {
    const record = await this.patientRepository.findOne({ where: { id: patientRecordId } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")
    if (!record.consentGiven) {
      record.consentGiven = true
      record.consentDate = new Date()
      await this.patientRepository.save(record)
    }

    const code = crypto.randomInt(10000000, 99999999).toString()
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    const sharingCode = this.sharingRepository.create({
      code,
      patientRecordId,
      expiresAt,
    })

    await this.sharingRepository.save(sharingCode)

    await this.auditService.log({
      action: AuditAction.PARTAGE,
      userId,
      patientRecordId,
      details: "Code de partage généré (expire dans " + expiresInMinutes + " min)",
    })

    return { code: sharingCode.code, expiresAt: sharingCode.expiresAt, id: sharingCode.id }
  }

  async accessByCode(code: string, userId: string) {
    const sharingCode = await this.sharingRepository.findOne({
      where: { code, isUsed: false },
      relations: ["patientRecord"],
    })

    if (!sharingCode) throw new NotFoundException("Code invalide ou déjà utilisé")
    if (new Date() > sharingCode.expiresAt) throw new BadRequestException("Code expiré")

    sharingCode.isUsed = true
    sharingCode.usedById = userId
    sharingCode.usedAt = new Date()
    await this.sharingRepository.save(sharingCode)

    const record = sharingCode.patientRecord

    const existingGrant = await this.grantRepository.findOne({
      where: { granteeId: userId, patientRecordId: record.id, revokedAt: IsNull() },
    })

    if (!existingGrant || existingGrant.expiresAt < new Date()) {
      const grant = this.grantRepository.create({
        grantorId: record.createdById,
        granteeId: userId,
        patientRecordId: record.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      })
      await this.grantRepository.save(grant)
    }

    await this.auditService.log({
      action: AuditAction.PARTAGE,
      userId,
      patientRecordId: record.id,
      details: "Accès obtenu via code temporaire",
    })

    return record
  }

  async getActiveGrant(userId: string, patientRecordId: string) {
    return this.grantRepository.findOne({
      where: { granteeId: userId, patientRecordId, revokedAt: IsNull() },
    })
  }

  async hasActiveAccess(userId: string, patientRecordId: string): Promise<boolean> {
    const grant = await this.getActiveGrant(userId, patientRecordId)
    if (!grant) return false
    if (grant.expiresAt < new Date()) return false
    return true
  }

  async findByPatient(patientRecordId: string) {
    return this.sharingRepository.find({
      where: { patientRecordId },
      order: { createdAt: "DESC" },
    })
  }
}

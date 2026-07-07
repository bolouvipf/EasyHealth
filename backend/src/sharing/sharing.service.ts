import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as crypto from "crypto"
import { SharingCode } from "./sharing.entity"
import { PatientRecord } from "../patients/patient.entity"
import { AuditService } from "../audit/audit.service"
import { AuditAction } from "../audit/audit.entity"

@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharingCode)
    private readonly sharingRepository: Repository<SharingCode>,
    @InjectRepository(PatientRecord)
    private readonly patientRepository: Repository<PatientRecord>,
    private readonly auditService: AuditService
  ) {}

  async generateCode(patientRecordId: string, userId: string, expiresInMinutes = 30) {
    const record = await this.patientRepository.findOne({ where: { id: patientRecordId } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")
    if (!record.consentGiven) throw new ForbiddenException("Le patient n'a pas donné son consentement")

    const code = crypto.randomInt(10000000, 99999999).toString()
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    const sharingCode = this.sharingRepository.create({
      code,
      patientRecordId,
      expiresAt,
    })

    const saved = await this.sharingRepository.save(sharingCode)

    await this.auditService.log({
      action: AuditAction.PARTAGE,
      userId,
      patientRecordId,
      details: `Code de partage généré (expire dans ${expiresInMinutes} min)`,
    })

    return { code: saved.code, expiresAt: saved.expiresAt, id: saved.id }
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

    await this.auditService.log({
      action: AuditAction.PARTAGE,
      userId,
      patientRecordId: record.id,
      details: "Accès via code temporaire",
    })

    return record
  }

  async findByPatient(patientRecordId: string) {
    return this.sharingRepository.find({
      where: { patientRecordId },
      order: { createdAt: "DESC" },
    })
  }
}

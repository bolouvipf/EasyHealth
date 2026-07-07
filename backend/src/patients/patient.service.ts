import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PatientRecord } from "./patient.entity"
import { CreatePatientDto } from "./dto/create-patient.dto"
import { UpdatePatientDto } from "./dto/update-patient.dto"
import { UserRole } from "../common/decorators/roles.decorator"
import { AuditService } from "../audit/audit.service"
import { AuditAction } from "../audit/audit.entity"

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRepository: Repository<PatientRecord>,
    private readonly auditService: AuditService
  ) {}

  async create(dto: CreatePatientDto, userId: string, userRole: string) {
    if (userRole === UserRole.PATIENT) {
      throw new ForbiddenException("Les patients ne peuvent pas créer de dossiers")
    }

    const record = this.patientRepository.create({
      ...dto,
      createdById: userId,
      consentGiven: dto.consentGiven ?? false,
      consentDate: dto.consentGiven ? new Date() : undefined,
      isActive: true,
    } as any)

    const saved = (await this.patientRepository.save(record)) as unknown as PatientRecord

    await this.auditService.log({
      action: AuditAction.CREATION,
      userId,
      patientRecordId: saved.id,
      details: "Création du dossier patient",
    })

    return saved
  }

  async findAll(userId: string, userRole: string) {
    if (userRole === UserRole.PATIENT) {
      return this.patientRepository.find({ where: { createdById: userId, isActive: true } })
    }
    return this.patientRepository.find({ where: { isActive: true } })
  }

  async findOne(id: string, userId: string, userRole: string) {
    const record = await this.patientRepository.findOne({ where: { id, isActive: true } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    await this.auditService.log({
      action: AuditAction.CONSULTATION,
      userId,
      patientRecordId: id,
      details: "Consultation du dossier patient",
    })

    return record
  }

  async update(id: string, dto: UpdatePatientDto, userId: string, userRole: string) {
    const record = await this.patientRepository.findOne({ where: { id } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    if (userRole === UserRole.PATIENT || userRole === UserRole.ADMINISTRATIF) {
      throw new ForbiddenException("Vous n'avez pas les permissions pour modifier ce dossier")
    }

    Object.assign(record, dto)
    if (dto.consentGiven !== undefined) {
      record.consentDate = dto.consentGiven ? new Date() : null
    }

    await this.patientRepository.save(record)

    await this.auditService.log({
      action: AuditAction.MODIFICATION,
      userId,
      patientRecordId: id,
      details: "Modification du dossier patient",
    })

    return record
  }

  async remove(id: string, userId: string) {
    const record = await this.patientRepository.findOne({ where: { id } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    record.isActive = false
    await this.patientRepository.save(record)

    await this.auditService.log({
      action: AuditAction.SUPPRESSION,
      userId,
      patientRecordId: id,
      details: "Désactivation du dossier patient",
    })

    return { message: "Dossier désactivé avec succès" }
  }
}

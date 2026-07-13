import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, IsNull } from "typeorm"
import { PatientRecord } from "./patient.entity"
import { ClinicalEntry, ClinicalEntryType, Specialty } from "./clinical-entry.entity"
import { CreatePatientDto } from "./dto/create-patient.dto"
import { UpdatePatientDto } from "./dto/update-patient.dto"
import { CreateClinicalEntryDto } from "./dto/create-clinical-entry.dto"
import { PaginationDto, PaginatedResult } from "../common/dto/pagination.dto"
import { UserRole } from "../common/decorators/roles.decorator"
import { AuditService } from "../audit/audit.service"
import { AuditAction } from "../audit/audit.entity"
import { EncryptionService } from "../crypto/encryption.service"
import { User } from "../auth/user.entity"
import { AccessGrant } from "../sharing/access-grant.entity"

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRepository: Repository<PatientRecord>,
    @InjectRepository(ClinicalEntry)
    private readonly clinicalEntryRepository: Repository<ClinicalEntry>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AccessGrant)
    private readonly grantRepository: Repository<AccessGrant>,
    private readonly auditService: AuditService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private encryptPatientData(dto: { nom?: string; prenom?: string; adresse?: string; telephone?: string; npi?: string }): string | undefined {
    const sensitive: Record<string, string> = {}
    if (dto.nom !== undefined) sensitive.nom = dto.nom
    if (dto.prenom !== undefined) sensitive.prenom = dto.prenom
    if (dto.adresse !== undefined) sensitive.adresse = dto.adresse
    if (dto.telephone !== undefined) sensitive.telephone = dto.telephone
    if (dto.npi !== undefined) sensitive.npi = dto.npi
    if (Object.keys(sensitive).length === 0) return undefined
    return this.encryptionService.encrypt(JSON.stringify(sensitive))
  }

  private decryptPatientRecord(record: PatientRecord): PatientRecord {
    if (record.encryptedData && this.encryptionService.isEncrypted(record.encryptedData)) {
      try {
        const decrypted = JSON.parse(this.encryptionService.decrypt(record.encryptedData))
        if (decrypted.nom !== undefined) record.nom = decrypted.nom
        if (decrypted.prenom !== undefined) record.prenom = decrypted.prenom
        if (decrypted.adresse !== undefined) record.adresse = decrypted.adresse
        if (decrypted.telephone !== undefined) record.telephone = decrypted.telephone
        if (decrypted.npi !== undefined) (record as any).npi = decrypted.npi
      } catch {}
    }
    return record
  }

  async create(dto: CreatePatientDto, userId: string, userRole: string, ip?: string) {
    if (userRole === UserRole.PATIENT) {
      throw new ForbiddenException("Les patients ne peuvent pas créer de dossiers")
    }

    const record = this.patientRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
      sexe: dto.sexe,
      groupeSanguin: dto.groupeSanguin,
      telephone: dto.telephone,
      adresse: dto.adresse,
      profession: dto.profession,
      encryptedData: this.encryptPatientData(dto),
      createdById: userId,
      consentGiven: dto.consentGiven ?? false,
      consentDate: dto.consentGiven ? new Date() : null,
      isActive: true,
    })

    const saved = await this.patientRepository.save(record)

    await this.auditService.log({
      action: AuditAction.CREATION,
      userId,
      patientRecordId: saved.id,
      details: "Création du dossier patient",
      ipAddress: ip,
    })

    return saved
  }

  async findMine(userId: string): Promise<PatientRecord[]> {
    const records = await this.patientRepository.find({
      where: { userId, isActive: true },
      relations: ["clinicalEntries"],
      order: { createdAt: "DESC" },
    })
    return records.map((r) => this.decryptPatientRecord(r))
  }

  async findAll(userId: string, userRole: string, pagination?: PaginationDto): Promise<PaginatedResult<PatientRecord>> {
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 20
    const skip = (page - 1) * limit

    const where = userRole === UserRole.PATIENT
      ? { userId, isActive: true }
      : { isActive: true }

    const [data, total] = await this.patientRepository.findAndCount({
      where,
      relations: ["clinicalEntries"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    })

    return {
      data: data.map((r) => this.decryptPatientRecord(r)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  private async checkAccess(record: PatientRecord, userId: string, userRole: string) {
    if (userRole === UserRole.ADMIN) return
    if (record.createdById === userId) return
    if (record.userId === userId) return
    if (userRole === UserRole.PATIENT) throw new ForbiddenException("Vous n'avez pas accès à ce dossier")
    const grant = await this.grantRepository.findOne({
      where: { granteeId: userId, patientRecordId: record.id, revokedAt: IsNull() },
    })
    if (!grant || grant.expiresAt < new Date()) throw new ForbiddenException("Vous n'avez pas accès à ce dossier")
  }

  async checkMineAccess(userId: string) {
    return this.patientRepository.findOne({
      where: { userId, isActive: true },
    })
  }

  async findOne(id: string, userId: string, userRole: string, ip?: string) {
    const record = await this.patientRepository.findOne({
      where: { id, isActive: true },
      relations: ["clinicalEntries"],
    })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    await this.checkAccess(record, userId, userRole)

    await this.auditService.log({
      action: AuditAction.CONSULTATION,
      userId,
      patientRecordId: id,
      details: "Consultation du dossier patient",
      ipAddress: ip,
    })

    return this.decryptPatientRecord(record)
  }

  async update(id: string, dto: UpdatePatientDto, userId: string, userRole: string, ip?: string) {
    const record = await this.patientRepository.findOne({ where: { id } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    if (userRole === UserRole.PATIENT || userRole === UserRole.ADMINISTRATIF) {
      throw new ForbiddenException("Vous n'avez pas les permissions pour modifier ce dossier")
    }

    if (userRole !== UserRole.ADMIN && record.createdById !== userId) {
      throw new ForbiddenException("Vous ne pouvez modifier que vos propres dossiers")
    }

    if (dto.nom !== undefined) record.nom = dto.nom
    if (dto.prenom !== undefined) record.prenom = dto.prenom
    if (dto.dateNaissance !== undefined) record.dateNaissance = new Date(dto.dateNaissance)
    if (dto.sexe !== undefined) record.sexe = dto.sexe
    if (dto.groupeSanguin !== undefined) record.groupeSanguin = dto.groupeSanguin
    if (dto.telephone !== undefined) record.telephone = dto.telephone
    if (dto.adresse !== undefined) record.adresse = dto.adresse
    if (dto.profession !== undefined) record.profession = dto.profession
    if (dto.consentGiven !== undefined) {
      record.consentGiven = dto.consentGiven
      record.consentDate = dto.consentGiven ? new Date() : null
    }

    const encrypted = this.encryptPatientData(dto)
    if (encrypted) record.encryptedData = encrypted

    await this.patientRepository.save(record)

    await this.auditService.log({
      action: AuditAction.MODIFICATION,
      userId,
      patientRecordId: id,
      details: "Modification du dossier patient",
      ipAddress: ip,
    })

    return this.decryptPatientRecord(record)
  }

  async remove(id: string, userId: string, ip?: string) {
    const record = await this.patientRepository.findOne({ where: { id } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    record.isActive = false
    await this.patientRepository.save(record)

    await this.auditService.log({
      action: AuditAction.SUPPRESSION,
      userId,
      patientRecordId: id,
      details: "Désactivation du dossier patient",
      ipAddress: ip,
    })

    return { message: "Dossier désactivé avec succès" }
  }

  async addClinicalEntry(
    patientRecordId: string,
    dto: CreateClinicalEntryDto,
    userId: string,
    userRole: string,
    ip?: string,
  ) {
    const record = await this.patientRepository.findOne({ where: { id: patientRecordId, isActive: true } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")

    await this.checkAccess(record, userId, userRole)

    const encryptedContent = this.encryptionService.encrypt(dto.content)

    const author = await this.userRepository.findOne({ where: { id: userId } })
    const metadata: Record<string, any> = dto.metadata ? { ...dto.metadata } : {}
    if (author?.hospital) metadata.hospital = author.hospital
    if (author) metadata.authorName = author.prenom + " " + author.nom

    const entry = new ClinicalEntry()
    entry.patientRecordId = patientRecordId
    entry.authorId = userId
    entry.entryType = dto.entryType as ClinicalEntryType
    entry.content = encryptedContent
    entry.metadata = Object.keys(metadata).length ? JSON.stringify(metadata) : undefined
    entry.specialty = dto.specialty || Specialty.GENERALE
    entry.clientId = dto.clientId as string
    entry.recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date()

    const saved = await this.clinicalEntryRepository.save(entry)

    await this.auditService.log({
      action: AuditAction.MODIFICATION,
      userId,
      patientRecordId,
      details: "Nouvelle entrée clinique (" + dto.entryType + ")",
      ipAddress: ip,
    })

    return this.decryptEntry(saved)
  }

  async getClinicalEntries(
    patientRecordId: string,
    userId: string,
    userRole: string,
    pagination?: PaginationDto,
    specialty?: Specialty,
  ): Promise<PaginatedResult<ClinicalEntry>> {
    const record = await this.patientRepository.findOne({ where: { id: patientRecordId, isActive: true } })
    if (!record) throw new NotFoundException("Dossier patient introuvable")
    await this.checkAccess(record, userId, userRole)

    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = { patientRecordId }
    if (specialty) where.specialty = specialty

    const [entries, total] = await this.clinicalEntryRepository.findAndCount({
      where,
      order: { createdAt: "ASC" },
      relations: ["author"],
      skip,
      take: limit,
    })

    return {
      data: entries.map((e) => this.decryptEntry(e)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  private decryptEntry(entry: ClinicalEntry) {
    if (this.encryptionService.isEncrypted(entry.content)) {
      entry.content = this.encryptionService.decrypt(entry.content)
    }
    if (entry.metadata) {
      try { entry.metadata = JSON.parse(entry.metadata) } catch {}
    }
    return entry
  }
}

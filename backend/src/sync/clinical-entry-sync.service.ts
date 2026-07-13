import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, MoreThanOrEqual } from "typeorm"
import { ClinicalEntry, ClinicalEntryType } from "../patients/clinical-entry.entity"
import { EncryptionService } from "../crypto/encryption.service"

@Injectable()
export class ClinicalEntrySyncService {
  constructor(
    @InjectRepository(ClinicalEntry)
    private readonly clinicalEntryRepository: Repository<ClinicalEntry>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async processPushOperation(op: any): Promise<{ id: string; status: string }> {
    const clientId: string | undefined = op.payload?.clientId
    if (clientId) {
      const existing = await this.clinicalEntryRepository.findOne({ where: { clientId } })
      if (existing) {
        return { id: existing.id, status: "duplicate_skipped" }
      }
    }

    const entry = new ClinicalEntry()
    entry.patientRecordId = op.entityId
    entry.authorId = op.payload?.authorId
    entry.entryType = (op.payload?.entryType as ClinicalEntryType) || ClinicalEntryType.NOTE
    entry.content = op.payload?.content
      ? this.encryptionService.encrypt(op.payload.content)
      : ""
    entry.metadata = op.payload?.metadata ? JSON.stringify(op.payload.metadata) : undefined
    entry.clientId = clientId
    entry.recordedAt = op.clientTimestamp ? new Date(op.clientTimestamp) : new Date()

    const saved = await this.clinicalEntryRepository.save(entry)
    return { id: saved.id, status: "synced" }
  }

  async getEntriesSince(since: Date): Promise<ClinicalEntry[]> {
    return this.clinicalEntryRepository.find({
      where: since ? { createdAt: MoreThanOrEqual(since) } : undefined,
      order: { createdAt: "ASC" },
    })
  }
}

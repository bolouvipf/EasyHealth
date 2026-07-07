import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClinicalEntry, ClinicalEntryType } from "../patients/clinical-entry.entity"

@Injectable()
export class ClinicalEntrySyncService {
  constructor(
    @InjectRepository(ClinicalEntry)
    private readonly clinicalEntryRepository: Repository<ClinicalEntry>,
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
    entry.content = op.payload?.content || ""
    entry.metadata = op.payload?.metadata ? JSON.stringify(op.payload.metadata) : undefined
    entry.clientId = clientId
    entry.recordedAt = op.clientTimestamp ? new Date(op.clientTimestamp) : new Date()

    const saved = await this.clinicalEntryRepository.save(entry)
    return { id: saved.id, status: "synced" }
  }

  async getEntriesSince(since: Date): Promise<ClinicalEntry[]> {
    return this.clinicalEntryRepository.find({
      where: since ? { createdAt: since as any } : undefined,
      order: { createdAt: "ASC" },
    })
  }
}

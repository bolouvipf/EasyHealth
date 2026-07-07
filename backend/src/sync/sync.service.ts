import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, MoreThanOrEqual } from "typeorm"
import { SyncOperation } from "./sync.entity"
import { ClinicalEntrySyncService } from "./clinical-entry-sync.service"

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncOperation)
    private readonly syncRepository: Repository<SyncOperation>,
    private readonly clinicalEntrySync: ClinicalEntrySyncService,
  ) {}

  async push(deviceId: string, operations: any[]) {
    const results: Array<{ id: string; status: string; resolution?: string }> = []
    for (const op of operations) {
      if (op.entityType === "clinical_entry") {
        const result = await this.clinicalEntrySync.processPushOperation(op)
        results.push(result)
        continue
      }

      const existing = await this.syncRepository.findOne({
        where: { deviceId, entityId: op.entityId, operation: op.operation },
        order: { clientTimestamp: "DESC" },
      })

      if (existing && existing.status === "synced") {
        results.push({ id: existing.id, status: "conflict", resolution: "server_wins" })
        continue
      }

      const syncOp = this.syncRepository.create({
        deviceId,
        entityType: op.entityType,
        entityId: op.entityId,
        operation: op.operation,
        payload: JSON.stringify(op.payload),
        clientTimestamp: new Date(op.clientTimestamp),
        status: "synced",
        serverTimestamp: new Date(),
      })

      const saved = await this.syncRepository.save(syncOp)
      results.push({ id: saved.id, status: "synced" })
    }

    return results
  }

  async pull(deviceId: string, since: string) {
    const sinceDate = since ? new Date(since) : new Date(0)

    const syncOps = await this.syncRepository.find({
      where: {
        status: "synced",
        serverTimestamp: since ? MoreThanOrEqual(sinceDate) : undefined,
      },
      order: { serverTimestamp: "ASC" },
    })

    const sinceDateObj = since ? new Date(since) : new Date(0)
    const clinicalOps = await this.clinicalEntrySync.getEntriesSince(sinceDateObj)
    const clinicalPayloads = clinicalOps.map((e) => ({
      id: e.id,
      entityType: "clinical_entry" as const,
      entityId: e.patientRecordId,
      operation: "create" as const,
      payload: e,
      serverTimestamp: e.createdAt,
    }))

    return [...syncOps, ...clinicalPayloads]
  }

  async getPending(deviceId: string) {
    return this.syncRepository.find({
      where: { deviceId, status: "pending" },
      order: { clientTimestamp: "ASC" },
    })
  }
}

import { Injectable, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SyncOperation } from "./sync.entity"

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncOperation)
    private readonly syncRepository: Repository<SyncOperation>
  ) {}

  async push(deviceId: string, operations: any[]) {
    const results: Array<{ id: string; status: string; resolution?: string }> = []
    for (const op of operations) {
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

    return this.syncRepository.find({
      where: { status: "synced" },
      order: { serverTimestamp: "ASC" },
    })
  }

  async getPending(deviceId: string) {
    return this.syncRepository.find({
      where: { deviceId, status: "pending" },
      order: { clientTimestamp: "ASC" },
    })
  }
}

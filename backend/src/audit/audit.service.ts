import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { AccessLog, AuditAction } from "./audit.entity"

interface LogEntry {
  action: AuditAction
  userId: string
  patientRecordId?: string
  details?: string
  ipAddress?: string
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly auditRepository: Repository<AccessLog>
  ) {}

  async log(entry: LogEntry) {
    const log = this.auditRepository.create(entry)
    return this.auditRepository.save(log)
  }

  async findByPatient(patientRecordId: string) {
    return this.auditRepository.find({
      where: { patientRecordId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    })
  }

  async findByUser(userId: string) {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
  }

  async findAll() {
    return this.auditRepository.find({
      relations: ["user", "patientRecord"],
      order: { createdAt: "DESC" },
      take: 100,
    })
  }
}

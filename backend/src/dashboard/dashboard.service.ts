import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, DataSource } from "typeorm"
import { PatientRecord } from "../patients/patient.entity"
import { ClinicalEntry } from "../patients/clinical-entry.entity"
import { User } from "../auth/user.entity"
import { AccessLog } from "../audit/audit.entity"
import { UserRole } from "../common/decorators/roles.decorator"

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRepository: Repository<PatientRecord>,
    @InjectRepository(ClinicalEntry)
    private readonly clinicalEntryRepository: Repository<ClinicalEntry>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    private readonly dataSource: DataSource,
  ) {}

  async getMedecinDashboard(userId: string) {
    const myPatients = await this.patientRepository.count({ where: { createdById: userId, isActive: true } })
    const totalPatients = await this.patientRepository.count({ where: { isActive: true } })
    const recentEntries = await this.clinicalEntryRepository.count({
      where: { authorId: userId },
    })
    const recentActivity = await this.accessLogRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 10,
      relations: ["patientRecord"],
    })
    return { myPatients, totalPatients, entriesWritten: recentEntries, recentActivity }
  }

  async getInfirmierDashboard(userId: string) {
    const myPatients = await this.patientRepository.count({ where: { createdById: userId, isActive: true } })
    const totalPatients = await this.patientRepository.count({ where: { isActive: true } })
    const recentEntries = await this.clinicalEntryRepository.find({
      where: { authorId: userId },
      order: { createdAt: "DESC" },
      take: 20,
    })
    return { myPatients, totalPatients, recentEntries }
  }

  async getAgentDashboard(userId: string) {
    const myPatients = await this.patientRepository.count({ where: { createdById: userId, isActive: true } })
    const recentPatients = await this.patientRepository.find({
      where: { createdById: userId, isActive: true },
      order: { createdAt: "DESC" },
      take: 5,
    })
    return { myPatients, recentPatients }
  }

  async getAdministratifDashboard() {
    const totalPatients = await this.patientRepository.count({ where: { isActive: true } })
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const patientsToday = await this.patientRepository
      .createQueryBuilder("p")
      .where("p.isActive = :active", { active: true })
      .andWhere("p.createdAt >= :start AND p.createdAt <= :end", { start: todayStart, end: todayEnd })
      .getCount()
    return { totalPatients, patientsToday }
  }

  async getPatientDashboard(userId: string) {
    const totalRecords = await this.patientRepository.count({ where: { createdById: userId, isActive: true } })
    const totalEntries = await this.clinicalEntryRepository
      .createQueryBuilder("e")
      .innerJoin("e.patientRecord", "p")
      .where("p.createdById = :userId", { userId })
      .andWhere("p.isActive = :active", { active: true })
      .getCount()
    return { totalRecords, totalEntries }
  }
}

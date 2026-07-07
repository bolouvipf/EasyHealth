import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository, DataSource } from "typeorm"
import { DashboardService } from "./dashboard.service"
import { PatientRecord } from "../patients/patient.entity"
import { ClinicalEntry } from "../patients/clinical-entry.entity"
import { User } from "../auth/user.entity"
import { AccessLog } from "../audit/audit.entity"

describe("DashboardService", () => {
  let service: DashboardService
  let patientRepo: jest.Mocked<Repository<PatientRecord>>
  let entryRepo: jest.Mocked<Repository<ClinicalEntry>>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(PatientRecord),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ClinicalEntry),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AccessLog),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(DashboardService)
    patientRepo = module.get(getRepositoryToken(PatientRecord))
    entryRepo = module.get(getRepositoryToken(ClinicalEntry))
  })

  describe("getMedecinDashboard", () => {
    it("devrait retourner les statistiques médecin", async () => {
      patientRepo.count.mockResolvedValueOnce(5).mockResolvedValueOnce(20)
      entryRepo.count.mockResolvedValue(42)

      const result = await service.getMedecinDashboard("user-1")

      expect(result.myPatients).toBe(5)
      expect(result.totalPatients).toBe(20)
      expect(result.entriesWritten).toBe(42)
    })
  })

  describe("getPatientDashboard", () => {
    it("devrait retourner les statistiques patient", async () => {
      patientRepo.count.mockResolvedValue(2)
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(8),
      }
      entryRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any)

      const result = await service.getPatientDashboard("user-1")

      expect(result.totalRecords).toBe(2)
      expect(result.totalEntries).toBe(8)
    })
  })

  describe("getAdministratifDashboard", () => {
    it("devrait retourner les statistiques administratives", async () => {
      patientRepo.count.mockResolvedValue(50)
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
      }
      patientRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any)

      const result = await service.getAdministratifDashboard()

      expect(result.totalPatients).toBe(50)
      expect(result.patientsToday).toBe(3)
    })
  })
})

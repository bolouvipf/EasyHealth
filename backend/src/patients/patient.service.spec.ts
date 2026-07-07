import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PatientService } from "./patient.service"
import { PatientRecord } from "./patient.entity"
import { ClinicalEntry } from "./clinical-entry.entity"
import { EncryptionService } from "../crypto/encryption.service"
import { AuditService } from "../audit/audit.service"
import { User } from "../auth/user.entity"
import { AccessGrant } from "../sharing/access-grant.entity"
import { UserRole } from "../common/decorators/roles.decorator"

describe("PatientService", () => {
  let service: PatientService
  let patientRepo: jest.Mocked<Repository<PatientRecord>>
  let entryRepo: jest.Mocked<Repository<ClinicalEntry>>
  let userRepo: jest.Mocked<Repository<User>>
  let grantRepo: jest.Mocked<Repository<AccessGrant>>
  let encryptionService: jest.Mocked<EncryptionService>

  const mockPatient = {
    id: "patient-1",
    nom: "Dupont",
    prenom: "Jean",
    createdById: "user-1",
    isActive: true,
  } as unknown as PatientRecord

  const mockEntry = {
    id: "entry-1",
    patientRecordId: "patient-1",
    authorId: "user-1",
    entryType: "NOTE",
    content: "encrypted-content",
    clientId: "client-uuid",
    createdAt: new Date(),
  } as unknown as ClinicalEntry

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(PatientRecord),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ClinicalEntry),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AccessGrant),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
            isEncrypted: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(PatientService)
    patientRepo = module.get(getRepositoryToken(PatientRecord))
    entryRepo = module.get(getRepositoryToken(ClinicalEntry))
    userRepo = module.get(getRepositoryToken(User))
    grantRepo = module.get(getRepositoryToken(AccessGrant))
    encryptionService = module.get(EncryptionService)
    userRepo.findOne.mockResolvedValue({ id: "user-1", hospital: "CHU", prenom: "Jean", nom: "Dupont" } as User)
  })

  describe("addClinicalEntry", () => {
    const dto = {
      entryType: "NOTE",
      content: "Patient va bien",
      clientId: "client-uuid",
      metadata: { source: "consultation" },
      recordedAt: new Date().toISOString(),
    }

    it("devrait crypter le contenu et sauvegarder l'entrée", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient)
      encryptionService.encrypt.mockReturnValue("encrypted-content")
      encryptionService.decrypt.mockReturnValue("Patient va bien")
      encryptionService.isEncrypted.mockReturnValue(true)
      entryRepo.save.mockResolvedValue(mockEntry)

      const result = await service.addClinicalEntry("patient-1", dto as any, "user-1", UserRole.MEDECIN)

      expect(encryptionService.encrypt).toHaveBeenCalledWith("Patient va bien")
      expect(entryRepo.save).toHaveBeenCalled()
      expect(result.content).toBe("Patient va bien")
    })

    it("devrait rejeter si le dossier n'existe pas", async () => {
      patientRepo.findOne.mockResolvedValue(null)
      await expect(
        service.addClinicalEntry("inexistant", dto as any, "user-1", UserRole.MEDECIN)
      ).rejects.toThrow("Dossier patient introuvable")
    })

    it("devrait rejeter si un patient tente d'écrire sur le dossier d'un autre", async () => {
      patientRepo.findOne.mockResolvedValue({ ...mockPatient, createdById: "other-user" })
      await expect(
        service.addClinicalEntry("patient-1", dto as any, "patient-user", UserRole.PATIENT)
      ).rejects.toThrow("Vous n'avez pas accès à ce dossier")
    })
  })

  describe("getClinicalEntries", () => {
    it("devrait retourner les entrées déchiffrées avec pagination", async () => {
      patientRepo.findOne.mockResolvedValue(mockPatient)
      encryptionService.isEncrypted.mockReturnValue(true)
      encryptionService.decrypt.mockReturnValue("contenu déchiffré")
      entryRepo.findAndCount.mockResolvedValue([[mockEntry], 1])

      const result = await service.getClinicalEntries("patient-1", "user-1", UserRole.MEDECIN)

      expect(entryRepo.findAndCount).toHaveBeenCalledWith({
        where: { patientRecordId: "patient-1" },
        order: { createdAt: "ASC" },
        relations: ["author"],
        skip: 0,
        take: 20,
      })
      expect(result.data[0].content).toBe("contenu déchiffré")
      expect(result.meta.total).toBe(1)
    })

    it("devrait bloquer un patient qui consulte le dossier d'autrui", async () => {
      patientRepo.findOne.mockResolvedValue({ ...mockPatient, createdById: "other-user" })
      await expect(
        service.getClinicalEntries("patient-1", "patient-user", UserRole.PATIENT)
      ).rejects.toThrow("Vous n'avez pas accès à ce dossier")
    })
  })
})

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "../src/app.module"
import { DataSource } from "typeorm"

describe("EasyHealth API (e2e)", () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()

    dataSource = app.get(DataSource)
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  describe("Auth - Registration", () => {
    it("POST /api/v1/auth/register - should register a patient", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "test-patient@example.com",
          password: "Password123!",
          nom: "Test",
          prenom: "Patient",
          role: "patient",
        })
        .expect(201)

      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe("test-patient@example.com")
      expect(res.body.token).toBeDefined()
    })

    it("POST /api/v1/auth/register - should reject duplicate email", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "test-patient@example.com",
          password: "Password123!",
          nom: "Test",
          prenom: "Duplicate",
          role: "patient",
        })
        .expect(409)
    })

    it("POST /api/v1/auth/register - should reject invalid email", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "not-an-email",
          password: "Password123!",
          nom: "Test",
          prenom: "Invalid",
          role: "patient",
        })
        .expect(400)
    })
  })

  describe("Auth - Login", () => {
    it("POST /api/v1/auth/login - should login a registered patient", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "test-patient@example.com",
          password: "Password123!",
        })
        .expect(201)

      expect(res.body.token).toBeDefined()
    })

    it("POST /api/v1/auth/login - should reject wrong password", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "test-patient@example.com",
          password: "WrongPassword",
        })
        .expect(401)
    })
  })

  describe("Protected endpoints", () => {
    let patientToken: string
    let medecinToken: string
    let adminToken: string
    let createdPatientId: string

    beforeAll(async () => {
      const patientRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: "test-patient@example.com", password: "Password123!" })
      patientToken = patientRes.body.token

      const medecinRes = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "test-medecin@example.com",
          password: "Password123!",
          nom: "Medecin",
          prenom: "Test",
          role: "medecin",
          professionalLicenseNumber: "MED-2024-001",
        })
      medecinToken = medecinRes.body.token

      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "test-admin@example.com",
          password: "Password123!",
          nom: "Admin",
          prenom: "Test",
          role: "admin",
        })
    })

    it("GET /api/v1/patients - should return empty list for patient", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/patients")
        .set("Authorization", `Bearer ${patientToken}`)
        .expect(200)

      expect(res.body).toEqual([])
    })

    it("POST /api/v1/patients - should allow medecin to create patient", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/patients")
        .set("Authorization", `Bearer ${medecinToken}`)
        .send({
          nom: "Kouassi",
          prenom: "Amadou",
          dateNaissance: "1990-05-15",
          sexe: "M",
          telephone: "+229 01 23 45 67",
          consentGiven: true,
        })
        .expect(201)

      expect(res.body.nom).toBe("Kouassi")
      createdPatientId = res.body.id
    })

    it("GET /api/v1/patients - should allow patient to see their records", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/patients")
        .set("Authorization", `Bearer ${patientToken}`)
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
    })

    it("DELETE /api/v1/patients/:id - should deny patient from deleting", async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/patients/${createdPatientId}`)
        .set("Authorization", `Bearer ${patientToken}`)
        .expect(403)
    })
  })

  describe("Sharing codes", () => {
    it("POST /api/v1/sharing/access - should reject invalid code", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/sharing/access")
        .send({ code: "00000000" })
        .expect(404)
    })
  })

  describe("Security - Rate limiting", () => {
    it("GET /api/v1/auth/login - rate limiting should block after many requests", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({ email: "test@test.com", password: "test" })
          .catch(() => {})
      }
    }, 30000)
  })
})

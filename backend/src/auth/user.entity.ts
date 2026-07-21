import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from "typeorm"
import { Exclude } from "class-transformer"
import { UserRole } from "../common/decorators/roles.decorator"
import { PatientRecord } from "../patients/patient.entity"
import { AccessLog } from "../audit/audit.entity"

export type ProfessionalStatus = "pending" | "verified" | "rejected"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  @Index()
  email: string

  @Column()
  @Exclude()
  password: string

  @Column()
  nom: string

  @Column()
  prenom: string

  @Column({ type: "simple-enum", enum: UserRole })
  @Index()
  role: UserRole

  @Column({ nullable: true })
  telephone: string

  @Column({ nullable: true })
  professionalLicenseNumber: string

  @Column({ nullable: true })
  hospital: string

  @Column({ type: "simple-enum", enum: ["pending", "verified", "rejected"], default: "pending" })
  professionalStatus: ProfessionalStatus

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  consentDate: Date | null

  @Column({ default: false })
  consentGiven: boolean

  @Column({ default: 0 })
  failedLoginAttempts: number

  @Column({ default: 0 })
  tokenVersion: number

  @Column({ nullable: true })
  lockedUntil: Date | null

  @Column({ nullable: true })
  lastLoginAt: Date | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => PatientRecord, (record) => record.createdBy)
  createdRecords: PatientRecord[]

  @OneToMany(() => PatientRecord, (record) => record.user)
  patientRecords: PatientRecord[]

  @OneToMany(() => AccessLog, (log) => log.user)
  accessLogs: AccessLog[]
}

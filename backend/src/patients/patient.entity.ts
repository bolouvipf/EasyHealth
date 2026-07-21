import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm"
import { User } from "../auth/user.entity"
import { AccessLog } from "../audit/audit.entity"
import { SharingCode } from "../sharing/sharing.entity"
import { ClinicalEntry } from "./clinical-entry.entity"

@Entity("patient_records")
@Index(["isActive", "createdAt"])
@Index(["createdById", "isActive"])
@Index(["userId", "isActive"])
export class PatientRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  nom: string

  @Column()
  prenom: string

  @Column({ nullable: true })
  dateNaissance: Date

  @Column({ nullable: true })
  sexe: string

  @Column({ nullable: true })
  groupeSanguin: string

  @Column({ nullable: true })
  telephone: string

  @Column({ nullable: true })
  adresse: string

  @Column({ nullable: true })
  profession: string

  @Column({ type: "text", nullable: true })
  encryptedData?: string

  @Column({ default: false })
  consentGiven: boolean

  @Column({ type: "text", nullable: true, transformer: { to: (v: Date | null) => v?.toISOString() ?? null, from: (v: string | null) => v ? new Date(v) : null } })
  consentDate: Date | null

  @Column({ default: false })
  isActive: boolean

  @ManyToOne(() => User, (user) => user.createdRecords)
  @JoinColumn({ name: "created_by_id" })
  createdBy: User

  @Column({ nullable: true })
  createdById: string

  @ManyToOne(() => User, (user) => user.patientRecords)
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ nullable: true })
  userId: string

  @OneToMany(() => AccessLog, (log) => log.patientRecord)
  accessLogs: AccessLog[]

  @OneToMany(() => SharingCode, (code) => code.patientRecord)
  sharingCodes: SharingCode[]

  @OneToMany(() => ClinicalEntry, (entry) => entry.patientRecord)
  clinicalEntries: ClinicalEntry[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

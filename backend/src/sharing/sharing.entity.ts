import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { PatientRecord } from "../patients/patient.entity"

@Entity("sharing_codes")
export class SharingCode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column()
  patientRecordId: string

  @ManyToOne(() => PatientRecord, (record) => record.sharingCodes)
  @JoinColumn({ name: "patient_record_id" })
  patientRecord: PatientRecord

  @Column({ default: false })
  isUsed: boolean

  @Column({ nullable: true })
  usedById: string

  @Column({ type: "text", nullable: true, transformer: { to: (v: Date | null | undefined) => v?.toISOString() ?? null, from: (v: string | null) => v ? new Date(v) : null } })
  usedAt: Date | null

  @Column()
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("sync_operations")
export class SyncOperation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  deviceId: string

  @Column()
  entityType: string

  @Column()
  entityId: string

  @Column({ type: "text" })
  operation: string

  @Column({ type: "text" })
  payload: string

  @Column({ default: "pending" })
  status: string

  @Column({ nullable: true })
  conflictResolution: string

  @Column()
  clientTimestamp: Date

  @Column({ nullable: true })
  serverTimestamp: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

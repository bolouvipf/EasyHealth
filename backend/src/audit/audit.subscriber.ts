import { EntitySubscriberInterface, EventSubscriber } from "typeorm"
import { PatientRecord } from "../patients/patient.entity"

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<PatientRecord> {
  listenTo() {
    return PatientRecord
  }
}

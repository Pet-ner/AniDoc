export interface MedicalRecord {
  id?: number;
  petName: string;
  weight?: number;
  age?: number;
  diagnosis?: string;
  treatment?: string;
  surgery?: {
    id?: number;
    surgeryName?: string;
    surgeryDate?: string;
    anesthesiaType?: string;
    surgeryNote?: string;
    resultUrl?: string;
  };
  hospitalization?: {
    id?: number;
    admissionDate?: string;
    dischargeDate?: string;
    reason?: string;
    imageUrl?: string;
  };
  checkups?: {
    id?: number;
    checkupType?: string;
    checkupDate?: string;
    result?: string;
    resultUrl?: string;
  }[];
  doctorName: string;
  doctorId?: number;
  userName?: string;
  userId?: number;
  reservationDate?: string;
  reservationTime: string;
  reservationId?: number;
  symptom?: string;
  status?: string;
  hasMedicalRecord?: boolean;
  petId?: number;
}

export interface Doctor {
  id: string;
  doctor_id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  hospital: string;
  phone?: string;
  profile_image_url?: string;
  license_number?: string;
  years_of_experience: number;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  email: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  profile_image_url?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  summary?: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: string;
    weight?: string;
    spo2?: number;
    glucose?: string;
  };
  created_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface Report {
  id: string;
  report_id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_id?: string;
  report_type: string;
  original_file_url?: string;
  original_file_name?: string;
  ehr_data: Record<string, unknown>;
  summary?: string;
  findings?: string;
  recommendations?: string;
  lab_name?: string;
  report_date: string;
  status: string;
  created_at: string;
  patient?: Patient;
}

export interface Medicine {
  id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_id?: string;
  medicine_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  route: string;
  morning_dose: boolean;
  afternoon_dose: boolean;
  evening_dose: boolean;
  night_dose: boolean;
  before_food: boolean;
  duration_days?: number;
  start_date: string;
  end_date?: string;
  instructions?: string;
  is_active: boolean;
  created_at: string;
}

export interface DoctorPatientRelation {
  id: string;
  doctor_id: string;
  patient_id: string;
  first_visit_date: string;
  last_visit_date?: string;
  total_visits: number;
  notes?: string;
  patient?: Patient;
}

export interface EHRData {
  test_type: string;
  report_date: string;
  patient_info?: {
    name?: string;
    age?: number;
    gender?: string;
  };
  parameters: Array<{
    name: string;
    value: string | number;
    unit?: string;
    reference_range?: string;
    status?: 'normal' | 'low' | 'high' | 'critical';
  }>;
  interpretation?: string;
  recommendations?: string[];
  raw_text?: string;
}

export const REPORT_TYPES = [
  'Blood Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'ECG',
  'Echo',
  'Stress Test',
  'Pathology',
  'Urinalysis',
  'Lipid Panel',
  'Thyroid Panel',
  'Liver Function Test',
  'Kidney Function Test',
  'Other'
] as const;

export type ReportType = typeof REPORT_TYPES[number];

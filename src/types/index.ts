export interface Patient {
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  contact_phone?: string;
  contact_email?: string;
  home_address_json?: Record<string, any>;
  weight_kg?: number;
  height_cm?: number;
  medical_history_json?: Record<string, any>;
  insurance_info_json?: Record<string, any>;
  preferred_consultation_mode?: 'voice' | 'video' | 'text';
  language_preference: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface TriageSession {
  id: string;
  patient_id: string;
  organization_id: string;
  start_time: string;
  end_time?: string;
  initial_symptoms_description?: string;
  symptom_start_date?: string;
  pain_level?: number;
  urgency_level: 'low' | 'moderate' | 'high' | 'critical';
  ai_recommendation?: string;
  status: 'initiated' | 'in_progress' | 'pending_review' | 'assigned' | 'resolved' | 'escalated' | 'cancelled' | 'resumed';
  assigned_clinician_user_id?: string;
  reviewed_by_clinician_user_id?: string;
  patient_current_location_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'clinician', 'admin', 'developer', 'super_admin')),
  organization_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  primary_practice_address_json JSONB,
  licensing_jurisdictions TEXT[],
  online_status TEXT CHECK (online_status IN ('online', 'offline', 'away')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  type TEXT,
  description TEXT,
  main_address_json JSONB,
  locations_json JSONB,
  contact_person_user_id UUID REFERENCES users(id),
  phone_number TEXT,
  emergency_contact TEXT,
  website_url TEXT,
  booking_url TEXT,
  logo_url TEXT,
  portal_url TEXT,
  subscription_id UUID,
  custom_branding_json JSONB,
  service_area_json JSONB,
  specialties_supported TEXT[],
  operating_hours_json JSONB,
  video_platform_used TEXT,
  ai_preferences_json JSONB,
  data_retention_policy_version TEXT,
  consent_terms_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to users table after organizations table is created
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  home_address_json JSONB,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  medical_history_json JSONB,
  insurance_info_json JSONB,
  preferred_consultation_mode TEXT CHECK (preferred_consultation_mode IN ('voice', 'video', 'text')),
  language_preference TEXT DEFAULT 'en',
  is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Triage Sessions table
CREATE TABLE triage_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  initial_symptoms_description TEXT,
  symptom_start_date DATE,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'moderate', 'high', 'critical')),
  ai_recommendation TEXT,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'in_progress', 'pending_review', 'assigned', 'resolved', 'escalated', 'cancelled', 'resumed')),
  assigned_clinician_user_id UUID REFERENCES users(id),
  reviewed_by_clinician_user_id UUID REFERENCES users(id),
  manual_urgency_override_by_user_id UUID REFERENCES users(id),
  manual_urgency_override_reason TEXT,
  ai_model_version_used TEXT,
  patient_current_location_json JSONB NOT NULL,
  icd_10_codes_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triage Chat Messages table
CREATE TABLE triage_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_session_id UUID NOT NULL REFERENCES triage_sessions(id),
  message_order INTEGER NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'ai', 'clinician')),
  message_content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sentiment_score DECIMAL,
  audio_file_url TEXT,
  ai_voice_id_used TEXT,
  language TEXT DEFAULT 'en'
);

-- Video Consultations table
CREATE TABLE video_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_session_id UUID REFERENCES triage_sessions(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinician_user_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('live', 'asynchronous_message')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'draft')),
  video_recording_url TEXT,
  ai_summary_url TEXT,
  clinician_notes TEXT,
  telehealth_platform_session_id TEXT,
  network_speed_test_json JSONB,
  device_type TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinician Availability table
CREATE TABLE clinician_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_user_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('available', 'booked', 'blocked_off', 'break')),
  associated_consultation_id UUID REFERENCES video_consultations(id),
  reason_blocked TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID NOT NULL REFERENCES users(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'email', 'in_app', 'hospital_system_alert')),
  message_content TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'read', 'dismissed')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_user_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  ip_address TEXT,
  details_json JSONB,
  success BOOLEAN NOT NULL,
  organization_id UUID REFERENCES organizations(id)
);

-- Integration Configs table
CREATE TABLE integration_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  integration_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  base_url TEXT,
  config_json JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings table
CREATE TABLE system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value_json JSONB NOT NULL,
  description TEXT,
  updated_by_user_id UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price_monthly DECIMAL(10,2) NOT NULL,
  billing_model_id UUID NOT NULL,
  features_json JSONB,
  can_integrate_ehr BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Subscriptions table
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'trial', 'cancelled', 'expired')),
  auto_renew BOOLEAN DEFAULT TRUE,
  revenuecat_subscriber_id TEXT UNIQUE,
  current_billing_period_start TIMESTAMPTZ,
  current_billing_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to organizations table after organization_subscriptions is created
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_subscription 
  FOREIGN KEY (subscription_id) REFERENCES organization_subscriptions(id);

-- Usage Metrics table
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('triage_count', 'video_minutes', 'sms_sent', 'email_sent', 'ehr_api_calls', 'elevenlabs_char_stt', 'elevenlabs_char_tts')),
  value DECIMAL NOT NULL,
  date_recorded DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Feedback table
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_session_id UUID UNIQUE NOT NULL REFERENCES triage_sessions(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('accurate_triage', 'inaccurate_triage', 'helpful_advice', 'unhelpful_advice')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  submitted_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Consents table
CREATE TABLE patient_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing Models table
CREATE TABLE billing_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_type TEXT NOT NULL CHECK (model_type IN ('subscription', 'pay_per_use', 'volume_discount', 'hybrid')),
  per_triage_rate_usd DECIMAL(10,2),
  included_triages_quota INTEGER,
  volume_tier_definition_json JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to subscription_plans table after billing_models is created
ALTER TABLE subscription_plans ADD CONSTRAINT fk_subscription_plans_billing_model
  FOREIGN KEY (billing_model_id) REFERENCES billing_models(id);

-- Triage Billing Records table
CREATE TABLE triage_billing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_session_id UUID UNIQUE NOT NULL REFERENCES triage_sessions(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  billed_amount_usd DECIMAL(10,2) NOT NULL,
  billing_method TEXT NOT NULL CHECK (billing_method IN ('included_in_quota', 'overage', 'pay_per_use', 'discounted_volume')),
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EHR Integrations table
CREATE TABLE ehr_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id),
  ehr_system_type TEXT NOT NULL CHECK (ehr_system_type IN ('Epic', 'Cerner', 'Allscripts', 'Other')),
  fhir_endpoint_url TEXT NOT NULL,
  client_id TEXT,
  authentication_method TEXT NOT NULL CHECK (authentication_method IN ('OAuth2', 'API_Key', 'Other')),
  access_token_encrypted TEXT,
  integration_status TEXT NOT NULL CHECK (integration_status IN ('active', 'inactive', 'error')),
  last_sync_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient EHR Data table
CREATE TABLE patient_ehr_data (
  patient_id UUID NOT NULL REFERENCES patients(id),
  ehr_patient_id TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  demographics_json JSONB,
  allergies_json JSONB,
  medications_json JSONB,
  vitals_json JSONB,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (patient_id, organization_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_triage_sessions_patient ON triage_sessions(patient_id);
CREATE INDEX idx_triage_sessions_organization ON triage_sessions(organization_id);
CREATE INDEX idx_triage_chat_messages_session ON triage_chat_messages(triage_session_id);
CREATE INDEX idx_video_consultations_patient ON video_consultations(patient_id);
CREATE INDEX idx_video_consultations_clinician ON video_consultations(clinician_user_id);
CREATE INDEX idx_clinician_availability_user ON clinician_availability(clinician_user_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_usage_metrics_organization ON usage_metrics(organization_id);
CREATE INDEX idx_patient_consents_patient ON patient_consents(patient_id);
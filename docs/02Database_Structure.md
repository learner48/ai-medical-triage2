## 🏛️ Database Architecture: AI Medical Triage Assistant (USA-Only Market, English Only)

The database architecture is designed for **maximum security, compliance (HIPAA), scalability, and maintainability** specifically for operations **within the USA**. It utilizes a **relational database model (PostgreSQL)**, primarily managed via **Supabase**, which offers integrated authentication, real-time capabilities, and object storage.

---

### **1. Core Database System**

*   **Technology**: **PostgreSQL**
    *   **Provider**: **Supabase** (managed service)
*   **Hosting**: Supabase Cloud (ensure US-based region for data residency if required by BAA).
*   **Key Capabilities**: Managed DB, Authentication, Realtime, Object Storage.

### **2. Architectural Principles**

*   **Centralized Relational Model**: Normalized tables with clear relationships, ensuring data integrity.
*   **UUIDs for Primary Keys**: All primary keys are UUIDs for global uniqueness and distributed system compatibility.
*   **Role-Based Access Control (RBAC)**: Enforced at the application layer (Vercel Functions) and rigorously via **Row-Level Security (RLS)** within Supabase, ensuring **HIPAA compliance**.
*   **JSONB for Flexible Schemas**: Used for dynamic or evolving attributes (e.g., medical history, integration configurations, audit log specifics), primarily conforming to **US-specific data structures**.
*   **ENUMs for Data Consistency**: Utilized for fixed sets of values (roles, statuses, urgency levels, notification types, metric types).
*   **Indexing Strategy**: Optimized indexing on foreign keys and frequently queried columns to ensure high performance for real-time dashboards and analytics.
*   **Data Encryption**: All PII (Personally Identifiable Information) and PHI (Protected Health Information) are encrypted both at rest (database-level encryption managed by Supabase) and in transit (SSL/TLS), in line with **HIPAA requirements**.
*   **Soft Deletes**: Critical records (e.g., `patients`, `users`) will use a `deleted_at` timestamp for soft deletion, preserving audit trails and allowing recovery without true data loss, critical for **HIPAA auditing**.

### **3. Database Schema - Table Definitions**

#### **A. User & Organizational Management**

1.  **`users`**
    *   **Purpose**: Central registry for all authenticated individuals interacting with the system **within the USA**. All data and interactions are **in English**.
    *   `id` (UUID, PK)
    *   `email` (TEXT, UNIQUE, NOT NULL)
    *   `password_hash` (TEXT, NOT NULL)
    *   `full_name` (TEXT, NOT NULL)
    *   `phone_number` (TEXT, UNIQUE, NULLABLE) - **US phone number format expected.**
    *   `role` (ENUM: 'patient', 'clinician', 'admin', 'developer', 'super_admin', NOT NULL)
    *   `organization_id` (UUID, FK to `organizations.id`, NULLABLE) - Links clinicians/admins to their US-based organization. **Doctors must be employed by a billing organization; independent doctors are not supported.** Patients can also be linked if registered under a specific US org's portal.
    *   `is_active` (BOOLEAN, DEFAULT TRUE)
    *   `mfa_enabled` (BOOLEAN, DEFAULT FALSE)
    *   `primary_practice_address_json` (JSONB, NULLABLE) - For US-based clinicians: includes `street`, `city`, `state` (US state code, e.g., 'CA'), `zip_code` (US zip code), `country` (DEFAULT 'US'), `timezone`, `latitude`, `longitude`. **Latitude/longitude used for geodesic distance calculation for 50-mile radius clinician matching.**
    *   `licensing_jurisdictions` (TEXT[], NULLABLE) - For US-based clinicians: array of **US state codes** where licensed (e.g., `['CA', 'NY']`). **Used to filter cases to show only patients within a 50-mile radius.**
    *   `online_status` (ENUM: 'online', 'offline', 'away', NULLABLE) - For clinicians.
    *   `last_login_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `deleted_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)

2.  **`organizations`**
    *   **Purpose**: Details of hospitals, clinics, or healthcare networks subscribing to the service **within the USA**. These are the "Client Organizations" being billed.
    *   `id` (UUID, PK)
    *   `name` (TEXT, UNIQUE, NOT NULL)
    *   `type` (TEXT, NULLABLE) - E.g., 'Multi-specialty', 'Eye Clinic', 'Dental' (from onboarding).
    *   `description` (TEXT, NULLABLE) - Optional description (from onboarding).
    *   `main_address_json` (JSONB, NULLABLE) - Main physical address of the **US-based organization** (from onboarding).
    *   `locations_json` (JSONB, NULLABLE) - Array of JSON objects, each representing a branch location **within the USA** with `id`, `name`, `address_json` (US format), `timezone`.
    *   `contact_person_user_id` (UUID, FK to `users.id`, NULLABLE) - Initial `client_admin` for the organization.
    *   `phone_number` (TEXT, NULLABLE) - For organization contact (from onboarding).
    *   `emergency_contact` (TEXT, NULLABLE) - Optional emergency contact for org (from onboarding).
    *   `website_url` (TEXT, NULLABLE) - From onboarding.
    *   `booking_url` (TEXT, NULLABLE) - From onboarding.
    *   `logo_url` (TEXT, NULLABLE) - URL to logo in Supabase Storage.
    *   `portal_url` (TEXT, NULLABLE) - Optional URL to organization's internal portal (from onboarding).
    *   `subscription_id` (UUID, FK to `organization_subscriptions.id`, NULLABLE) - Current active subscription.
    *   `custom_branding_json` (JSONB, NULLABLE) - Stores custom colors, logos for patient portals.
    *   `service_area_json` (JSONB, NULLABLE) - Defines geographic service area **within the USA** (e.g., list of US zip codes, US county codes, geo-boundaries).
    *   `specialties_supported` (TEXT[], NULLABLE) - E.g., 'Cardiology', 'Orthopedics' (from onboarding).
    *   `operating_hours_json` (JSONB, NULLABLE) - Daily operating hours.
    *   `video_platform_used` (TEXT, NULLABLE) - E.g., 'Tavus', 'Twilio' (from onboarding).
    *   `ai_preferences_json` (JSONB, NULLABLE) - AI auto-match/manual review settings.
    *   `data_retention_policy_version` (TEXT, NULLABLE) - Version of data retention policy for this organization (from onboarding).
    *   `consent_terms_document_url` (TEXT, NULLABLE) - URL to their specific consent terms document (from onboarding).
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### **B. Patient & Triage Data**

3.  **`patients`**
    *   **Purpose**: Stores sensitive medical profile data for patients **in the USA**. All data is **in English**.
    *   `id` (UUID, PK)
    *   `user_id` (UUID, FK to `users.id`, UNIQUE, NULLABLE) - Links to registered user account. Null if `is_anonymous` is TRUE for an active guest session.
    *   `organization_id` (UUID, FK to `organizations.id`, NULLABLE) - The US-based org under which this patient record is managed (if applicable).
    *   `first_name` (TEXT, NULLABLE) - **Populated upon full registration. Can be NULL for an initial anonymous guest record.**
    *   `last_name` (TEXT, NULLABLE) - **Populated upon full registration. Can be NULL for an initial anonymous guest record.**
    *   `date_of_birth` (DATE, NULLABLE) - **Populated upon full registration. Can be NULL for an initial anonymous guest record. Used to derive Age.**
    *   `gender` (TEXT, NULLABLE) - **Optional. Consider ENUM for specific options.**
    *   `contact_phone` (TEXT, NULLABLE) - **Optional. US phone number format expected.**
    *   `contact_email` (TEXT, NULLABLE) - **Optional.**
    *   `home_address_json` (JSONB, NULLABLE) - Patient's registered home address **(US format). Optional. Primarily for patient record/profile ("namesake"), not for immediate geo-routing for triage sessions.**
    *   `weight_kg` (DECIMAL, NULLABLE) - **Optional Patient Weight. Collected during registration or later for better diagnosis.**
    *   `height_cm` (DECIMAL, NULLABLE) - **Optional Patient Height. Collected during registration or later for better diagnosis.**
    *   `medical_history_json` (JSONB, NULLABLE) - Flexible storage for **Optional** medical history. **Collected during registration or later for better diagnosis.**
        *   **Ongoing Medical Conditions** (e.g., `["Asthma", "Type 2 Diabetes"]`)
        *   **Allergies** (e.g., `["Penicillin", "Latex"]`)
        *   **Medications Being Taken** (e.g., `[{"name": "Metformin", "dosage": "500mg"}]`)
        *   **Surgical History** (e.g., `[{"procedure": "Appendectomy", "date": "2010-05-15"}]`)
        *   **Vaccination History** (e.g., `[{"vaccine": "MMR", "date": "2000-01-01"}]`)
        *   **Pregnancy Status** (e.g., `{"is_pregnant": true, "due_date": "YYYY-DD-MM"}` for women)
    *   `insurance_info_json` (JSONB, NULLABLE) - Stores **Optional US Insurance Provider** details (e.g., `{"provider": "Blue Cross Blue Shield", "policy_number": "XYZ123"}`). **Collected optionally during registration or later. Not for direct patient billing. May be used in future enhancements for matching with in-network clinicians.**
    *   `preferred_consultation_mode` (ENUM: 'voice', 'video', 'text', NULLABLE) - **Optional. Patient's preferred interaction method. Collected during registration or later.**
    *   `language_preference` (TEXT, DEFAULT 'en') - **Fixed to 'en' for English-only support.**
    *   `is_anonymous` (BOOLEAN, DEFAULT FALSE, NOT NULL) - True if created without a `user_id` for an active guest session. This data can be associated with a permanent user account if the guest registers when prompted during or immediately after the triage session. Otherwise, the anonymous record and associated session data are not stored long-term.
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `deleted_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)

4.  **`triage_sessions`**
    *   **Purpose**: Records each complete or in-progress patient triage interaction **in the USA**, including dynamic data collected during the session.
    *   `id` (UUID, PK)
    *   `patient_id` (UUID, FK to `patients.id`, NOT NULL)
    *   `organization_id` (UUID, FK to `organizations.id`, NOT NULL) - The US-based organization handling this triage.
    *   `start_time` (TIMESTAMP WITH TIME ZONE, NOT NULL)
    *   `end_time` (TIMESTAMP WITH TIME ZONE, NULLABLE) - Nullable for ongoing/resumable sessions.
    *   `initial_symptoms_description` (TEXT, NULLABLE) - **Patient's Chief Complaint / Symptoms (in English).**
    *   `symptom_start_date` (DATE, NULLABLE) - **Dynamically collected: When symptoms began.**
    *   `pain_level` (INTEGER, NULLABLE) - **Dynamically collected: Pain Scale (1-10) if applicable.**
    *   `urgency_level` (ENUM: 'low', 'moderate', 'high', 'critical', NOT NULL) - AI-determined urgency.
    *   `ai_recommendation` (TEXT, NULLABLE) - AI's textual recommendation **in English**.
    *   `status` (ENUM: 'initiated', 'in_progress', 'pending_review', 'assigned', 'resolved', 'escalated', 'cancelled', 'resumed', NOT NULL)
    *   `assigned_clinician_user_id` (UUID, FK to `users.id`, NULLABLE) - US-licensed clinician assigned to review/follow up.
    *   `reviewed_by_clinician_user_id` (UUID, FK to `users.id`, NULLABLE) - US-licensed clinician who marked it as reviewed/resolved.
    *   `manual_urgency_override_by_user_id` (UUID, FK to `users.id`, NULLABLE) - If a clinician manually changed urgency.
    *   `manual_urgency_override_reason` (TEXT, NULLABLE)
    *   `ai_model_version_used` (TEXT, NULLABLE) - Tracks which AI model version generated the assessment.
    *   `patient_current_location_json` (JSONB, NOT NULL) - Snapshot of patient's location during this specific triage: includes `city`, `state` (US state code), `zip_code` (US zip code), `country` (DEFAULT 'US'), `timezone`, `latitude`, `longitude`. **Captured every time a triage session starts. This is the primary location used for session-specific routing, ER suggestions, and clinician matching within a 50-mile radius.**
    *   `icd_10_codes_json` (JSONB, NULLABLE) - Suggested ICD-10 codes based on triage (optional for future, **US standard**).
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

5.  **`triage_chat_messages`**
    *   **Purpose**: Stores the transcript of each triage session's conversation.
    *   `id` (UUID, PK)
    *   `triage_session_id` (UUID, FK to `triage_sessions.id`, NOT NULL)
    *   `message_order` (INTEGER, NOT NULL) - To maintain chronological order.
    *   `sender_type` (ENUM: 'patient', 'ai', 'clinician', NOT NULL)
    *   `message_content` (TEXT, NOT NULL) - **Only English content.**
    *   `timestamp` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `sentiment_score` (DECIMAL, NULLABLE) - From ElevenLabs.
    *   `audio_file_url` (TEXT, NULLABLE) - URL to original patient voice input (Supabase Storage).
    *   `ai_voice_id_used` (TEXT, NULLABLE) - Which ElevenLabs voice ID was used for TTS output.
    *   `language` (TEXT, DEFAULT 'en') - **Fixed to 'en'.**

#### **C. Consultation & Availability Data**

6.  **`video_consultations`**
    *   **Purpose**: Records details of live and asynchronous video consultations. All consultations are **in English**. For registered users only.
    *   `id` (UUID, PK)
    *   `triage_session_id` (UUID, FK to `triage_sessions.id`, NULLABLE) - Linked to a specific triage result.
    *   `patient_id` (UUID, FK to `patients.id`, NOT NULL)
    *   `clinician_user_id` (UUID, FK to `users.id`, NOT NULL)
    *   `start_time` (TIMESTAMP WITH TIME ZONE, NOT NULL)
    *   `end_time` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `consultation_type` (ENUM: 'live', 'asynchronous_message', NOT NULL)
    *   `status` (ENUM: 'scheduled', 'in_progress', 'completed', 'cancelled', 'draft', NOT NULL)
    *   `video_recording_url` (TEXT, NULLABLE) - **Always NULL as consultations are NOT recorded.**
    *   `ai_summary_url` (TEXT, NULLABLE) - URL to Tavus AI-generated video summary.
    *   `clinician_notes` (TEXT, NULLABLE) - **In English.**
    *   `telehealth_platform_session_id` (TEXT, NULLABLE) - External ID from video SDK (e.g., Twilio Room SID).
    *   `network_speed_test_json` (JSONB, NULLABLE) - **Stores details about patient's network speed during video calls.**
    *   `device_type` (TEXT, NULLABLE) - **Device used by patient (e.g., 'mobile', 'desktop').**
    *   `duration_minutes` (INTEGER, NULLABLE) - Actual duration of the consultation. **Max duration is 20 minutes.**
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   **Note:** If video connection fails, participants must start again. Only one patient and one clinician per consultation.

7.  **`clinician_availability`**
    *   **Purpose**: Manages clinician schedules and availability for consultations **within the USA**.
    *   `id` (UUID, PK)
    *   `clinician_user_id` (UUID, FK to `users.id`, NOT NULL)
    *   `start_time` (TIMESTAMP WITH TIME ZONE, NOT NULL)
    *   `end_time` (TIMESTAMP WITH TIME ZONE, NOT NULL)
    *   `timezone` (TEXT, NOT NULL) - Clinician's specific **US timezone** for this slot.
    *   `slot_type` (ENUM: 'available', 'booked', 'blocked_off', 'break', NOT NULL)
    *   `associated_consultation_id` (UUID, FK to `video_consultations.id`, UNIQUE, NULLABLE) - Links if slot is booked.
    *   `reason_blocked` (TEXT, NULLABLE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### **D. Administration & System Management**

8.  **`notifications`**
    *   **Purpose**: Stores details of all system-generated notifications. All messages are **in English**.
    *   `id` (UUID, PK)
    *   `recipient_user_id` (UUID, FK to `users.id`, NOT NULL)
    *   `notification_type` (ENUM: 'sms', 'email', 'in_app', 'hospital_system_alert', NOT NULL)
    *   `message_content` (TEXT, NOT NULL)
    *   `related_entity_type` (TEXT, NULLABLE) - E.g., 'triage_session', 'video_consultation'.
    *   `related_entity_id` (UUID, NULLABLE) - ID of the related entity.
    *   `status` (ENUM: 'pending', 'sent', 'failed', 'read', 'dismissed', NOT NULL)
    *   `sent_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `read_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

9.  **`audit_logs`**
    *   **Purpose**: Comprehensive logging for **HIPAA compliance**, security, and debugging. All details are **in English**.
    *   `id` (UUID, PK)
    *   `timestamp` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `actor_user_id` (UUID, FK to `users.id`, NULLABLE) - User who performed the action.
    *   `action_type` (TEXT, NOT NULL) - E.g., 'LOGIN_SUCCESS', 'PATIENT_RECORD_UPDATED', 'TRIAGE_STATUS_CHANGED', 'DATA_EXPORT', 'CONSENT_GRANTED'.
    *   `entity_type` (TEXT, NULLABLE) - E.g., 'patient', 'triage_session', 'user', 'organization', 'consent'.
    *   `entity_id` (UUID, NULLABLE) - ID of the affected entity.
    *   `ip_address` (TEXT, NULLABLE) - IP address from which the action originated.
    *   `details_json` (JSONB, NULLABLE) - JSON with context (e.g., `old_value`, `new_value`, `reason`, `device_info` (can store device type here)).
    *   `success` (BOOLEAN, NOT NULL) - Whether the action was successful.
    *   `organization_id` (UUID, FK to `organizations.id`, NULLABLE) - If the action is specific to a US-based organization's data.

10. **`integration_configs`**
    *   **Purpose**: Stores API keys and configuration details for third-party integrations, specifically for **US-based services**.
    *   `id` (UUID, PK)
    *   `organization_id` (UUID, FK to `organizations.id`, NULLABLE) - If integration is org-specific (e.g., US EHR credentials). NULL if global.
    *   `integration_name` (TEXT, NOT NULL) - E.g., 'ElevenLabs', 'Tavus', 'Twilio', 'RevenueCat', 'EHR_Epic' (**US-specific EHRs**).
    *   `api_key_encrypted` (TEXT, NOT NULL) - **Crucially, encrypted at rest.**
    *   `base_url` (TEXT, NULLABLE)
    *   `config_json` (JSONB, NULLABLE) - Additional config (e.g., webhook URLs, specific client IDs).
    *   `is_active` (BOOLEAN, DEFAULT TRUE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

11. **`system_settings`**
    *   **Purpose**: Stores application-wide global settings and feature flags for dynamic control, primarily for **US operations**.
    *   `setting_key` (TEXT, PK)
    *   `setting_value_json` (JSONB, NOT NULL)
    *   `description` (TEXT, NULLABLE)
    *   `updated_by_user_id` (UUID, FK to `users.id`, NULLABLE)
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### **E. Monetization & Analytics Data**

12. **`subscription_plans`**
    *   **Purpose**: Defines the available subscription tiers, priced **in USD**, referencing `billing_models` for specific pricing rules. **Patients are not billed; only Hospitals and Clinics are.**
    *   `id` (UUID, PK)
    *   `name` (TEXT, UNIQUE, NOT NULL) - 'Basic', 'Standard', 'Premium'.
    *   `description` (TEXT, NULLABLE)
    *   `base_price_monthly` (DECIMAL(10, 2), NOT NULL) - **In USD.**
    *   `billing_model_id` (UUID, FK to `billing_models.id`, NOT NULL) - **Link to a specific billing model definition (e.g., subscription, pay-per-use, hybrid).**
    *   `features_json` (JSONB, NULLABLE) - List of features included.
    *   `can_integrate_ehr` (BOOLEAN, DEFAULT FALSE) - Refers to **US EHRs**.
    *   `is_active` (BOOLEAN, DEFAULT TRUE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

13. **`organization_subscriptions`**
    *   **Purpose**: Tracks each US-based organization's active subscription.
    *   `id` (UUID, PK)
    *   `organization_id` (UUID, FK to `organizations.id`, NOT NULL)
    *   `plan_id` (UUID, FK to `subscription_plans.id`, NOT NULL)
    *   `start_date` (DATE, NOT NULL)
    *   `end_date` (DATE, NULLABLE)
    *   `status` (ENUM: 'active', 'trial', 'cancelled', 'expired', NOT NULL)
    *   `auto_renew` (BOOLEAN, DEFAULT TRUE)
    *   `revenuecat_subscriber_id` (TEXT, UNIQUE, NULLABLE) - External ID from RevenueCat.
    *   `current_billing_period_start` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `current_billing_period_end` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

14. **`usage_metrics`**
    *   **Purpose**: Records usage for usage-based billing and analytics. **Billing is per-session based on their doctors' activity.**
    *   `id` (UUID, PK)
    *   `organization_id` (UUID, FK to `organizations.id`, NOT NULL)
    *   `metric_type` (ENUM: 'triage_count', 'video_minutes', 'sms_sent', 'email_sent', 'ehr_api_calls', 'elevenlabs_char_stt', 'elevenlabs_char_tts', NOT NULL)
    *   `value` (DECIMAL, NOT NULL) - The actual measured value.
    *   `date_recorded` (DATE, NOT NULL) - Date for which usage is recorded (e.g., daily aggregates).
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### **F. AI Feedback & Consent Management**

15. **`ai_feedback`**
    *   **Purpose**: Stores explicit patient/clinician feedback on AI accuracy and helpfulness. All comments are **in English**.
    *   `id` (UUID, PK)
    *   `triage_session_id` (UUID, FK to `triage_sessions.id`, UNIQUE, NOT NULL)
    *   `feedback_type` (ENUM: 'accurate_triage', 'inaccurate_triage', 'helpful_advice', 'unhelpful_advice', NOT NULL)
    *   `rating` (INTEGER, 1-5, NULLABLE)
    *   `comments` (TEXT, NULLABLE)
    *   `submitted_by_user_id` (UUID, FK to `users.id`, NULLABLE) - If a registered user or clinician.
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

16. **`patient_consents`**
    *   **Purpose**: Logs explicit patient consent for data handling, video recording, etc., compliant with **US privacy laws (HIPAA)**.
    *   `id` (UUID, PK)
    *   `patient_id` (UUID, FK to `patients.id`, NOT NULL)
    *   `consent_type` (TEXT, NOT NULL) - E.g., 'data_privacy_policy', 'video_recording_permission' (though video is not recorded), 'data_sharing_research'. Content of policies will be **in English** and **US-specific**.
    *   `consent_version` (TEXT, NOT NULL) - Link to specific policy version (e.g., a hash or version number).
    *   `is_granted` (BOOLEAN, NOT NULL)
    *   `granted_at` (TIMESTAMP WITH TIME ZONE, NOT NULL)
    *   `revoked_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `ip_address` (TEXT, NULLABLE) - IP address from which consent was given/revoked.
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

17. **`billing_models`**
    *   **Purpose**: Defines the specific rules for different billing models that `subscription_plans` can reference.
    *   `id` (UUID, PK)
    *   `model_type` (ENUM: 'subscription', 'pay_per_use', 'volume_discount', 'hybrid', NOT NULL) - **Billing is Per session based/pay per session is available on top of pricing tiers.**
    *   `per_triage_rate_usd` (DECIMAL(10, 2), NULLABLE) - Rate for pay-per-use or overage.
    *   `included_triages_quota` (INTEGER, NULLABLE) - For subscription plans.
    *   `volume_tier_definition_json` (JSONB, NULLABLE) - Defines tiers for volume discounts (e.g., `[{"min_triages": 1000, "rate_usd": 5.00}]`).
    *   `description` (TEXT, NULLABLE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

18. **`triage_billing_records`**
    *   **Purpose**: Records the specific billing event for each individual triage session, showing how it was charged. **Billing records are created when a triage session is marked as 'resolved' by the assigned/reviewing clinician, reflecting their active participation and completion of the case for the organization.**
    *   `id` (UUID, PK)
    *   `triage_session_id` (UUID, FK to `triage_sessions.id`, UNIQUE, NOT NULL)
    *   `organization_id` (UUID, FK to `organizations.id`, NOT NULL)
    *   `billed_amount_usd` (DECIMAL(10, 2), NOT NULL)
    *   `billing_method` (ENUM: 'included_in_quota', 'overage', 'pay_per_use', 'discounted_volume', NOT NULL)
    *   `processed_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

19. **`ehr_integrations`**
    *   **Purpose**: Stores configuration details for each organization's EHR integration. **EHR integration is optional for client organizations. This table supports this optionality; data is populated only if an organization enables and configures this feature.**
    *   `id` (UUID, PK)
    *   `organization_id` (UUID, FK to `organizations.id`, UNIQUE, NOT NULL)
    *   `ehr_system_type` (ENUM: 'Epic', 'Cerner', 'Allscripts', 'Other', NOT NULL) - Type of EHR system prevalent in the USA.
    *   `fhir_endpoint_url` (TEXT, NOT NULL) - FHIR server base URL.
    *   `client_id` (TEXT, NULLABLE) - OAuth client ID.
    *   `authentication_method` (ENUM: 'OAuth2', 'API_Key', 'Other', NOT NULL)
    *   `access_token_encrypted` (TEXT, NULLABLE) - Encrypted access token if applicable.
    *   `integration_status` (ENUM: 'active', 'inactive', 'error', NOT NULL)
    *   `last_sync_timestamp` (TIMESTAMP WITH TIME ZONE, NULLABLE)
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

20. **`patient_ehr_data`**
    *   **Purpose**: Caches or links specific patient data pulled from EHRs, structured by common medical fields, reducing direct EHR calls. This data is relevant to US patients. **EHR data is displayed to doctors during consultations (patient medical history, previous diagnoses, medications, allergies). Doctors can input new data (notes, prescriptions, referrals) back into the patient's EHR after consultations. This data is NOT tracked for guest users. This table supports optional EHR integration; data is populated only if an organization enables this feature and patient consent is obtained.**
    *   `patient_id` (UUID, FK to `patients.id`, UNIQUE, NOT NULL)
    *   `ehr_patient_id` (TEXT, NOT NULL) - Patient's ID in the external EHR system.
    *   `organization_id` (UUID, FK to `organizations.id`, NOT NULL) - The US-based organization whose EHR this data came from.
    *   `demographics_json` (JSONB, NULLABLE) - Cached patient demographics (e.g., US address, contact info from EHR).
    *   `allergies_json` (JSONB, NULLABLE) - Cached allergies from EHR.
    *   `medications_json` (JSONB, NULLABLE) - Cached medications from EHR.
    *   `vitals_json` (JSONB, NULLABLE) - Cached recent vitals from EHR.
    *   `last_synced_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
    *   **Note:** No existing patient records, doctor profiles, or historical consultations are migrated when organizations join. Data migration is optional and handled by the Organization/Hospital IT Team.

---

### **4. Relationships Overview**

*   `users` 1:N `patients` (a user can have 0 or 1 patient profile)
*   `users` 1:N `triage_sessions` (as `assigned_clinician_user_id` or `reviewed_by_clinician_user_id`)
*   `users` 1:N `video_consultations` (as `clinician_user_id`)
*   `users` 1:N `notifications` (as `recipient_user_id`)
*   `users` 1:N `audit_logs` (as `actor_user_id`)
*   `users` 1:N `clinician_availability`
*   `organizations` 1:N `users` (for clinicians/admins)
*   `organizations` 1:N `patients` (if managed by org)
*   `organizations` 1:N `triage_sessions`
*   `organizations` 1:N `organization_subscriptions`
*   `organizations` 1:N `usage_metrics`
*   `organizations` 1:N `integration_configs` (for org-specific integrations)
*   `organizations` 1:1 `ehr_integrations` (an organization has one EHR integration configuration)
*   `patients` 1:N `triage_sessions`
*   `patients` 1:N `video_consultations`
*   `patients` 1:N `patient_consents`
*   `patients` 1:1 `patient_ehr_data` (a patient may have one cached EHR record if EHR integration is active)
*   `triage_sessions` 1:N `triage_chat_messages`
*   `triage_sessions` 1:N `video_consultations` (a triage can lead to 0 or more consultations)
*   `triage_sessions` 1:1 `ai_feedback` (a triage session can have one feedback record)
*   `triage_sessions` 1:1 `triage_billing_records` (a triage session has one billing record)
*   `subscription_plans` 1:N `organization_subscriptions`
*   `subscription_plans` M:1 `billing_models` (each plan references one billing model definition; multiple plans can reference the same model)
*   `organization_subscriptions` 1:1 `organizations` (Corrected from 1:1 to Many:1, organization has one active subscription at a time, but can have historical ones) -> Rechecking: `organizations.subscription_id` is a FK to `organization_subscriptions.id`. So an organization has one *current* subscription. An `organization_subscriptions` record belongs to one `organization_id`. This is effectively 1:1 for the *current* subscription concept, but 1:N if considering historical subscriptions. For clarity:
    *   `organizations` 1:1 `organization_subscriptions` (for the `subscription_id` field linking to the current active one)
    *   `organizations` 1:N `organization_subscriptions` (if considering all historical subscriptions an org might have had, linked by `organization_id` in `organization_subscriptions`)
*   `video_consultations` 1:1 `clinician_availability` (a booked slot is for one consultation)
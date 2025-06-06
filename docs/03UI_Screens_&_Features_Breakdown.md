* * ## 🎨 UI Screens & Features Breakdown by User Hierarchy (USA-Only Market, English Only)

    This section details the primary user interface screens available for each user role within the AI Medical Triage Assistant, based on their defined access level and management responsibilities, **specifically tailored for the USA market with English-only support.**

    ---

    ### **1. Your Team (The SaaS Provider)**

    [...]

    #### **A. Super Admin (via Super Admin Portal)**
    *   **Purpose**: Centralized control panel for managing all client `organizations` *within the USA*, global `users`, platform-wide `settings`, and top-level `monetization` aspects, with strict adherence to **HIPAA compliance**.
    *   **Primary Modules / Screens (All in English)**:
        *   [...]
        *   **Subscription & Billing Management (Global)**:
            *   View all client `organization_subscriptions` and `usage_metrics` for US clients.
            *   **Billing Model**: Subscription plans link to defined billing models (e.g., per-session based, tiered quotas). The specific billing model linked to a chosen subscription plan is applied consistently to all organizations on that plan.
            *   Change `subscription_plan` for any US client (`organization_subscriptions`).
            *   Access historical `invoices` (via RevenueCat integration).
            *   Apply promotions or credit notes.
        *   [...]
        *   **Global Analytics & Reporting**:
            *   Aggregated triage metrics, revenue reports, platform usage trends across all US clients.
            *   Public health insights (e.g., aggregate symptom heatmaps for US regions, based on `triage_sessions.patient_current_location_json`).
        *   [...]
    
    [...]
    
    ---
    
    ### **2. Client Organizations (Your Customers)**
    
    [...]
    
    #### **A. Client Administrator (Admin) (via Administrator-Facing Screens - Netlify Frontend)**
    *   **Purpose**: To manage users and settings specific to their **US-based subscribing hospital/clinic (`organization`)**, ensuring adherence to **HIPAA compliance**.
    *   **Primary Modules / Screens (All in English)**:
        *   [...]
        *   **Patient Queue Management**:
            *   Real-time view of `triage_sessions` pending review or in progress for *their organization* for US patients.
            *   Sort/filter by `urgency_level`, `status`, `assigned_clinician_user_id`.
            *   Ability to manually `assign` `triage_sessions` to specific `clinicians` (system performs 50-mile radius geodesic distance and licensing checks).
        *   **Analytics & Reporting Screen**:
            *   Performance Dashboards showing metrics (`triage_stats`, `doctor_performance`) and trends for *their US-based organization*.
            *   Data export (PDF, CSV) of reports specific to their organization.
            *   Symptom heatmaps and trends for *their organization's US service area* (based on `triage_sessions.patient_current_location_json`).
        *   **System Settings / Integrations Screen**:
            *   Configure `integration_configs` for *their specific US EHR/EMR system* (secured API keys). **EHR integration is optional.** If not configured, features relying on it will show appropriate fallback information.
            *   Set notification preferences for *their organization*.
            *   Manage `custom_branding_json` for *their organization's* patient portal.
        *   [...]
    
    ---
    
    ### **3. End Users**
    
    [...]
    
    #### **A. Clinician / Doctor (via Clinician/Doctor-Facing Screens - Netlify Frontend)**
    *   **Purpose**: To manage and conduct patient consultations based on AI triage outcomes, for patients within their **US licensing jurisdiction and proximity**.
    *   **Primary Modules / Screens (All in English)**:
        *   **Clinician Dashboard**:
            *   Personalized queue of `triage_sessions` for US patients.
            *   **Case Filtering based on Location/Licensing**: The system automatically filters cases to show only patients within a **50-mile radius (geodesic distance)** of the doctor's registered `primary_practice_address_json` and for whom the doctor is licensed in the patient's `patient_current_location_json.state`.
            *   **Claim Case**: `POST /api/cases/{sessionId}/claim`. The system prevents doctors from claiming cases outside their licensed jurisdiction or the 50-mile radius.
            *   **Clinician Availability Management**: Set `online_status`. Manage `clinician_availability` slots.
            *   Receive real-time `notifications` for new high-urgency cases assigned.
        *   **Patient Case Detail View**:
            *   View patient's `full_name`, `date_of_birth`.
            *   Access full `triage_chat_messages` transcript and AI-generated `triage_sessions.ai_recommendation`.
            *   View snapshot of `triage_sessions.patient_current_location_json` (US city/state, lat/long).
            *   **EHR Data Display**: If EHR integration is configured by the organization and patient consent provided, display patient medical history, previous diagnoses, medications, allergies. Otherwise, indicates no EHR data is available.
            *   **Action Buttons**: "Initiate Live Video Call" (Registered Patients Only), "Send Video Message", "Update Urgency Level", "Mark as Resolved" (triggers billing record).
            *   Area for `clinician_notes`.
            *   **Data Input into EHR**: If EHR integrated, doctors can add notes, prescriptions, referrals back to patient's EHR.
        *   **Live Video Consultation Interface (Clinician Side)**:
            *   Conduct real-time video calls with **registered** `patients`.
            *   Video controls, integrated chat, screen sharing.
            *   **Consultation Duration**: Video consultations are limited to 20 minutes.
            *   **Recording**: Consultations are **NOT recorded**.
            *   **Connection Failure**: If video connection fails, restart is manual.
            *   **Multi-Party Calls**: Not supported.
            *   All consultations conducted **in English**.
        *   [...]
    
    #### **B. Patient (via Patient-Facing Screens - Netlify Frontend)**
    *   **Purpose**: To obtain AI-powered medical triage and access subsequent care recommendations **within the USA**. **The Web app is free for patients.**
    *   **Primary Modules / Screens (All in English)**:
        *   **Welcome / Onboarding Screen**:
            *   "Start Triage", "Login", "Sign Up", "Continue as Guest".
            *   **Informed Consent**: Display and log acceptance of `patient_consents`.
        *   **Patient Profile / Basic Info Screen (For Registered Users)**:
            *   Input `first_name`, `last_name`, `date_of_birth`, `home_address_json` (US format - namesake), and `medical_history_json`.
            *   **Optional Fields**: `weight_kg`, `height_cm`, `insurance_info_json` (optional, for profile, potential future use for matching covered doctors), and `preferred_consultation_mode`.
        *   **AI Triage Chat / Voice Interface**:
            *   Core conversational interface for symptom input **in English**.
            *   Voice-to-text (STT) and text-to-speech (TTS) interaction **in English**.
            *   **Location Capture**: `patient_current_location_json` (with lat/long) is captured dynamically every time a triage session starts.
            *   `Resume` a previous `triage_session` (for registered users).
            *   **Guest Mode Capabilities**: Guest users *can* complete the entire triage process and get basic recommendations. A temporary anonymous patient record is created.
        *   **Triage Summary & Recommendation Screen**:
            *   Displays `urgency_level` and `ai_recommendation`.
            *   Location-aware nearest clinic/ER suggestions (using `patient_current_location_json`), with "Route to ER via Google Maps" button.
            *   **Doctor Availability**: If no licensed doctors are available within a 50-mile radius of the patient's `patient_current_location_json`, the system will notify the user.
            *   Download/Share triage report.
            *   **Registration Prompt**: User is prompted to register (or convert from guest by calling `/auth/register` with `sessionId`) after triage results, before doctor consultation, or if AI determines more detailed profile information is needed for a refined diagnosis. If they register, the current session data is saved. Otherwise, temporary guest data is not stored long-term.
            *   Option to initiate `video_consultations` (requires registration).
            *   `Feedback` mechanism for AI improvement.
        *   **Video Consultation Interface (Patient Side) (For Registered Users Only)**:
            *   Participate in live video calls with `clinicians` **in English**.
            *   **Guest User Limitation**: Guest users cannot connect; registration is required.
            *   **Consultation Duration**: 20 minutes max.
            *   **Recording**: Not recorded.
            *   **Connection Failure**: Restart manually.
            *   **Multi-Party Calls**: Not supported.
        *   **Patient Messages / Follow-ups Screen (For Registered Users Only)**:
            *   View asynchronous video messages and other `notifications` from `clinicians`.
        *   **Triage History Screen (For Registered Users Only)**:
            *   View historical `triage_sessions` and outcomes. If a guest user registered immediately after a triage session when prompted, that session will be saved to their history.
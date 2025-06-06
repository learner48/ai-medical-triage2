## AI Medical Triage Assistant: API Definitions (USA-Only Market, English Only)

This document outlines the core APIs for the AI Medical Triage Assistant, tailored for the USA market with English-only support across all interactions. All data exchanged, especially text, is expected to be in English.

---

### **Table of Contents**

1.  [Patient-Facing APIs](#1-patient-facing-apis)
2.  [Clinician-Facing APIs](#2-clinician-facing-apis)
3.  [Client Administrator APIs](#3-client-administrator-apis)
4.  [Super Admin APIs](#4-super-admin-apis)
5.  [Shared & Utility APIs](#5-shared--utility-apis)
6.  [Third-Party Service Integration Points (Conceptual)](#6-third-party-service-integration-points-conceptual)

---

### **1. Patient-Facing APIs**

These APIs are primarily consumed by the patient-facing frontend.

| Method | Endpoint                                | Provider(s)                        | Description                                                  |
| :----- | :-------------------------------------- | :--------------------------------- | :----------------------------------------------------------- |
| `POST` | `/auth/register`                        | Supabase Auth (Backend Wrapper)    | Creates a new patient user account. Collects initial profile data including `first_name`, `last_name`, `date_of_birth`, `email`, `password`. Optional fields like `home_address_json` (US format, namesake), `weight_kg`, `height_cm`, `medical_history_json`, `insurance_info_json` (optional, not for direct patient billing; potential future use for matching covered doctors), `preferred_consultation_mode` can be provided. **Optionally accepts `triage_session_id` in the request body. If provided for an active guest session, the existing anonymous patient record and triage session data will be associated with the newly registered user.** |
| `POST` | `/auth/login`                           | Supabase Auth (Backend Wrapper)    | Logs in an existing user (patient, clinician, admin) with email/password or OTP. |
| `POST` | `/auth/logout`                          | Supabase Auth (Backend Wrapper)    | Logs out the current user.                                   |
| `GET`  | `/patients/me`                          | Backend API                        | Retrieves the profile details of the currently authenticated patient. |
| `PUT`  | `/patients/me`                          | Backend API                        | Updates the profile details of the currently authenticated patient. Allows updating optional fields not provided at registration. |
| `POST` | `/triage/start`                         | Backend API                        | Initiates a new triage session. If the user is a guest, a temporary anonymous `patient` record is created (can be converted to permanent if the user registers when prompted). **`patient_current_location_json` (temporary, for this session, including lat/long) is captured here via browser geolocation or manual input (US city/state/zip).** Response includes `triage_session_id` and first AI question. |
| `POST` | `/triage/sessions/{sessionId}`          | Backend API, OpenAI/GPT            | Submits the patient's response to an AI question for the specified `sessionId`. The AI generates the next question or a summary if the triage is complete. |
| `GET`  | `/triage/sessions/{sessionId}`          | Backend API                        | Fetches the current status and progress of an ongoing triage session, including chat history and current AI-determined urgency. |
| `GET`  | `/triage/sessions/{sessionId}/summary`  | Backend API                        | Retrieves the final summary of a completed triage session, including symptoms, AI-determined `urgency_level`, `ai_recommendation`. If high/critical urgency, suggests nearest ER facilities based on `patient_current_location_json`. |
| `POST` | `/triage/sessions/{sessionId}/complete` | Backend API                        | Marks a triage session as completed by the patient. If the user is a guest, they are prompted to register (e.g., by calling `/auth/register` with the `sessionId`) to save their session data and access further services (like doctor consultation). **If the guest does not register when prompted, their temporary session data is not stored long-term.** |
| `GET`  | `/patients/me/triage/history`           | Backend API                        | Lists all previous triage sessions for the authenticated registered patient. (Includes sessions from guest mode if they registered immediately after). |
| `POST` | `/patients/me/consents`                 | Backend API                        | Logs patient's consent for specific `consent_type` (e.g., 'data_privacy_policy', 'video_recording_permission' - Note: video recording is currently NOT implemented) and `consent_version`. |
| `POST` | `/triage/sessions/{sessionId}/feedback` | Backend API                        | Allows patients to submit feedback (rating, comments) on the AI triage experience. |
| `POST` | `/video/consultations`                  | Backend API, Tavus/Twilio/Daily.co | **For Registered Users Only.** Creates a new live video consultation room after a doctor has claimed the case and licensing/proximity is verified. Duration: **20 mins max. NOT recorded. Only patient and one clinician.** If connection fails, restart is manual. Returns connection details. |
| `GET`  | `/video/consultations/messages`         | Backend API, Tavus                 | **For Registered Users Only.** Retrieves asynchronous video messages sent by doctors to the patient. |

---

## 🧠 2. **AI & NLP APIs (Primarily Backend to Third-Party)**

These APIs are typically called by the backend to interact with AI services.

| Method | Endpoint                     | Provider            | Purpose                                                      |
| :----- | :--------------------------- | :------------------ | :----------------------------------------------------------- |
| `POST` | `/ai/process-symptoms`       | OpenAI / GPT-4      | Backend sends symptom data (English) to get diagnostic insights, potential follow-up questions, and urgency assessment input. |
| `POST` | `/ai/generate-video-summary` | Tavus               | Backend sends consultation transcript/details (English) to generate an asynchronous video summary. |
| `POST` | `/ai/analyze-sentiment`      | ElevenLabs / OpenAI | Backend sends text (from STT) or direct text to analyze sentiment (English). |
| `POST` | `/voice/to-text`             | ElevenLabs          | Backend sends audio stream/file to convert speech (English) to text. |
| `POST` | `/voice/text-to-speech`      | ElevenLabs          | Backend sends text (English) to generate synthesized speech. |

---

## 👨‍⚕️ 3. **Clinician APIs**

APIs for clinicians to manage cases and interact with patients.

| Method | Endpoint                                  | Provider(s)                  | Description                                                  |
| :----- | :---------------------------------------- | :--------------------------- | :----------------------------------------------------------- |
| `GET`  | `/clinicians/me/dashboard`                | Backend API                  | Retrieves the clinician's dashboard, including a queue of `triage_sessions` from their organization. Cases are filtered to show only those from patients within a **50-mile radius** (geodesic distance) of the clinician's `primary_practice_address_json` and for whom the clinician is licensed (based on `licensing_jurisdictions` and `patient_current_location_json.state`). |
| `POST` | `/clinicians/me/status`                   | Backend API                  | Updates the clinician's `online_status` ('online', 'offline', 'away'). |
| `GET`  | `/triage/sessions/{sessionId}/details`    | Backend API                  | Retrieves full details for a specific triage session, including patient profile (with optional fields like weight, height, medical history), chat transcript, and AI summary. If EHR is integrated (optional per org) and consented, displays relevant EHR data (ALL: medical history, previous diagnoses, medications, allergies). |
| `POST` | `/triage/sessions/{sessionId}/claim`      | Backend API                  | Clinician claims a triage case. **System verifies clinician's license for the patient's state and proximity (within 50-mile radius of `patient_current_location_json` using geodesic distance) before allowing the claim.** |
| `PUT`  | `/triage/sessions/{sessionId}/urgency`    | Backend API                  | Allows clinician to manually override the AI-determined `urgency_level`. |
| `POST` | `/triage/sessions/{sessionId}/resolve`    | Backend API                  | Clinician marks a case as resolved. This action triggers: 1. Update to `triage_session.status`. 2. Creation of a `triage_billing_record` for the organization. 3. Potential update to patient's EHR (if integrated). |
| `POST` | `/video/messages`                         | Backend API, Tavus           | Clinician sends an asynchronous video message (using Tavus) to a patient. |
| `POST` | `/ehr/patients/{patientId}/notes`         | Backend API, EHR Integration | (If EHR integrated & consented) Clinician adds notes to the patient's EHR. Request includes `triage_session_id` for context. |
| `POST` | `/ehr/patients/{patientId}/prescriptions` | Backend API, EHR Integration | (If EHR integrated & consented) Clinician adds prescription information to the patient's EHR. |
| `POST` | `/ehr/patients/{patientId}/referrals`     | Backend API, EHR Integration | (If EHR integrated & consented) Clinician adds referral information to the patient's EHR. |

---

## 🏢 4. **Client Administrator APIs**

APIs for Client Administrators to manage their organization, users, and settings.

| Method | Endpoint                                                    | Purpose                                                      |
| :----- | :---------------------------------------------------------- | :----------------------------------------------------------- |
| `GET`  | `/organizations/{orgId}/dashboard`                          | Retrieves dashboard data for the client admin's organization: key metrics (total triages, active users, high-urgency cases), summary of `triage_session` queue. |
| `GET`  | `/organizations/{orgId}/users`                              | Lists all users (clinicians, other admins, registered patients) within their organization. |
| `POST` | `/organizations/{orgId}/users`                              | Adds a new user (clinician or admin) to their organization. For clinicians, includes `primary_practice_address_json` (with lat/long for geodesic distance calc) and `licensing_jurisdictions`. **Doctors must be employed by the organization.** |
| `PUT`  | `/organizations/{orgId}/users/{userId}`                     | Updates a user's details within their organization (e.g., role, active status). |
| `GET`  | `/organizations/{orgId}/triage-queue`                       | Retrieves the list of triage sessions for their organization, with filters for urgency, status, assigned clinician. |
| `POST` | `/organizations/{orgId}/triage-sessions/{sessionId}/assign` | Manually assigns a `triage_session` to a specific clinician within their organization. **System performs licensing and proximity checks (50-mile radius, geodesic distance).** |
| `GET`  | `/organizations/{orgId}/settings`                           | Retrieves current settings for their organization (EHR integration config, notification preferences, custom branding). |
| `PUT`  | `/organizations/{orgId}/settings`                           | Updates settings for their organization. Includes `integration_configs` for their specific US EHR system (optional). |
| `GET`  | `/organizations/{orgId}/billing/subscription`               | Retrieves current subscription plan details and `usage_metrics` for their organization. |
| `GET`  | `/organizations/{orgId}/billing/history`                    | Retrieves the invoice history for their organization.        |
| `GET`  | `/organizations/{orgId}/audit-logs`                         | Retrieves audit logs specific to their organization's users and activities. |
| `GET`  | `/organizations/{orgId}/analytics/triage-stats`             | Retrieves triage statistics specific to their organization.  |
| `GET`  | `/organizations/{orgId}/analytics/heatmap`                  | Retrieves symptom heatmap data for their organization's service area (based on `triage_sessions.patient_current_location_json`). |
| `GET`  | `/organizations/{orgId}/analytics/doctor-performance`       | Retrieves performance metrics for clinicians within their organization. |

---

## ⚙️ 5. **Super Admin APIs**

APIs for platform-wide management by Super Administrators.

| Method | Endpoint                                      | Purpose                                                      |
| :----- | :-------------------------------------------- | :----------------------------------------------------------- |
| `GET`  | `/superadmin/dashboard`                       | Retrieves global platform metrics (total organizations, users, revenue, high-level usage). |
| `GET`  | `/superadmin/organizations`                   | Lists all client organizations.                              |
| `POST` | `/superadmin/organizations`                   | **Manually adds a new US-based hospital/clinic.** Request body includes all details from Clarification #8 (name, type, address, admin details, plan, config, legal docs). Organization is active immediately upon creation. |
| `GET`  | `/superadmin/organizations/{orgId}`           | Retrieves details for a specific organization.               |
| `PUT`  | `/superadmin/organizations/{orgId}`           | Updates an organization's details (e.g., activate/deactivate, subscription plan, `service_area_json`). |
| `GET`  | `/superadmin/users`                           | Lists all users across the platform.                         |
| `POST` | `/superadmin/users`                           | Creates new users (e.g., other Super Admins, Developers).    |
| `PUT`  | `/superadmin/users/{userId}`                  | Manages any user account (e.g., change role, activate/deactivate). |
| `GET`  | `/superadmin/settings`                        | Retrieves global system settings and feature flags.          |
| `PUT`  | `/superadmin/settings`                        | Updates global system settings and feature flags.            |
| `GET`  | `/superadmin/integration-configs`             | Manages global integration configurations (e.g., shared API keys for Twilio, SendGrid). |
| `PUT`  | `/superadmin/integration-configs/{configKey}` | Updates a specific global integration configuration.         |
| `GET`  | `/superadmin/audit-logs`                      | Accesses all audit logs across the entire platform.          |
| `GET`  | `/superadmin/billing/models`                  | Lists all defined `billing_models`.                          |
| `POST` | `/superadmin/billing/models`                  | Creates a new `billing_model` (e.g., defining per-session rates, quotas for pricing tiers). |
| `PUT`  | `/superadmin/billing/models/{modelId}`        | Updates an existing `billing_model`.                         |
| `GET`  | `/superadmin/subscription-plans`              | Lists all `subscription_plans`.                              |
| `POST` | `/superadmin/subscription-plans`              | Creates a new `subscription_plan`, linking to a `billing_model_id`. |
| `PUT`  | `/superadmin/subscription-plans/{planId}`     | Updates an existing `subscription_plan`.                     |
| `GET`  | `/superadmin/analytics/global-heatmap`        | Retrieves platform-wide symptom heatmap data for public health insights (based on `triage_sessions.patient_current_location_json`). |

---

## 🌐 6. **Shared & Utility APIs**

| Method | Endpoint                         | Provider                  | Purpose                                                      |
| :----- | :------------------------------- | :------------------------ | :----------------------------------------------------------- |
| `GET`  | `/location/current`              | Browser Geolocation API   | Frontend uses this to get patient's current coordinates (lat/long); backend might use GeoIP for approximation if browser access denied. Used for `patient_current_location_json`. |
| `GET`  | `/location/clinics-nearby`       | Google Maps API           | Finds clinics in the USA near the patient based on `patient_current_location_json`. |
| `GET`  | `/location/route-to-er`          | Google Maps API           | Gets directions to the nearest ER in the USA, using `patient_current_location_json`. |
| `GET`  | `/timezone`                      | Google Time Zone API      | Get timezone for scheduling, using `latitude` and `longitude` from `patient_current_location_json` or `users.primary_practice_address_json`. |
| `POST` | `/notifications/sms`             | Twilio                    | Sends SMS (English, to US phone numbers) for critical alerts to clinicians or patients. |
| `POST` | `/notifications/email`           | SendGrid/Brevo            | Sends emails (English) for summaries, follow-ups, notifications. |
| `POST` | `/notifications/in-app`          | Custom (e.g., WebSockets) | Sends real-time in-app notifications to clinicians or admins. |
| `GET`  | `/compliance/policy/:policyType` | Backend API               | Returns the text of a specific compliance policy (e.g., HIPAA notice, Terms of Service). |

---

## 🏥 7. **Third-Party Service Integration Points (Conceptual)**

These represent interactions with external services, often managed by backend logic rather than direct client-side API calls.

*   **EHR/EMR Systems (e.g., Epic, Cerner, Allscripts via FHIR R4)** (Optional per Organization)
    *   **Read Patient Data**: Fetch patient demographics, allergies, medications, vitals from the organization's EHR based on `patient_ehr_data.ehr_patient_id` and `ehr_integrations` config.
    *   **Write Clinical Data**: Push clinician notes, triage summaries, prescriptions, referrals back to the patient's EHR.
*   **RevenueCat**
    *   Manage organization subscriptions, process payments, handle trial periods.
*   **Tavus**
    *   Process video content for asynchronous messages.
    *   Generate AI summaries of video messages.
*   **ElevenLabs**
    *   Process audio for STT.
    *   Generate TTS audio from text.
    *   Perform sentiment analysis on voice data.
*   **OpenAI/GPT**
    *   Process symptom descriptions for diagnosis/urgency.
    *   Generate follow-up questions.
    *   Potentially assist with sentiment analysis or text summarization.
*   **Google Maps/Time Zone APIs**
    *   Provide geocoding, reverse geocoding, directions, and timezone information for US locations. Geodesic distance calculations may use local math functions with lat/long data.

---

**General API Principles:**

*   **Authentication**: All sensitive endpoints are protected and require Bearer token authentication (JWTs provided by Supabase Auth).
*   **Authorization**: Role-Based Access Control (RBAC) is enforced. For example, only a `Super Admin` can access `/superadmin/*` endpoints. Client Admins are scoped to their `organization_id`.
*   **Error Handling**: Standard HTTP status codes (400, 401, 403, 404, 500) with clear error messages in JSON format.
*   **Data Format**: JSON for request and response bodies.
*   **Versioning**: (Future consideration) API versioning (e.g., `/api/v1/...`).
*   **Rate Limiting**: Implemented to prevent abuse.
*   **HIPAA Compliance**: All APIs handling PHI are designed with HIPAA security and privacy rules in mind. Audit logs track access and modifications.
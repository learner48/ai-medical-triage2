---

## 🚀 AI Medical Triage Assistant: Implementation Plan (USA-Only Market, English Only)

**Document ID**: IMPL-PLAN-V2.1
**Prepared For**: Development Team
**Prepared By**: [Your Team Name]
**Date**: [Insert Current Date]

---

### **1. Executive Summary**

This document outlines a task-based implementation plan for the AI Medical Triage Assistant. It breaks down the development into manageable tasks, grouped by core functionalities, to deliver a robust, **HIPAA-compliant** medical triage platform for the **USA market**, operating exclusively in **English**. The plan prioritizes an MVP for initial demonstration, followed by iterative enhancements for a full-fledged B2B SaaS product.

---

### **2. Core Principles**

*   **Iterative Development**: Build and release features in manageable chunks.
*   **USA-Only Focus**: All features, compliance, and integrations are tailored for the US healthcare system.
*   **English-Only Interface**: All UI/UX and AI interactions will be in English.
*   **HIPAA Compliance**: Security and privacy are paramount throughout the development lifecycle.
*   **API-Driven**: Backend services will expose well-defined APIs for frontend consumption and potential future integrations.

---

### **3. Task Breakdown by Epic/Module**

#### **Epic 1: Core Infrastructure & Setup (DevOps/Backend)**

*   **Task 1.1**: Set up Git repository (e.g., GitHub) with a clear branching strategy (main, develop, feature branches).
*   **Task 1.2**: Provision Supabase project: PostgreSQL database, Auth, Storage.
*   **Task 1.3**: Configure Netlify project for frontend CI/CD from the repository.
*   **Task 1.4**: Configure Vercel project for backend serverless functions CI/CD from the repository.
*   **Task 1.5**: Establish secure environment variable management for API keys (Supabase, OpenAI, ElevenLabs, Twilio, SendGrid/Brevo, Tavus, RevenueCat, Google Maps) in Vercel and Netlify.
*   **Task 1.6**: Define initial database schema in Supabase (as per `Database Structure.md` - reflecting nullable fields for guests, EHR optionality, etc.):
    *   `users` table with roles (`patient`, `clinician`, `admin`, `developer`, `super_admin`), `primary_practice_address_json` (with lat/long).
    *   `organizations` table.
    *   `patients` table (`user_id`, `first_name`, `last_name`, `date_of_birth` nullable for guest records; optional fields nullable).
    *   `triage_sessions` table, including `patient_current_location_json` (with lat/long).
    *   `triage_chat_messages` table.
    *   `patient_consents` table.
    *   `audit_logs` table.
    *   `integration_configs` table.
    *   `system_settings` table.
    *   `billing_models` table.
    *   `triage_billing_records` table (creation triggered on case resolution).
    *   `subscription_plans` table.
    *   `organization_subscriptions` table.
    *   `usage_metrics` table.
    *   `ai_feedback` table.
    *   `video_consultations` table (for registered users only).
    *   `clinician_availability` table.
    *   `ehr_integrations` table (supports optional EHR).
    *   `patient_ehr_data` table (supports optional EHR).
*   **Task 1.7**: Implement basic Row-Level Security (RLS) policies in Supabase for core tables.
*   **Task 1.8**: Set up initial logging and monitoring stubs (e.g., Sentry, Logtail).

#### **Epic 2: User Authentication & Profile Management (Backend & Frontend)**

*   **Task 2.1 (Backend)**: Implement `/auth/register` API endpoint.
    *   Handles creation of `users` and `patients` records.
    *   Collects `first_name`, `last_name`, `date_of_birth`, `email`, `password`.
    *   Allows optional submission of `home_address_json`, `weight_kg`, `height_cm`, `medical_history_json`, `insurance_info_json`, `preferred_consultation_mode`.
    *   **Crucially, handles optional `triage_session_id` to convert active guest session data (temporary anonymous `patients` record and `triage_sessions` record) to the new registered user.**
*   **Task 2.2 (Backend)**: Implement `/auth/login` API endpoint using Supabase Auth.
*   **Task 2.3 (Backend)**: Implement `/auth/logout` API endpoint.
*   **Task 2.4 (Backend)**: Implement `/patients/me` (GET) to retrieve authenticated patient's profile.
*   **Task 2.5 (Backend)**: Implement `/patients/me` (PUT) to update authenticated patient's profile.
*   **Task 2.6 (Frontend)**: Develop "Sign Up" screen with form fields.
*   **Task 2.7 (Frontend)**: Develop "Login" screen.
*   **Task 2.8 (Frontend)**: Develop "Patient Profile" screen for viewing and editing profile information.
*   **Task 2.9 (Backend - REVISED)**: Enhance `/auth/register` API (as per Task 2.1) to handle optional `triage_session_id` for converting guest session data to a registered user when prompted post-triage. (No separate `/patient/profile/register` endpoint needed).

#### **Epic 3: Patient Triage Core (Backend & Frontend)**

*   **Task 3.1 (Backend)**: Implement `/triage/start` API endpoint.
    *   Captures `patient_current_location_json` (temporary for session, includes lat/long).
    *   Creates `triage_sessions` record.
    *   For guest users, creates a temporary anonymous `patients` record (can be converted to permanent via `/auth/register` if the user registers when prompted).
    *   Initiates conversation with the first AI question.
*   **Task 3.2 (Backend)**: Implement `/triage/sessions/{sessionId}` (POST) API endpoint.
    *   Receives patient's text or transcribed voice response.
    *   Integrates with OpenAI/GPT for dynamic questioning and urgency assessment.
    *   Integrates with ElevenLabs if voice interaction is used.
    *   Logs conversation in `triage_chat_messages`.
    *   Updates `triage_sessions` with evolving data.
*   **Task 3.3 (Backend)**: Implement `/triage/sessions/{sessionId}` (GET) API endpoint for status.
*   **Task 3.4 (Backend)**: Implement `/triage/sessions/{sessionId}/summary` (GET) API endpoint.
    *   Includes logic for ER recommendation and Google Maps routing if urgency is high/critical (using `patient_current_location_json`).
*   **Task 3.5 (Backend)**: Implement `/triage/sessions/{sessionId}/complete` API endpoint.
    *   Handles prompting guest-to-registered user conversion (frontend calls `/auth/register` with `sessionId`). If guest doesn't register, temporary data is not stored long-term.
*   **Task 3.6 (Frontend)**: Develop "Welcome/Onboarding Screen" with "Start Triage" & "Continue as Guest" options, and consent management.
*   **Task 3.7 (Frontend)**: Develop "AI Triage Chat/Voice Interface" for text and voice input/output. Implement dynamic capture of `patient_current_location_json`.
*   **Task 3.8 (Frontend)**: Develop "Triage Summary & Recommendation Screen".
    *   Display urgency, recommendation, and "Route to ER" button (using `patient_current_location_json`).
    *   Implement registration prompts for guests to save session or access doctor connect.
    *   Handle "no doctor available" scenario based on `patient_current_location_json` and 50-mile radius check.
*   **Task 3.9 (Backend)**: Implement `/patients/me/triage/history` (GET) for registered users (includes converted guest sessions).
*   **Task 3.10 (Frontend)**: Develop "Triage History Screen" for registered users.
*   **Task 3.11 (Backend)**: Implement `/triage/sessions/{sessionId}/feedback` (POST) for AI feedback.
*   **Task 3.12 (Frontend)**: Implement feedback mechanism on Triage Summary screen.

#### **Epic 4: Clinician Workflow & Case Management (Backend & Frontend)**

*   **Task 4.1 (Backend)**: Implement `/clinicians/me/dashboard` (GET) API.
    *   Filter cases based on `organization_id`, `patient_current_location_json` (within 50-mile radius, geodesic distance), and `licensing_jurisdictions`.
*   **Task 4.2 (Backend)**: Implement `/clinicians/me/status` (POST) API for availability.
*   **Task 4.3 (Backend)**: Implement `/triage/sessions/{sessionId}/details` (GET) API for clinicians.
    *   Include logic to fetch and display EHR data if `ehr_integrations` is configured (optional per org) and consent given. Display fallback if not available.
*   **Task 4.4 (Backend)**: Implement `/triage/sessions/{sessionId}/claim` (POST) API.
    *   Include strict licensing and 50-mile radius (geodesic distance) proximity checks.
*   **Task 4.5 (Backend)**: Implement `/triage/sessions/{sessionId}/urgency` (PUT) API for manual override.
*   **Task 4.6 (Backend)**: Implement `/triage/sessions/{sessionId}/resolve` (POST) API.
    *   Triggers creation of `triage_billing_records` (case resolved by clinician).
    *   Triggers EHR update if applicable.
*   **Task 4.7 (Backend)**: Implement API endpoints for EHR data input by clinicians (e.g., `/ehr/patients/{patientId}/notes`, `/ehr/patients/{patientId}/prescriptions`, `/ehr/patients/{patientId}/referrals`) for optional EHR integration.
*   **Task 4.8 (Frontend)**: Develop Clinician Dashboard screen.
    *   Display patient queue with filtering (reflecting 50-mile radius) and sorting.
    *   Allow claiming cases.
    *   Manage online status.
*   **Task 4.9 (Frontend)**: Develop Patient Case Detail View screen for clinicians.
    *   Display patient info, triage transcript, AI recommendation, EHR data (with fallback).
    *   Buttons for actions: Initiate Call, Send Message, Update Urgency, Mark Resolved, Add Notes.

#### **Epic 5: Video Consultations (Backend & Frontend)**

*   **Task 5.1 (Backend)**: Implement `/video/consultations` (POST) API using Tavus/Twilio/Daily.co.
    *   **For registered users only.**
    *   Create video room, generate tokens.
    *   Ensure only patient and one clinician can join.
    *   **No recording.**
    *   Enforce 20-minute time limit.
*   **Task 5.2 (Backend)**: Implement `/video/messages` (POST) API using Tavus for asynchronous video messages from doctors.
*   **Task 5.3 (Backend)**: Implement `/video/consultations/messages` (GET) for patients to retrieve asynchronous messages.
*   **Task 5.4 (Frontend)**: Develop Live Video Consultation Interface (Patient Side) - **For registered users only.**
*   **Task 5.5 (Frontend)**: Develop Live Video Consultation Interface (Clinician Side).
*   **Task 5.6 (Frontend)**: Develop Video Messaging Composer (Clinician Side).
*   **Task 5.7 (Frontend)**: Develop Patient Messages / Follow-ups Screen to view video messages - **For registered users only.**
*   **Task 5.8 (Backend)**: Implement `/ai/generate-video-summary` (Tavus) for asynchronous video messages.

#### **Epic 6: Client Administrator Workflow (Backend & Frontend)**

*   **Task 6.1 (Backend)**: Implement `/organizations/{orgId}/dashboard` (GET) API.
*   **Task 6.2 (Backend)**: Implement `/organizations/{orgId}/users` (GET & POST) APIs for user management.
    *   POST includes `primary_practice_address_json` (with lat/long for geodesic distance calc) and `licensing_jurisdictions` for clinicians.
*   **Task 6.3 (Backend)**: Implement `/organizations/{orgId}/users/{userId}` (PUT) API.
*   **Task 6.4 (Backend)**: Implement `/organizations/{orgId}/triage-queue` (GET) API.
*   **Task 6.5 (Backend)**: Implement `/organizations/{orgId}/triage-sessions/{sessionId}/assign` (POST) API with compliance checks (licensing and 50-mile geodesic radius).
*   **Task 6.6 (Backend)**: Implement `/organizations/{orgId}/settings` (GET & PUT) APIs for organization settings, including optional EHR configuration (`ehr_integrations` table).
*   **Task 6.7 (Backend)**: Implement `/organizations/{orgId}/billing/subscription` (GET) and `/organizations/{orgId}/billing/history` (GET) APIs.
*   **Task 6.8 (Backend)**: Implement `/organizations/{orgId}/audit-logs` (GET) API.
*   **Task 6.9 (Backend)**: Implement analytics APIs for admins: `/organizations/{orgId}/analytics/triage-stats`, `/organizations/{orgId}/analytics/heatmap` (using `patient_current_location_json`), `/organizations/{orgId}/analytics/doctor-performance`.
*   **Task 6.10 (Frontend)**: Develop Admin Dashboard screen.
*   **Task 6.11 (Frontend)**: Develop User Management screen for Client Admins.
*   **Task 6.12 (Frontend)**: Develop Patient Queue Management screen for Client Admins.
*   **Task 6.13 (Frontend)**: Develop Analytics & Reporting screen for Client Admins.
*   **Task 6.14 (Frontend)**: Develop System Settings / Integrations screen for Client Admins (including optional EHR config).
*   **Task 6.15 (Frontend)**: Develop Subscription & Billing Management screen for Client Admins (reflecting clarified billing model linkage).
*   **Task 6.16 (Frontend)**: Develop Audit Logs screen for Client Admins.

#### **Epic 7: Super Admin Portal (Backend & Frontend)**

*   **Task 7.1 (Backend)**: Implement all `/superadmin/*` API endpoints as defined in `API-Updated.md`.
    *   This includes organization onboarding (manual creation with all specified fields).
    *   User management (all users).
    *   Global settings and feature flags.
    *   Billing models and subscription plan management.
    *   Global analytics (using `patient_current_location_json` for heatmaps) and audit logs.
*   **Task 7.2 (Frontend)**: Develop Super Admin Portal UI (reflecting clarified billing model linkage).

#### **Epic 8: Notifications (Backend)**

*   **Task 8.1 (Backend)**: Implement `/notifications/sms` API using Twilio for critical alerts (US numbers).
*   **Task 8.2 (Backend)**: Implement `/notifications/email` API using SendGrid/Brevo.
*   **Task 8.3 (Backend)**: Implement `/notifications/in-app` API (e.g., using Supabase Realtime or WebSockets).
*   **Task 8.4 (Backend)**: Integrate notification triggers into relevant workflows.

#### **Epic 9: Location Services (Backend & Frontend)**

*   **Task 9.1 (Frontend)**: Implement browser geolocation prompt (for lat/long) and manual US address input for `patient_current_location_json`.
*   **Task 9.2 (Backend)**: Implement `/location/current` (if backend fallback for GeoIP is needed).
*   **Task 9.3 (Backend)**: Implement `/location/clinics-nearby` using Google Maps API (based on `patient_current_location_json`).
*   **Task 9.4 (Backend)**: Implement `/location/route-to-er` using Google Maps API (based on `patient_current_location_json`).
*   **Task 9.5 (Backend)**: Implement `/timezone` using Google Time Zone API (based on `patient_current_location_json` or `users.primary_practice_address_json`).

#### **Epic 10: Billing & Monetization (Backend & Frontend)**

*   **Task 10.1 (Backend)**: Implement `billing_models` and `triage_billing_records` table logic.
    *   Billing records creation triggered by `POST /triage/sessions/{sessionId}/resolve` (case resolved by clinician).
*   **Task 10.2 (Backend)**: Implement APIs for RevenueCat integration.
*   **Task 10.3 (Frontend)**: Client Admin "Subscription & Billing Management" screen.
*   **Task 10.4 (Frontend)**: Super Admin "Subscription & Billing Management" screen.

#### **Epic 11: EHR Integration (Backend & Frontend - Optional per Organization)**

*   **Task 11.1 (Backend)**: Develop FHIR R4 client capabilities for read/write operations.
*   **Task 11.2 (Backend)**: Implement logic to securely store and manage `ehr_integrations` per organization.
*   **Task 11.3 (Backend)**: Implement logic to populate `patient_ehr_data` from EHR based on consent and configuration.
*   **Task 11.4 (Frontend)**: Display EHR data (or fallback message) in Clinician's "Patient Case Detail View".
*   **Task 11.5 (Backend/Frontend)**: Enable clinicians to input notes, prescriptions, referrals back to EHR via dedicated API calls.
*   **Task 11.6 (Frontend)**: Client Admin UI for configuring EHR integration (optional).

#### **Epic 12: Security, Compliance & Testing**

*   **Task 12.1 (All)**: Implement MFA for all non-patient roles.
*   **Task 12.2 (Backend)**: Implement comprehensive `audit_logs`.
*   **Task 12.3 (Backend)**: Implement `/patients/me/consents` API (renamed from `/consent/save` for consistency).
*   **Task 12.4 (Frontend)**: Ensure consent forms are clear.
*   **Task 12.5 (All)**: Ensure all data in transit is encrypted (HTTPS).
*   **Task 12.6 (Backend/DevOps)**: Ensure data at rest is encrypted.
*   **Task 12.7 (QA)**: Develop and execute test plans.
*   **Task 12.8 (DevOps/Security)**: Conduct security reviews.
*   **Task 12.9 (Legal/Admin)**: Prepare BAAs.
*   **Task 12.10 (All)**: Implement PWA features.
*   **Task 12.11 (Frontend)**: Ensure WCAG 2.1 AA accessibility standards.

---

### **4. Phased Rollout (High-Level)**

*   **MVP (Hackathon Focus):**
    *   Core Infrastructure & Setup (Epic 1)
    *   Basic Patient Authentication & Guest Mode (subset of Epic 2, with temporary guest data handling)
    *   Core Patient Triage Flow (Epic 3, with guest registration prompt and data save on conversion)
    *   Basic Clinician View (read-only case details) (subset of Epic 4)
    *   Critical SMS/Email Alerts (subset of Epic 8)
    *   Basic Location for ER (subset of Epic 9)
    *   Initial Security/Consent (subset of Epic 12)

*   **Phase 2: Clinician & Admin Empowerment:**
    *   Full Clinician Workflow (Epic 4, with 50-mile geodesic checks)
    *   Full Client Administrator Workflow (Epic 6, with optional EHR config)
    *   Enhanced Patient Profiles & History (Epic 2)
    *   Asynchronous Video Messaging (Tavus) (subset of Epic 5, registered users only)

*   **Phase 3: Live Video & Advanced Features:**
    *   Live Video Consultations (Epic 5, registered users only)
    *   Full Super Admin Portal (Epic 7)
    *   Billing & Monetization Integration (Epic 10, with refined trigger)
    *   Comprehensive Analytics & Reporting (Epics 6, 7)
    *   Full EHR Read/Write Capabilities (Epic 11, if opted-in)

*   **Phase 4: Polish, Scale & Compliance Hardening:**
    *   PWA Enhancements (Epic 12)
    *   Advanced Security Audits & Hardening (Epic 12)
    *   Performance Optimization & Scalability Testing (Epic 12)
    *   Comprehensive Documentation & Support Materials.

---

### **5. Key Dependencies & Risks**

*   **Third-Party API Stability & Costs**: Reliance on OpenAI, ElevenLabs, Tavus, Twilio, etc.
*   **HIPAA Compliance**: Continuous effort and strict adherence required. BAAs are critical.
*   **EHR Integration Complexity**: Each EHR system (Epic, Cerner) has unique integration challenges for optional feature.
*   **AI Accuracy & Safety**: Ongoing model refinement and validation are necessary.
*   **User Adoption**: Both patient and clinician uptake will be key to success.
*   **Data Migration (if opted by clients)**: Potential complexities if clients request data import.
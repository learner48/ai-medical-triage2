---

## 📄 Project Requirements Document (PRD): AI Medical Triage Assistant

**Prepared For**: Hackathon Submission & Future Development
**Prepared By**: [Your Team Name]
**Date**: [Insert Current Date]

---

### 🧭 1. Project Overview

The AI Medical Triage Assistant is a cutting-edge, conversational AI platform designed to revolutionize patient pre-screening, symptom diagnostics, and urgent case prioritization **within the USA**. This web application leverages advanced AI to efficiently interact with patients via voice and text, assess their medical urgency, and guide them to the appropriate level of care. It aims to significantly reduce Emergency Room (ER) congestion and waiting times, streamline clinical workflows, and enhance healthcare accessibility **across the United States**. The platform is built with robust security and **HIPAA compliance** measures, seamlessly integrating into existing clinical ecosystems while supporting real-time clinician dashboards and various consultation modes. All interactions and system content will be **in English only**.

---

### 🎯 2. Goals and Objectives

*   **Provide Fast & Accessible Triage**: Offer rapid, **English-only**, and highly accessible symptom triage using advanced AI, available 24/7 **across the USA**.
*   **Reduce ER Congestion & Waiting Times**: Minimize unnecessary emergency room visits by accurately prioritizing high-risk patients and guiding low-to-moderate urgency cases to alternative care pathways **within the United States healthcare system**.
*   **Streamline Patient Care & Enhance Accessibility**: Improve care delivery efficiency through intuitive voice-first and video-based workflows, reaching patients wherever they are **in the USA**, even in low-connectivity areas via PWA.
*   **Enable Real-time Oversight & Management**: Empower clinics and hospitals **in the USA** to monitor and respond to triage cases in real-time with comprehensive, location-aware dashboards and management tools.
*   **Ensure Security, Compliance, and Scalability**: Deliver a highly scalable, secure, and compliant solution strictly adhering to **US medical data regulations (HIPAA)** and ethical AI principles.

---

### 👥 3. Target Users

*   **Primary Users**: Patients (public-facing individuals seeking initial medical guidance **within the USA**).
*   **Secondary Users**: Clinicians (doctors, nurses, PAs) **licensed to practice in the USA** who manage patient cases and conduct consultations.
*   **Tertiary Users**: Hospital Administrators / Clinic Admins (who can add locations/branches and assign doctors/clinicians to each hospital or branch **in the USA**).
*   And SuperAdmins/Developer/SaaS Owner.

---

### ✅ 4. Functional Requirements & Key Modules

#### 1. Patient Interaction & Onboarding
*   **Voice Interaction**: Full Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities via ElevenLabs, supporting **English-only** communication and sentiment analysis.
*   **Text-based Chat Interface**: Real-time contextual conversations with smart suggestions and intuitive input fields, all **in English**.
*   **Patient Profile Management**: Secure capture of patient data, supporting both registered accounts and anonymous guest modes.
    *   **Patient Access Options**:
        *   **Anonymous/Guest Mode**: Allows quick triage access without requiring upfront registration. Guest users can complete triage and get recommendations. A temporary anonymous patient record is created for the active session.
        *   **Registered Accounts**: Provides full features including historical triage data, saved medical profiles, and direct follow-up capabilities.
        *   **Account Conversion**: Anonymous users are prompted to register (e.g., after receiving triage results, before connecting with a doctor, or if AI determines more detailed profile information is needed for a refined diagnosis). If they choose to register at this point, their active session data (temporarily held) **is saved and associated** with their new permanent account. If they decline or abandon the session, the temporary guest data is not stored long-term.
    *   **Data Captured (all in English, optional where specified)**:
        *   **Basic Demographic Info**: Age (derived from Date of Birth), Gender (optional), Weight (optional), Height (optional). These are populated upon full registration; initially null for guest mode.
        *   **Contact Info**: Phone Number (US format, optional), Email (optional).
        *   **Location**:
            *   `patient_current_location_json`: Current location (City/State/Zip Code, Latitude, Longitude - US format) captured dynamically via browser or manual input **every time a triage session starts**. This is critical for the session (ER routing, clinician matching).
            *   `home_address_json`: Permanent home address (US format, optional, for patient profile record/namesake, not for immediate triage routing).
        *   **Medical & Symptom Information**: Chief Complaint / Symptoms (core input), Symptom Start Date (dynamic Q&A), Ongoing Medical Conditions (optional), Allergies (optional), Medications Being Taken (optional), Surgical History (optional), Vaccination History (optional), Pregnancy Status (for women, dynamically collected if relevant).
        *   **Technology-Related Info**: Preferred Consultation Mode (voice/video/text, optional), Device Used (mobile/desktop, auto-detected), Network Speed Test (optional, for video optimization).
        *   **Optional but Helpful Fields**: Pain Scale (1-10, dynamically collected if relevant), Insurance Provider (`insurance_info_json` - optional, not for direct patient billing, potential future use for matching with covered doctors).
*   **Triage Session Management**: Ability to start a new triage, resume a dropped session (for registered users), and view/download historical triage summaries (for registered users; includes converted guest sessions). **Guest triage data is not stored long-term unless the user registers when prompted during/after the session.**

#### 2. AI-Powered Triage & Diagnostic Engine
*   **Dynamic Symptom Checker**: AI-driven questioning with Natural Language Understanding (NLU) to comprehend **English-language** symptoms and generate context-aware follow-up questions, such as "When did your symptoms start?" or "On a scale of 1 to 10, how would you rate your pain?". This deep data collection guides urgency.
*   **Urgency Assessment**: Risk classification (Low, Moderate, High, Critical) with clear visual indicators for clinicians and actionable recommendations for patients.
*   **Smart Triage Reports**: Instant, downloadable, and shareable patient reports summarizing symptoms and AI-determined urgency, all **in English**.
*   **Decision-Support Dashboard (Clinician-Facing)**: A dedicated view displaying patient status, urgency, AI summaries, and tools for patient management.
*   **Clinical Validation Layer (Hallucination Guardrails)**: Implementation of hardcoded "red flag" symptoms and medical fallback rules to prevent AI hallucinations and ensure safety, combined with disclaimers.
*   **Feedback Loop for AI Improvement**: Mechanisms to collect feedback on AI accuracy post-consultation to refine prompts and models.

#### 3. Video Consultations
*   **Live Video Consultations**: Secure, HIPAA-compliant real-time video calls between patients and clinicians **in English**. **For Registered Users Only.**
    *   **Time Limit**: Consultations are limited to **20 minutes**.
    *   **Recording**: **No recording** of consultations for medical records.
    *   **Participants**: Limited to **patient and one clinician only** (no multiple participants like family members or translators).
    *   **Connection Failure**: If the video connection fails during a consultation, the session can be restarted.
*   **AI-Generated Video Summaries**: Asynchronous video summaries automatically generated by AI (integrating Tavus) for both clinician review and patient personalized recaps.
*   **Video Messaging**: Doctors can send personalized instructional video messages to patients for follow-ups or guidance.

#### 4. Administrative & Hospital Integration
*   **Admin Dashboard**: Comprehensive interface for user management (patients, clinicians, admins), patient queue management, and organizational settings. All content **in English**.
*   **Patient Queue Management**: Real-time sorting and filtering of patients by urgency, time submitted, and assignment status, with notifications for clinicians.
*   **EHR/EMR Integration**: Seamless API integrations with Electronic Health Record (EHR) and Electronic Medical Record (EMR) systems prevalent **in the USA**.
    *   **EHR Integration Specifications**:
        *   **FHIR R4 standard compliance** for interoperability.
        *   Support for **Epic, Cerner, Allscripts** via SMART on FHIR.
        *   **Read-only access** to: Patient demographics, allergies, medications, recent vitals (displayed to doctors).
        *   **Write capabilities**: Clinicians can input new data, including triage notes, recommendations, and referrals back into the patient's EHR after consultations.
        *   **Optional Integration**: EHR integration is **optional** for client organizations. Tables exist in the database to support this, but data is only populated if the feature is enabled and configured.
        *   **Fallback**: Manual data entry when EHR integration is unavailable or not configured by the organization.
        *   **Guest Users**: EHR data is **not tracked or integrated** for guest users.
*   **Multi-Clinic/Branch Support**: Ability to manage multiple **US-based** hospital locations with separate doctor pools and role-based access control per branch.
*   **Audit Trails**: Comprehensive activity tracking and logs for all user and system interactions for regulatory compliance.

[...]

#### 7. Monetization
*   **B2B Focus**: Target hospitals, clinics, and telemedicine platforms **in the USA**. Only **hospitals/clinics (Client Organizations)** are billed; independent doctors are **not supported** (clinicians must be employed by a billing organization).
*   **Hybrid Billing Options**: The platform supports flexible pricing models by allowing `subscription_plans` to link to various pre-defined `billing_models` (e.g., subscription with quotas, pay-per-use, volume discounts).
    1.  **Organization Subscriptions**: Monthly/annual plans with included consultation quotas (defined in linked `billing_model`) and overage billing for usage beyond plan limits.
    2.  **Pay-Per-Use**: Individual consultations billed separately, suitable for smaller practices or occasional use (defined in linked `billing_model`).
    3.  **Volume Discounts**: Tiered pricing based on monthly consultation volume, including enterprise pricing for large health systems (defined in linked `billing_model`).
*   **Promotions and Trials**: Mechanisms for onboarding incentives, free trials, and promotional offers.
*   **Optional Add-ons**: Possibility for features like Tavus license fees, custom branding, or extended API access. All pricing **in USD**.
*   **Pricing Visibility**: Patients do **not** see pricing information; billing is handled directly with organizations. Billing records are generated when a clinician resolves a case.

[...]

#### 8. Database Structure (Supabase PostgreSQL)
*   **`users`**: All system users (patients, clinicians, admins, developers) with roles, MFA status, organization link. Includes clinician practice locations (with lat/long for geodesic distance calculation) and **US state-based licensing jurisdictions**.
*   **`organizations`**: Subscribing hospitals/clinics **in the USA**, their addresses, subscription IDs, and custom branding. Includes `locations_json` for multi-branch support **within the USA**.
*   **`patients`**: Detailed medical profile data for patients (demographics, medical history). `language_preference` field fixed to English. Core fields like `first_name`, `last_name`, `date_of_birth`, `user_id` are nullable to support temporary anonymous guest records, populated upon full registration. `insurance_info_json` is optional.
*   **`triage_sessions`**: Each patient interaction, AI urgency, recommendation, status, assigned/reviewed clinician, and a snapshot of `patient_current_location_json` (US city/state/zip code, lat/long) – critical for session-based routing.
*   **`triage_chat_messages`**: Full conversational transcript of each triage session (patient/AI/clinician messages **in English**, timestamps, sentiment, audio URLs).
*   **`video_consultations`**: Details of live and asynchronous video calls (participants, start/end times, video URLs, AI summaries, clinician notes). **For registered users only.**
*   **`notifications`**: All system-generated notifications (type, recipient, content, status, related entity).
*   **`subscription_plans`**: Defines available tiers, features, and pricing, linking to a `billing_model_id`.
*   **`organization_subscriptions`**: Tracks each organization's active plan, start/end dates, status, and RevenueCat ID.
*   **`usage_metrics`**: Records usage for billing and analytics.
*   **`audit_logs`**: Comprehensive logging of user actions and system events for **HIPAA compliance**.
*   **`integration_configs`**: Stores encrypted API keys and configuration details for all third-party integrations (global or organization-specific), specifically for **US-based services**.
*   **`system_settings`**: Global application-wide settings and feature flags.
*   **`billing_models`**: Defines specific rules for billing (subscription, pay-per-use, etc.) that `subscription_plans` reference.
*   **`triage_billing_records`**: Records billing event for each triage session, created upon case resolution by a clinician.
*   **`ehr_integrations`**: Stores config for optional organization EHR integration.
*   **`patient_ehr_data`**: Caches/links patient data from EHRs if integration is active and consented.

[...]

### 📍 11. Location-Aware Functionality

Location data is vital for routing, compliance, and public health **within the USA**.

*   **Patient Location**:
    *   **`triage_sessions.patient_current_location_json`**: Captured dynamically (user input or browser geolocation including lat/long) for **US locations (city/state/zip code)** at the start of each triage session. This is the **primary location data** used for:
        *   Emergency referrals (nearest ER **in USA**).
        *   Matching with clinicians licensed and practicing **within a 50-mile radius (geodesic distance)** for that specific session.
        *   Time zone awareness **within USA**.
        *   Public health monitoring (symptom heatmaps for **US regions**).
    *   **`patients.home_address_json`**: Patient's registered permanent home address (optional). Used for patient profile record ("namesake") and potentially for non-real-time analytics or broad service area checks. Not primary for immediate triage routing.
*   **Doctor / Clinician Location**: Registered `primary_practice_address_json` (including lat/long) and **US state-based licensing jurisdictions**. Crucial for ensuring clinicians are licensed to practice in the patient's `patient_current_location_json.state` during virtual consultations and for the 50-mile radius check (geodesic distance). Also for time zone alignment.
*   **Hospital / Organization Location**: Registered physical address(es) for primary facilities and multi-branch locations **within the USA**. Defines service areas, informs optional **US EHR/EMR** integration scope, aids resource allocation, and ensures compliance with **US local regulations**.

---

### 👨‍⚕️ 12. Patient-Doctor Matching

The "matching" is driven by **intelligent prioritization, queue management, and clinician assignment/claiming**, rather than direct patient choice, ensuring efficiency and safety **within the US regulatory framework**.

1.  **AI Prioritization**: The AI assigns an `urgency_level` to the triage session.
2.  **Queue Display**: Cases appear on the Clinician Dashboard, sorted by urgency (High first) and time.
3.  **Clinician Availability**: Clinicians can set their online/offline/available status.
4.  **Clinician Claiming**: Most common path: an available clinician reviews the queue and `claims` a case.
    *   **Compliance & Proximity Check**: The system verifies the clinician is licensed in the patient's `patient_current_location_json.state` and the patient is **within a 50-mile radius (geodesic distance)** of the clinician's `primary_practice_address_json` before allowing the claim.
5.  **Admin Assignment**: Administrators can `assign` cases to specific clinicians, subject to the same compliance and proximity checks.
6.  **Future Enhancement**: Patient preference filters (e.g., gender) could guide clinician claiming or admin assignment for non-urgent cases. Language preference is **not applicable** due to English-only support.

[...]
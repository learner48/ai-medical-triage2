--- START OF FILE UserFlow.md ---

## 🚀 User Flow: AI Medical Triage Assistant (USA-Only Focus, English Only)

This document outlines the step-by-step journey of various user roles within the AI Medical Triage Assistant, detailing their interactions with the system and its features, with a specific focus on the integration of location data within the United States market and **exclusive support for the English language**.

---

### **A. Patient Journey (Primary User Flow)**

This is the core flow for individuals seeking medical guidance within the USA. **The Web app is free for patients.**

#### **1. Patient Lands on the Web App & Grants Consent (Netlify Frontend)**
*   The patient accesses the application via a web browser.
*   **UI Screen**: **Welcome / Onboarding Screen**
    *   Displays medical disclaimer.
    *   Offers options: "Start Triage," "Login," "Sign Up," "Continue as Guest."
    *   **Action**: Patient reviews and grants initial consent for data privacy and terms of service (logged in `patient_consents`).
    *   **Action (Crucial Location Point)**: The system prompts the patient for **browser geolocation access** or to **manually input their current US city/state/zip code (and derive lat/long)**. This captures `triage_sessions.patient_current_location_json`. This `current_location` is critical for the session.

#### **2. Patient Chooses Interaction Mode & Begins Triage (Netlify Frontend, Vercel Backend, ElevenLabs)**
*   **Action**: Patient clicks "Start Triage" (or "Continue as Guest").
*   **UI Screen**: **AI Triage Chat / Voice Interface**
    *   **Action**: Patient chooses Voice or Text interaction, describing their **Chief Complaint / Symptoms** in English.
*   **System Action**: The system initiates a new `triage_session`, creating a `patient` record (temporary anonymous record for guest, or linked to `users` for registered).
*   **Database Impact**: `triage_sessions.patient_current_location_json` is populated.

#### **3. AI Conducts Dynamic Symptom Assessment (Netlify Frontend, Vercel Backend, OpenAI/GPT, ElevenLabs)**
*   **UI Screen**: **AI Triage Chat / Voice Interface**
*   **System Action**: AI asks intelligent, context-aware follow-up questions **in English**.
*   **Interaction**: Patient responds via voice or text **in English**. AI responds via text/voice **in English**.
*   **System Action**: AI continuously analyzes input, updates `urgency_level` and `ai_recommendation`.
*   **Database Impact**: `triage_chat_messages` are logged. `triage_session.urgency_level` is refined.

#### **4. Patient Information Collection (Optional during registration/profile update) (Netlify Frontend, Supabase)**
*   **UI Screen**: **Patient Profile / Basic Info Screen** or **Sign Up Screen**
*   **Action**: If registering or updating profile, patient provides structured demographic and medical history details **in English**. Core fields (`first_name`, `last_name`, `date_of_birth`) are expected for full registration. Other fields are optional.
    *   **Location Point**: Patient may enter their **permanent US `patients.home_address_json`** here (optional, for profile/namesake).
*   **Database Impact**: `patients` table is updated/created.

#### **5. AI Finalizes Triage & Presents Result (Netlify Frontend, Supabase, Google Maps)**
*   **System Action**: AI finalizes `triage_session.urgency_level` and `ai_recommendation`.
*   **UI Screen**: **Triage Summary & Recommendation Screen**
    *   Displays `urgency_level` and summary **in English**.
    *   **Guest Mode & Registration Prompt**: Guest users can complete triage and get recommendations. They are then prompted to register to save their session data (which is temporarily held) and access features like doctor consultations or if AI determines more profile data is needed. If they register at this point (calling `/auth/register` with `sessionId`), the session is saved. Otherwise, temporary guest data is not stored long-term.
    *   **Crucial Location Use**:
        *   For High/Critical urgency: Displays "Go to ER immediately." Provides details and a "**Route to ER via Google Maps**" button to the **nearest appropriate US facility** using `triage_sessions.patient_current_location_json`.
        *   For Low/Moderate urgency: Recommends home care, or offers a "Start Video Consultation" button (requires registration).
        *   **Doctor Availability & Compliance**: If no licensed doctors are available within a **50-mile radius (geodesic distance)** of the patient's `triage_sessions.patient_current_location_json`, the system will notify the user.
    *   **Database Impact**: `triage_session.status` is updated.

#### **6. Feedback on AI Accuracy (Netlify Frontend, Supabase)**
*   **UI Screen**: **Triage Summary & Recommendation Screen**
*   **Action**: Patient provides feedback **in English**.
*   **Database Impact**: Populates `ai_feedback` table.

#### **7. Patient Views History / Resumes Session (Netlify Frontend, Supabase)**
*   **UI Screen**: **Triage History Screen (For Registered Users Only)**
*   **Action**: Registered patients view past `triage_sessions` or `resume` interrupted ones. History includes sessions converted from guest mode upon immediate registration.
*   **Guest Data**: Triage data for guest users is **not stored long-term** unless they register when prompted.

---

### **B. Clinician Journey (Secondary User Flow)**

[...]

#### **1. Clinician Logs In & Views Dashboard (Netlify Frontend, Vercel Backend, Supabase)**
*   **Action**: Clinician logs in (with MFA).
*   **UI Screen**: **Clinician Dashboard**
    *   Displays real-time queue of `triage_sessions` for their `organization`.
    *   **Doctor Licensing & Proximity Compliance**: The system filters cases to show only patients located **within a 50-mile radius (geodesic distance)** of their `primary_practice_address_json` and for whom the clinician is licensed in the patient's `triage_sessions.patient_current_location_json.state`.
    *   [...]
*   **Database Impact**: Authenticated `user` (`role='clinician'`).

#### **2. Clinician Reviews and Acts on a Case (Netlify Frontend, Vercel Backend, Supabase, EHR/EMR)**
*   **Action**: Clinician selects a `triage_session` from the queue.
*   **UI Screen**: **Patient Case Detail View**
    *   Displays `patient` profile and `triage_chat_messages` transcript and AI-generated `triage_sessions.ai_recommendation`.
    *   **EHR Data Display**: If EHR integration is configured by the org and consented, relevant EHR data is shown. Otherwise, a fallback message is displayed.
    *   **Crucial Location Use**: Explicitly shows `triage_sessions.patient_current_location_json` (US city/state, lat/long).
    *   **Action**: Clinician can `Claim Case`. The system **enforces the 50-mile radius (geodesic distance) and licensing checks** before allowing the claim.
    *   [...]

#### **3. Clinician Conducts Consultation (Netlify Frontend, Vercel Backend, Video SDK, Tavus)**
*   **Action**: From `Patient Case Detail View`, clinician chooses consultation method:
    *   **Initiate Live Video Call (For Registered Patients Only)**:
        *   **UI Screen**: **Live Video Consultation Interface (Clinician Side)**
        *   **System Action (Doctor Matching/Compliance)**: Backend verifies clinician's license for `patient_current_location_json.state` and 50-mile radius (geodesic distance).
        *   [...]
        *   **Recording**: **NOT recorded**.
        *   **Multi-Party Calls**: Not supported.
    *   [...]

#### **4. Clinician Resolves Case (Netlify Frontend, Vercel Backend, Supabase, EHR/EMR)**
*   **UI Screen**: **Patient Case Detail View**
*   **Action**: Clinician marks case as "Resolved."
*   **System Action**: Updates `triage_session.status`.
*   **EHR Integration**: If configured, doctors can input new data back into EHR.
*   **Billing Trigger**: `triage_billing_records` entry is created.

---

### **C. Client Administrator Journey (Tertiary User Flow)**

[...]

#### **2. Admin Manages Users & Assignments (Netlify Frontend, Vercel Backend, Supabase)**
*   **UI Screen**: **User Management Screen**
    *   **Action (Location Point)**: When adding a new clinician, admin inputs `primary_practice_address_json` (with lat/long) and `licensing_jurisdictions`.
*   **UI Screen**: **Patient Queue Management**
    *   **Action**: Admin can manually `assign` a `triage_session`.
    *   **System Action (Doctor Matching/Compliance during Manual Assignment)**: System guides admin based on 50-mile radius (geodesic distance) and licensing for `patient_current_location_json.state`.

#### **3. Admin Reviews Analytics & Settings (Netlify Frontend, Vercel Backend, Supabase)**
*   **UI Screen**: **Analytics & Reporting Screen**
    *   **Action (Location Point)**: Admin reviews `Symptom Heatmaps` (based on `triage_sessions.patient_current_location_json`).
*   **UI Screen**: **System Settings / Integrations Screen**
    *   **Action**: Admin configures optional `integration_configs` for their US EHR/EMR system.
    *   **Action (Location Point)**: Admin defines `main_address_json` and `locations_json` for US branches.
*   **UI Screen**: **Subscription & Billing Management Screen**
    *   **Action**: Admin reviews subscription plan (linked to a consistent `billing_model`) and usage.

---

### **D. Your Team's Internal User Journeys (Super Admin & Developer)**

[...]

#### **1. Super Admin Journey (Super Admin Portal)**
*   [...]
*   **UI Screen**: **Global Analytics & Reporting**
    *   **Action (Location Point)**: Reviews aggregated `Symptom Heatmaps` (based on `triage_sessions.patient_current_location_json`).

#### **2. Developer Journey (Developer Operations Dashboard)**
*   [...]
*   **UI Screen**: **Integration Health Monitoring**
    *   **Action (Location Point)**: Monitors `Geolocation/Mapping` APIs and `EHR/EMR` APIs (configured for US services).
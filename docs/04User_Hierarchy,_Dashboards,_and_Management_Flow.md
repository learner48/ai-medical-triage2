## User Hierarchy, Dashboards, and Management Flow (USA-Only Market, English Only)

This document clarifies which user roles have access to which dashboards and who is responsible for adding and managing other users or organizational entities within the AI Medical Triage Assistant, **specifically targeting the USA market with English-only support.**

---

### **1. The Top Tier: Your Team (The SaaS Provider)**

[...]

#### **A. Super Admin**

*   **Role**: The highest level of administrative access. Responsible for global platform configuration, managing client organizations *within the USA*, and overseeing all data with strict adherence to **HIPAA compliance**.
*   **Primary Dashboard**: **Super Admin Portal** (Internal, Business-Facing, English Only)
*   **Who Adds Them to the System**: Added directly by the company's founders or core team via secure, internal provisioning processes.
*   **Who/What They Manage**:
    *   [...]
    *   **Revenue Operations**: Oversees subscriptions, usage, and billing across all US clients. **The Web app is free for patients. Only Hospitals and Clinics are billed.** Subscription plans link to defined billing models (e.g., per-session based, tiered quotas); the specific billing model linked to a chosen subscription plan is applied consistently to all organizations on that plan. Billing records (`triage_billing_records`) are created when a triage session is marked as 'resolved' by a clinician.
    *   [...]

[...]

---

### **2. The Middle Tier: Client Organizations (Your Customers)**

[...]

#### **B. Client Administrator (Admin)**

*   **Role**: The designated administrative user(s) *within* a **US-based client organization**. Manages users and settings specific to their hospital/clinic, adhering to **HIPAA compliance**.
*   **Primary Dashboard**: **Administrator-Facing Screens** (e.g., Admin Dashboard, User Management, Analytics & Reporting, System Settings, Subscription & Billing Management). All dashboard content and functionality are **in English**.
*   **Who Adds Them to the System**:
    1.  Often, the **first Client Administrator** for a new US-based organization is created by your team's **Super Admin** during the onboarding process.
    2.  Subsequently, **existing Client Administrators** *within that same US-based organization* can add other Client Administrators or Clinicians.
*   **Who/What They Manage**:
    *   [...]
    *   **Organization-Specific Settings**: Configures `integration_configs` for their **US-based EHR/EMR (optional feature)**. No specific data migration (existing patient records, doctor profiles, historical consultations) is mandated when organizations join; data migration is optional and handled by the Organization/Hospital IT Team.
    *   Set notification preferences, and manage their organization's subscription and usage (`usage_metrics`). Billing records are triggered by clinician case resolution.

---

### **3. The Bottom Tier: End Users (Patients & Clinicians)**

[...]

#### **A. Clinician / Doctor**

*   **Role**: A licensed medical professional practicing **within the USA** who reviews AI triage outcomes, manages patient cases, and conducts video consultations.
*   **Primary Dashboard**: **Clinician / Doctor-Facing Screens** (e.g., Clinician Dashboard, Patient Case Detail View, Live Video Consultation Interface, Video Messaging Composer). All dashboard content and functionality are **in English**.
*   **Who Adds Them to the System**: Added by a **Client Administrator** of their US-based hospital/clinic via the "User Management Screen."
*   **Who/What They Manage**:
    *   **Patient Cases**: Claims or accepts assigned `triage_sessions` for US patients. The system allows doctors to claim cases from patients located **within a 50-mile radius (geodesic distance)** of their practice. The system **prevents doctors from claiming cases outside their licensed jurisdictions** or this 50-mile radius. Doctors can only see cases from patients within this radius; cases from different locations are filtered out automatically. If no licensed doctors are available in the patient's current location, the system notifies the patient.
    *   Reviews patient data and interaction history **in English**.
    *   **Consultations**: Conducts live video calls (registered patients only) and sends asynchronous video messages to US patients **in English**. Live video consultations can last up to **20 minutes**. Consultations are **NOT recorded**. If video connection fails, restart is manual. No multi-party calls.
    *   **EHR Integration**: If EHR is integrated by the org and consented by patient, doctors see relevant EHR data. Doctors can input new data back into the patient's EHR.
    *   **Their Own Availability**: Manages their `online_status` and available consultation slots.

#### **B. Patient**

*   **Role**: The end-user seeking medical guidance from the AI Triage Assistant **within the USA**. The web app is free for patients.
*   **Primary Dashboard**: **Patient-Facing Screens** (e.g., Welcome, AI Triage Chat/Voice Interface, Triage Summary & Recommendation, Video Consultation Interface, Patient Messages, Triage History). All screen content and interaction are **in English**.
*   **Who Adds Them to the System**:
    1.  **Themselves (Self-Registration or Guest Mode)**: Via the public-facing "Welcome / Onboarding Screen."
*   **Who/What They Manage**:
    *   **Their Own Profile**: Can create and update their personal patient profile. Fields like `weight_kg`, `height_cm`, `insurance_info_json` (optional, for profile, potential future matching use), and `preferred_consultation_mode` are **optional**. Core fields like `first_name`, `last_name`, `date_of_birth` are populated during full registration.
    *   **Their Own Triage Sessions**: Initiates and interacts with the AI for their own `triage_sessions` **in English**.
        *   **Location Data**: `triage_sessions.patient_current_location_json` (including lat/long) is captured dynamically every time they start a triage session. This is the primary location for that specific session (ER routing, clinician matching). The patient's `home_address_json` (in `patients` table, optional) is for profile/namesake.
        *   **Guest Mode Flow**: Initial triage can be done in guest mode, creating a temporary anonymous patient record. Guest users **can** complete triage and get recommendations. However, guest users **cannot** connect with doctors for video consultations; registration is required. The user is prompted to register (e.g., after triage results, before doctor consultation, or if AI needs more profile details). If they register **at that point**, their active temporary session data **is saved** to their new account. Otherwise, temporary guest data is not stored long-term.
    *   **Their Own Consents**: Provides and manages their `patient_consents`.
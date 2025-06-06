

---

## AI Medical Triage Web App: Design Guidelines

**Version:** 1.0
**Date:** May 31, 2025
**Project:** AI Medical Triage Web App (USA-Only Market, English Only)

---

### 1. Introduction

This document outlines the design guidelines for the AI Medical Triage Web App. The goal is to create a user experience that is intuitive, reassuring, accessible, and efficient, reflecting the critical nature of medical triage. Consistency in applying these guidelines will ensure a trustworthy and easy-to-navigate interface for users seeking urgent medical advice. All UI text and content are to be in **English**. The design must be **mobile-responsive**, prioritizing a seamless experience on all devices.

---

### 2. Core Design Principles

*   **Clarity & Simplicity:** The interface must be uncluttered and easy to understand, especially for users under stress.
*   **Trust & Professionalism:** Visuals should inspire confidence and convey medical professionalism.
*   **Efficiency:** Users should be able to complete the triage process quickly and with minimal friction.
*   **Accessibility:** Design for a wide range of users, adhering to WCAG 2.1 AA guidelines.
*   **Mobile-First Responsiveness:** Design and develop with mobile users as a primary consideration, ensuring a seamless experience that scales up to desktop.

---

### 3. Brand Identity & Logo (Placeholder)

*   **App Name:** [Your AI Medical Triage App Name]
*   **Logo:** (To be designed) Should be simple, recognizable, and relevant to AI, health, or guidance. Consider incorporating a subtle medical symbol (e.g., a plus, a heartbeat line) with a modern tech feel. It should be distinct from the "MedEase" logo but can share a similar level of professionalism.
*   **Usage:** The logo will be used in the header, loading screens, and any other brand touchpoints. Ensure sufficient clear space.

---

### 4. Color Palette

Inspired by the "MedEase" design, the palette should be clean, with a primary action color and supporting neutrals.

*   **Primary Action Blue:**
    *   **HEX (Approximate, based on MedEase):** `#2979FF` (A vibrant, trustworthy blue)
    *   **Usage:** Main call-to-action buttons (e.g., "Start Triage," "Submit Symptoms"), active states, key highlights, progress indicators, important icons.
*   **Secondary Light Blue:**
    *   **HEX (Approximate, based on MedEase):** `#E3F2FD` or a lighter tint of the Primary Blue.
    *   **Usage:** Backgrounds for information boxes, subtle highlights, selected states in less prominent components, icon backgrounds.
*   **Neutrals:**
    *   **Text - Dark Grey/Black:**
        *   **HEX (Approximate):** `#212121` or `#333333`
        *   **Usage:** Main body text, headings, questions from the AI.
    *   **Text - Medium Grey:**
        *   **HEX (Approximate):** `#757575`
        *   **Usage:** Secondary text, input field labels/placeholders, captions, instructions.
    *   **Text - Light Grey:**
        *   **HEX (Approximate):** `#BDBDBD`
        *   **Usage:** Disabled text, very subtle helper text.
    *   **Background - White:**
        *   **HEX:** `#FFFFFF`
        *   **Usage:** Main content area backgrounds, card backgrounds.
    *   **Background - Off-White/Lightest Grey:**
        *   **HEX (Approximate):** `#F5F7FA` or `#F8F9FA`
        *   **Usage:** Overall app background if not pure white, to provide subtle depth.
    *   **Borders/Dividers:**
        *   **HEX (Approximate):** `#E0E0E0` or `#DEE2E6`
        *   **Usage:** Input field borders, card borders (if any), dividers between sections.
*   **Semantic Colors (Essential for Triage):**
    *   **Urgency - Critical Red:**
        *   **HEX (Approximate):** `#D32F2F` or `#E53E3E`
        *   **Usage:** Critical urgency level indicators, "Go to ER" type advice, error messages.
    *   **Urgency - High Orange/Amber:**
        *   **HEX (Approximate):** `#FFA000` or `#F59E0B`
        *   **Usage:** High urgency level indicators, warnings.
    *   **Urgency - Moderate Yellow:**
        *   **HEX (Approximate):** `#FFC107` or `#FBBF24`
        *   **Usage:** Moderate urgency level indicators.
    *   **Urgency - Low/Information Green:**
        *   **HEX (Approximate):** `#388E3C` or `#4CAF50`
        *   **Usage:** Low urgency level indicators, self-care advice, success messages.

---

### 5. Typography

A clean, highly legible sans-serif font family is critical. (Consider system fonts for performance and native feel, or a web font like Inter, Poppins, or Roboto).

*   **Font Family (Example):** Inter (or similar widely available, clear sans-serif)
*   **Weights:** Regular, Medium, SemiBold, Bold.

*   **Type Scale (Mobile First, adapt for larger screens):**
    *   **H1 / Screen Title (e.g., "AI Symptom Checker," "Triage Summary"):**
        *   Font Size: 22-28px (Mobile: 22px, Desktop: 28px)
        *   Weight: Bold / SemiBold
        *   Color: Text - Dark Grey/Black
    *   **H2 / AI Question or Section Title:**
        *   Font Size: 18-22px (Mobile: 18px, Desktop: 22px)
        *   Weight: SemiBold / Medium
        *   Color: Text - Dark Grey/Black
    *   **Body Text / Descriptions / AI Responses:**
        *   Font Size: 15-17px (Mobile: 15px, Desktop: 16px)
        *   Weight: Regular
        *   Color: Text - Dark Grey/Black
    *   **User Input Text:**
        *   Font Size: 15-17px
        *   Weight: Regular
        *   Color: Text - Dark Grey/Black
    *   **Button Text:**
        *   Font Size: 15-17px (Mobile: 15px, Desktop: 16px)
        *   Weight: Medium / SemiBold
        *   Color: White (`#FFFFFF`) on primary buttons, Primary Action Blue on secondary/text buttons.
    *   **Labels / Captions / Helper Text:**
        *   Font Size: 12-14px
        *   Weight: Regular
        *   Color: Text - Medium Grey
    *   **Urgency Level Text (e.g., "Critical Urgency"):**
        *   Font Size: 16-18px
        *   Weight: Bold / SemiBold
        *   Color: Corresponding Semantic Color (Red, Orange, Yellow, Green).
*   **Line Height:** 1.5x - 1.7x the font size for body text and AI interactions to ensure excellent readability.
*   **Paragraph Spacing:** Use spacing below paragraphs (e.g., 8-16px) rather than indents.

---

* ### 6. Iconography

  Icons must be clear, universally understood, and support the user's journey.

  - 
  - **Style:** Simple, clean line icons with a consistent stroke weight (approx 1.5-2px). Rounded corners/ends for a softer feel. Avoid overly complex or decorative icons.
  - **Color:**
    - 
    - Default: Text - Medium Grey or Primary Action Blue if interactive.
    - Active/Selected: Primary Action Blue.
    - Semantic: May take on semantic colors (e.g., a warning icon in Orange).
  - **Common Icons:** Back arrow, send/submit, microphone (for voice input), info, close, menu (for mobile nav if needed), progress indicators (e.g., checkmarks for completed steps).
  - **Size:** Consistent sizing (e.g., 20x20px or 24x24px). Ensure adequate touch targets for mobile.
  - **Sourcing & Recommendation:**
    - 
    - Utilize a high-quality, consistent icon library.
    - **Consider using icons from reputable free sources like Material Symbols (Google Fonts), Phosphor Icons, Feather Icons, Tabler Icons, or similar sites offering SVG or web font icons under permissive licenses.** This ensures consistency and scalability, especially during initial development phases or when custom icons are not yet commissioned. Always check the licensing terms for any icons used.

  ------

  

  ### 7. Imagery & Illustrations

  - 
  - **Usage:** Keep imagery to a minimum to maintain focus on the triage process. When used, images and illustrations should be reassuring and purposeful.
  - **Illustrations (If used, e.g., for onboarding, success screens, or to visually break up long text sections):**
    - 
    - Style: Simple, friendly, and reassuring. Can be abstract or character-based.
    - Color: Align with the brand's color palette.
    - Purpose: To guide the user, reduce anxiety, or confirm completion.
  - **Photographs (If used, e.g., for background textures or very subtle contextual visuals):**
    - 
    - Style: High quality, professional, and relevant to a calm, modern healthcare feel.
    - Content: Avoid clinical or distressing medical imagery. Focus on neutral, supportive, or abstract visuals if photographs are deemed necessary.
  - **Sourcing & Recommendation:**
    - 
    - **For placeholder or initial imagery, consider using high-quality, royalty-free stock photos from sites like Unsplash, Pexels, or Pixabay.** Ensure the chosen images align with the brand's tone and aesthetic (clean, professional, reassuring).
    - **For illustrations, free vector art sites (e.g., unDraw, Humaaans, Open Doodles – checking licenses) can be a good starting point if custom illustrations are not immediately available.**
    - Always ensure that licenses for any sourced images or illustrations permit usage for your application type and that appropriate attribution is given if required. Prioritize custom assets for a unique brand identity in the long term.

---

### 8. Layout & Spacing

A clear, consistent layout is paramount for a stress-free experience. Employ a mobile-first grid system.

*   **Grid System (Recommended):** 8px grid system (spacing/sizing in multiples of 4px or 8px).
*   **Mobile Layout:**
    *   Primarily single-column for content flow.
    *   Header: App name/logo, potentially a menu or help icon.
    *   Content Area: For AI questions, user input, and triage information.
    *   Footer/Action Bar: Primary action buttons (e.g., "Next," "Submit").
*   **Desktop Layout:**
    *   Content can expand to a wider single column or a two-column layout if necessary (e.g., chat on one side, summary/info on the other), but simplicity should be maintained.
*   **Padding & Margins:**
    *   Screen Padding: 16px to 24px on all sides (mobile).
    *   Section Spacing: Consistent vertical spacing between elements (e.g., 16px, 24px, 32px).
*   **White Space:** Generous use of white space to reduce cognitive load and improve focus on the current task.
*   **Alignment:** Left-align text for readability. Center-align headings or short standalone text if it enhances clarity.

---

### 9. UI Components (Mobile Responsive)

*   **Buttons:**
    *   **Primary CTA (e.g., "Start Triage", "Next Symptom", "See Results"):**
        *   Appearance: Solid Primary Action Blue background, white text.
        *   Shape: Rounded corners (e.g., 8-12px border-radius). Full-width on mobile for key actions.
        *   Padding: Ample (e.g., 12-16px vertical).
        *   States: Default, Hover/Pressed (subtle darken), Disabled (Light Grey background, Medium Grey text).
    *   **Secondary/Text Buttons (e.g., "Skip Question", "Learn More about this Symptom"):**
        *   Appearance: Text only, in Primary Action Blue or Text - Medium Grey.
        *   Usage: Less critical actions.
*   **Input Fields (for text-based symptom input, if not purely conversational AI):**
    *   Appearance: White background, Light Grey border.
    *   Shape: Rounded corners (e.g., 8-12px border-radius).
    *   Text: Text - Dark Grey/Black for input, Text - Medium Grey for placeholder.
    *   States: Default, Focused (border color changes to Primary Action Blue), Error (border changes to Critical Red).
    *   Height: Sufficient for easy tapping on mobile (min 44-48px).
*   **Chat Bubbles (for AI and user interaction):**
    *   **AI Bubble:** Light Grey/Off-White background, Dark Grey text.
    *   **User Bubble:** Primary Action Blue or Secondary Light Blue background, White or Dark Grey text.
    *   Shape: Rounded corners, with a "tail" pointing to the sender.
    *   Alignment: AI messages typically left-aligned, user messages right-aligned.
*   **Progress Indicators:**
    *   Style: Simple progress bar or step indicator (e.g., "Step 1 of 5").
    *   Color: Primary Action Blue for completed portion.
*   **Information/Alert Boxes:**
    *   Appearance: Background based on semantic color (e.g., light red for critical, light yellow for moderate), with an icon and clear text.
    *   Shape: Rounded corners.
*   **Selection Controls (e.g., for multiple choice answers from AI):**
    *   Style: Clearly defined tappable areas, can be styled as buttons or list items.
    *   Selected State: Primary Action Blue background or border, with a checkmark icon if appropriate.
*   **Modals/Dialogs (e.g., for confirmation, critical alerts):**
    *   Appearance: Overlay the main content with a semi-transparent scrim. Dialog box with clear text and action buttons.
*   **Header:**
    *   Mobile: Minimal, with app title/logo. A hamburger menu if secondary navigation is needed.
    *   Desktop: App title/logo, potentially navigation links if the app has more sections.
*   **Footer (if any):**
    *   Mobile: Could contain copyright or a link to terms/privacy. For a triage app, often kept minimal to focus on the task.
    *   Desktop: Similar, but may have more space.

---

### 10. Tone of Voice

The language used must be:

*   **Clear & Simple:** Avoid medical jargon. Use plain English.
*   **Empathetic & Reassuring:** Acknowledge user concerns. E.g., "I understand you're feeling [symptom]."
*   **Direct & Action-Oriented:** Guide the user clearly. E.g., "Please tell me more about...", "Tap the symptom that best describes..."
*   **Calm & Professional:** Maintain a reassuring and trustworthy tone.
*   **Example AI Prompts:** "Hello! I'm here to help you understand your symptoms. To start, could you please describe your main symptom?" or "Okay, thanks for sharing. Next, I need to ask..."
*   **Example User Guidance:** "Please answer the following questions to the best of your ability."

---

### 11. Accessibility (WCAG 2.1 AA Target)

*   **Color Contrast:** Min 4.5:1 for normal text, 3:1 for large text/UI components against backgrounds.
*   **Keyboard Navigation:** All interactive elements fully operable via keyboard.
*   **Focus Indicators:** Clear, visible focus states for all interactive elements.
*   **Semantic HTML:** Use `<h1>`-`<h6>` for headings, `<button>`, `<input>`, `<label>`, etc., appropriately.
*   **ARIA Attributes:** Use ARIA for dynamic content and custom controls to ensure screen reader compatibility.
*   **Touchable Targets:** Minimum 44x44px for all touch targets on mobile.
*   **Alternative Text:** Provide `alt` text for any meaningful images or icons (if not purely decorative).
*   **Font Sizing:** Allow users to resize text via browser settings if possible.

---

### 12. Mobile Responsiveness

*   **Fluid Grids & Flexible Images:** Content should reflow and resize gracefully.
*   **Breakpoint Strategy:** Define key breakpoints (e.g., small mobile, large mobile/small tablet, tablet, desktop) and adjust layout, font sizes, and spacing accordingly.
*   **Navigation:** Hamburger menu for main navigation on mobile if there are multiple top-level sections beyond the core triage flow.
*   **Interaction:** Ensure swipe gestures for carousels or horizontal scrolling content are intuitive.
*   **Performance:** Optimize images and assets for fast loading times on mobile networks.

---

This document provides a foundational set of design guidelines. It should be treated as a living document and updated as the AI Medical Triage Web App evolves. Regular review and adherence will ensure a high-quality, consistent user experience.
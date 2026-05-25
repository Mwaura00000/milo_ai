# Milo | Adaptive Study Planner & Behavioral Coach

Milo is a mobile-first Progressive Web App (PWA) study planner and behavioral coach designed specifically for university students in Kenya. It features a closed-loop learning telemetry system, automated spaced-repetition scheduling, and an AI chat buddy grounded in active course modules.

---

## 🚀 Core Features

### 1. Interactive Welcome & Simulated Demo (`/welcome`)
* **Live Closed-Loop Simulator**: Interactive sliders detailing telemetry captures, star-rating evaluations, and automated queue recalculations.
* **Functional Phone Preview**: Fully operational timeline preview matching standard PWA interfaces. Students can click dates to swap scheduled blocks or select units to trigger active Pomodoro models.

### 2. Academic Registration & Unit Planner (`/onboarding`)
* **Level Selection**: Interactive filters between University (Semester System) and High School (8-4-4 / CBC) stages.
* **Profile Enrollment**: Collects university details (UoN, JKUAT, Strathmore, Kenyatta University, USIU-A, etc.), degree majors, study year, and active semesters.
* **Dynamic Subject Injector**: Togglable predefined units and manual input fields to dynamically construct personalized study timelines.

### 3. Study Timeline Dashboard (`/`)
* **Milo Brand Headers**: Modern, sleek light-mode viewports displaying enrolled student profile badges.
* **Mockup Date Capsules**: Crisp date buttons with solid active capsules to swap daily study blocks.
* **High-Contrast Subject Cards**: Elevated white cards featuring thick left-hand colored borders and custom-mapped subject badges.
* **Fallback Sticker Mascots**: Automatically routes arbitrary custom subjects to render using our friendly Milo owl mascot as a generic default.

### 4. Telemetry Pomodoro Timer (`/focus`)
* **Radial Progress Loaders**: Ticking circular SVG timers tracking live study sessions.
* **Distraction Alert Logs**: Simple buttons to log phone pickups and other study interruptions.
* **Spaced Repetition Assessment**: Complete session logs prompting star comprehension ratings (1-5 stars) to update study priority queues in the database.

### 5. Syllabus AI Buddy (`/buddy`)
* **Custom Mascot Avatars**: Chatbot head dynamically swaps to match the active unit mascot (Calculator for Math, Earth for Geo, Owl fallback for custom modules).
* **Nairobi Collegiate Tone**: AI responds using localized friendly greetings.
* **Inline Adaptive Drills**: Gamified multiple-choice quiz blocks rendering inline in the chat bubble feed, complete with checkmarks and detail explanations.

### 6. Insights & Analytics (`/insights`)
* **Neon Bar Visualizations**: Recharts column charts plotting weekly study minutes.
* **Mastery Sliders**: Clean linear bars charting comprehension ratings.
* **Live Session Activity Log**: Pulls, parses, and lists completed study sessions directly from telemetry state.

---

## 🎨 Cartoon Mascot Assets
Milo features dedicated custom-generated sticker characters in the `public/` assets:
* `/milo_mascot.png` - Cute owl wearing a graduation cap (Logo / General Fallback Mascot).
* `/calculator_mascot.png` - Green calculator with smiley eyes (Mathematics).
* `/earth_mascot.png` - Globe character (Geography).
* `/physics_mascot.png` - Swirling atom sticker (Physics).
* `/chemistry_mascot.png` - Bubbling pink chemical flask (Chemistry).

---

## 🛠️ Tech Stack & Architecture
* **Framework**: Next.js 16 (App Router)
* **Styling**: Tailwind CSS & vanilla utility variables
* **Icons**: Lucide Icons
* **Charts**: Recharts
* **State Management**: Zustand
* **Database & Authentication**: Supabase PostgreSQL with `pgvector` embeddings

---

## 📦 Supabase Database Setup

1. Enable the `vector` extension in your Supabase SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. Copy the entire contents of [`schema.sql`](file:///c:/milo_ai/milo_ai/schema.sql) in the project root and run it inside the Supabase SQL editor to create the required tables (`profiles`, `subjects`, `topics`, `study_sessions`, `documents`, `document_chunks`), Row Level Security policies, indexes, and relations.

---

## ⚙️ Environment Configuration

1. Copy the `.env.example` template:
   ```bash
   cp .env.example .env.local
   ```
2. Enter your project's active Supabase connection keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

> [!TIP]
> ### 🛡️ Resilient Offline Development Fallbacks
> If Supabase environment keys are missing or unconfigured in your local `.env.local` file, the helper in `src/lib/supabase.ts` will **automatically activate a local storage mock database**. This allows you to test registrations, add custom subjects, tick Pomodoro sessions, log mastery alerts, and render dynamic analytics immediately with **zero configuration** required!

---

## 🚀 Running Locally

1. Install project dependencies:
   ```bash
   npm install
   ```
2. Launch the Next.js local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000/welcome` in your browser to experience the interactive landing page.

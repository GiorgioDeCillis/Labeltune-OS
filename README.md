<div align="center">
  <img src="/public/favicon.ico" width="100" alt="Labeltune-OS Logo">
  <h1>Labeltune OS</h1>
  <p><strong>The Next-Generation AI Data Labeling & Evaluation Platform</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## 🌟 Overview

**Labeltune OS** is a high-performance, enterprise-grade platform designed for massive data labeling and AI model evaluation. It bridges the gap between raw data and high-quality AI training sets by providing a structured, scalable, and visually stunning environment for annotators, reviewers, and project managers.

Inspired by the precision of **Hyprland** aesthetics and the power of industry leaders like **Scale AI**, Labeltune OS offers a unique "glassmorphic" interface that makes the complex task of data annotation feel premium and fluid.

---

## 🚀 Key Modules & Features

### 🛠️ Advanced Task Builder
- **Dynamic Template Engine**: Create complex labeling tasks using a drag-and-drop builder with real-time preview.
- **Rich Component Library**: Support for text evaluation, multi-choice accordions, rubric scorers, and more.
- **AI-Enhanced Instructions**: Integrated AI that helps project managers improve, translate, and format project guidelines automatically.

### 🎙️ Audio Engineering Suite
- **Precision Waveform Editor**: Powered by `wavesurfer.js` with millisecond-accurate seeking and hovering.
- **Automatic Transcription**: Seamless integration with **OpenAI Whisper** for real-time speech-to-text conversion.
- **Minimap Navigation**: Easy handling of long-form audio recordings with a draggable minimap.

### 🎓 Educational Onboarding
- **Mandatory Training Courses**: Ensure quality by requiring annotators to pass specific modules before starting real tasks.
- **Integrated Quiz System**: Automated evaluation of annotator readiness.

### 📊 Enterprise Analytics
- **Live Monitoring**: Track throughput, accuracy, and earnings in real-time.
- **Inter-Annotator Agreement**: Advanced metrics (Cohen’s Kappa) to ensure consistency across multiple labelers.
- **Dataset Explorer**: Searchable and filterable view of all completed annotations for enterprise clients.

---

## 💻 Tech Stack

Labeltune OS is built on the absolute bleeding edge of the web ecosystem:

- **Frontend Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://reactjs.org/)
- **Backend as a Service**: [Supabase](https://supabase.com/)
  - **PostgreSQL**: With robust Row Level Security (RLS).
  - **Auth**: Multi-tenancy support for organizations and individuals.
  - **Storage**: Scalable asset hosting for images and audio.
  - **Edge Functions**: For heavy AI processing and server-side logic.
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) with native PostCSS integration.
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/) for fluid, 60fps transitions.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, reactive global state.

---

## 🎨 Design Philosophy: The "Hyprland" Experience

We believe that professional tools shouldn't be boring. Labeltune OS features:
- **Glassmorphism**: 40px backdrop blurs and 90% opacity surfaces for a modern, layered look.
- **Animated Gradient Borders**: Rainbow and neon glow effects that highlight active work areas.
- **Theming Engine**: Switch between pre-configured themes like `Cyber Purple`, `Osaka Jade` (Matrix-style), and `Ayaka`.
- **Micro-interactions**: Subtle hover scales, spring-based animations, and color-shifting glows.

---

## 🏗️ Project Structure

```bash
Labeltune-OS/
├── src/
│   ├── app/            # Next.js App Router (Pages & API)
│   ├── components/     # Atomic UI components & complex modules
│   │   ├── builder/    # Project & Task creation tools
│   │   ├── dashboard/  # Role-specific dashboard views
│   │   └── education/  # Onboarding and course modules
│   ├── context/        # React Context providers
│   ├── utils/          # Helper functions and business logic
│   └── types/          # TypeScript definitions
├── supabase/
│   └── migrations/     # Database schema and RLS policies
└── public/             # Static assets and icons
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- A Supabase Project

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/GiorgioDeCillis/Labeltune-OS.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Rename `.env.local.example` to `.env.local` and populate your Supabase credentials.

4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by the Labeltune Team.

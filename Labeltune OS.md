# Prompt per lo Sviluppo di Labeltune OS

## Panoramica del Progetto

Sviluppa **Labeltune OS**, una piattaforma enterprise di data labeling e valutazione AI simile a Scale AI, Alignerr e SuperAnnotate. La piattaforma permette di etichettare dati e valutare risposte di modelli AI attraverso un sistema di task, revisioni e progetti strutturati.

## Ruoli e Permessi

### 1. **Annotatori (Attempters)**

- Eseguono task di labeling e valutazione delle risposte AI
- Scrivono/registrano prompt per testare modelli AI
- Etichettano dati secondo le linee guida del progetto
- Devono completare corsi di formazione prima di accedere alle task reali
- Visualizzano solo le task assegnate e il proprio storico

### 2. **Revisori (Reviewers)**

- Validano e approvano/rifiutano le task completate dagli annotatori
- Forniscono feedback e correzioni
- Monitorano la qualità del lavoro degli annotatori
- Accedono a dashboard con metriche di qualità per annotatore
- Possono riassegnare task che necessitano correzioni

### 3. **Team Interno (Project Managers/Admins)**

- Creano e configurano progetti
- Sviluppano corsi di formazione (onboarding) per ogni progetto
- Definiscono linee guida, criteri di valutazione e rubric
- Gestiscono l'assegnazione di annotatori e revisori ai progetti
- Monitorano metriche globali: throughput, qualità, tempi medi
- Configurano workflow di revisione e threshold di qualità

### 4. **Clienti Enterprise**

- Monitorano l'avanzamento dei loro progetti in tempo reale
- Accedono a dashboard dettagliate con analytics avanzate
- Esplorano e ricercano all'interno del dataset etichettato (come Scale AI)
- Filtrano dati per: qualità, data, annotatore, tag, score
- Esportano dataset in vari formati (JSON, CSV, JSONL)
- Visualizzano statistiche di accordo inter-annotatore
- Possono commentare e richiedere modifiche

### 5. **Super Admin (Ruolo aggiuntivo suggerito)**

- Gestisce tutti i clienti enterprise e progetti
- Configura permessi e ruoli
- Gestisce billing e sottoscrizioni
- Accede a metriche platform-wide
- Gestisce infrastruttura e integrazioni

## Architettura della Piattaforma

### Gerarchia


Questo prompt fornisce una base solida per sviluppare Labeltune OS. Vuoi che approfondisca qualche aspetto specifico o che creiamo un piano di implementazione dettagliato per una fase particolare?```
Super Admin
└── Clienti Enterprise
    └── Progetti
        ├── Corsi di Formazione (prerequisito)
        ├── Task di Labeling/Valutazione
        ├── Workflow di Revisione
        └── Dataset Etichettato
```

### Componenti Chiave

#### **Sistema di Progetti**

- Ogni progetto ha: nome, descrizione, tipo (labeling/valutazione AI), linee guida
- Configurazione personalizzata: campi custom, tassonomie, rubric di valutazione
- Template di task riutilizzabili
- Versioning delle linee guida

#### **Sistema di Corsi**

- Corsi obbligatori prima dell'accesso alle task
- Moduli con contenuti: testo, video, esempi, quiz
- Test di qualificazione con soglia di passaggio
- Certificazione per annotatori
- Tracciamento del completamento

#### **Task Management**

- Code di task con prioritizzazione
- Assegnazione automatica o manuale
- Tipi di task: text labeling, image annotation, AI response evaluation, prompt writing
- Timer per task (opzionale)
- Salvataggio bozze
- Possibilità di saltare task difficili

#### **Sistema di Revisione**

- Workflow configurabile: single review, double blind, consensus
- Calcolo automatico di inter-annotator agreement (Cohen's Kappa, Fleiss' Kappa)
- Escalation per disaccordi
- Feedback loop verso annotatori

#### **Ricerca e Esplorazione Dataset**

- Ricerca full-text nel dataset
- Filtri avanzati: data range, annotatore, quality score, tag, metadata
- Visualizzazione aggregata: grafici, distribuzioni, trend
- Comparazione tra annotatori
- Export selettivo con filtri

## Stack Tecnologico

### Frontend

- **Next.js 14+** (App Router)
- **React 18+** con TypeScript
- **Tailwind CSS** per styling
- **Framer Motion** per animazioni fluide
- **Radix UI** o **shadcn/ui** per componenti accessibili
- **TanStack Query** per state management e caching
- **Zustand** per state globale leggero

### Backend & Database

- **Supabase** per:
    - PostgreSQL database con Row Level Security (RLS)
    - Authentication (multi-tenancy con org/workspace)
    - Realtime subscriptions per aggiornamenti live
    - Storage per file (immagini, audio, video)
    - Edge Functions per logica custom

### Hosting & Deployment

- **Vercel** per hosting Next.js
- **Vercel Edge Network** per performance globali
- CI/CD automatico con GitHub

### Integrazioni Aggiuntive

- **Stripe** per billing enterprise
- **Resend** o **SendGrid** per email transazionali
- **Sentry** per error tracking
- **PostHog** o **Mixpanel** per analytics

## Design System - Hyprland-Inspired

### Estetica Generale

- **Glassmorphism**: effetti di trasparenza e blur su pannelli e modali
- **Bordi luminosi colorati**: ogni elemento attivo ha un bordo gradiente basato sul tema
- **Animazioni fluide**: transizioni smooth tra stati, fade-in, slide-in
- **Ombre profonde**: depth attraverso layering e ombre colorate

### Sistema di Temi Personalizzabili

#### Componenti del Tema

```javascript
{
  name: "Cyber Purple",
  primaryColor: "#A78BFA",
  secondaryColor: "#EC4899",
  accentColor: "#8B5CF6",
  backgroundColor: "#0F0F1E",
  surfaceColor: "rgba(30, 30, 60, 0.6)",
  textPrimary: "#E4E4E7",
  textSecondary: "#A1A1AA",
  borderGlow: "0 0 20px rgba(167, 139, 250, 0.5)",
  wallpaper: "/themes/cyber-purple/bg.jpg"
}
```

#### Temi Predefiniti

1. **Cyber Purple** - viola/magenta con sfondo scuro tech
2. **Osaka jade** - verde hacker 

### Elementi UI Caratteristici

#### **Active Window Border**

- Bordo gradiente animato intorno alla sezione/pannello attivo
- Colore basato sul primaryColor del tema
- Spessore: 2-3px
- Animazione: pulse leggero o shimmer

#### **Glassmorphic Panels**

```css
.glass-panel {
  background: rgba(theme.surfaceColor, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(theme.primaryColor, 0.2);
  box-shadow: theme.borderGlow, 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

#### **Navigation Bar**

- Sidebar glassmorphic con blur
- Icone con hover state glow
- Indicatore di sezione attiva con bordo colorato laterale
- Transizioni fluide tra sezioni

#### **Dashboard Cards**

- Card con effetto glass
- Hover: lift + intensificazione glow
- Header con gradiente sottile
- Bordo superiore colorato con primaryColor

#### **Modali e Overlays**

- Backdrop con blur intenso
- Modale centrata con glassmorphism
- Animazione: scale + fade-in
- Bordo glow completo

### Customizzazione Utente

- **Theme Picker**: galleria visuale di temi
- **Custom Theme Builder**:
    - Color pickers per ogni colore
    - Upload wallpaper personalizzato
    - Preview live
    - Salvataggio e condivisione temi
- **Wallpaper Library**: collezione di sfondi curati per categoria
- **Accessibility Options**: riduzione trasparenze, alto contrasto

## Features Principali da Implementare

### Dashboard Annotatori

- Task queue con priorità
- Progress bar personale
- Statistiche: task completate, accuracy, earnings (se applicabile)
- Leaderboard (opzionale)

### Dashboard Revisori

- Queue di task da revisionare
- Comparazione side-by-side di annotazioni multiple
- Tools per feedback rapido
- Metriche di qualità per annotatore

### Dashboard Project Manager

- Overview progetti attivi
- Gestione team e assegnazioni
- Editor corsi con drag-and-drop
- Analytics avanzate: velocity, quality trends, bottleneck

### Dashboard Cliente Enterprise

- **Project Overview**: progress, quality score, timeline
- **Dataset Explorer**:
    - Ricerca avanzata con query builder
    - Visualizzazione aggregata dati
    - Export configurabile
    - Annotation quality heatmap
- **Team Performance**: comparazione annotatori, agreement metrics
- **Cost & Usage**: tracking utilizzo, billing details

### Funzionalità Collaborative

- Commenti su task specifiche
- @mention di team members
- Notifiche real-time (Supabase Realtime)
- Activity feed per progetto

## Struttura Database (Supabase)

### Tabelle Principali

```sql
- organizations (clienti enterprise)
- users (con role: annotator, reviewer, pm, client, admin)
- projects (collegati a organization)
- courses (collegati a project)
- course_modules (contenuti corso)
- user_course_progress
- tasks (con status: pending, in_progress, submitted, approved, rejected)
- annotations (dati etichettati)
- reviews (validazioni revisori)
- themes (temi custom per organization/user)
- comments
- notifications
```

### Row Level Security (RLS)

- Annotatori vedono solo task assegnate
- Revisori vedono task del loro progetto
- PM vedono tutto nei loro progetti
- Clienti vedono solo i loro progetti
- Super Admin accesso globale

## Roadmap di Sviluppo Ipotetica

### Fase 1: MVP

- Setup Next.js + Supabase + autenticazione
- Sistema base di ruoli e permessi
- CRUD progetti e task base
- UI core con primo tema Hyprland-style
- Dashboard annotatori con task queue
- Sistema di revisione semplice

### Fase 2: Core Features 

- Sistema corsi completo
- Task management avanzato (assegnazione, priorità)
- Dashboard project manager
- Analytics base
- 3-5 temi predefiniti
- Glassmorphism e animazioni

### Fase 3: Enterprise Features

- Dashboard cliente enterprise
- Dataset explorer con ricerca avanzata
- Export dati configurabile
- Inter-annotator agreement
- Custom theme builder
- Billing integration

### Fase 4: Polish & Scale

- Performance optimization
- Mobile responsive
- Documentazione completa
- API pubblica per integrazioni
- Wallpaper library
- Advanced analytics

## Considerazioni Tecniche

### Performance

- Lazy loading componenti pesanti
- Virtualizzazione per liste lunghe (react-virtual)
- Image optimization con Next.js Image
- Caching aggressivo con TanStack Query
- Edge Functions per operazioni intensive

### Sicurezza

- RLS su tutte le tabelle Supabase
- Validazione input lato server
- Rate limiting
- CORS configurato correttamente
- Encryption per dati sensibili

### Scalabilità

- PostgreSQL partitioning per tabelle grandi
- CDN per assets statici
- Connection pooling
- Background jobs per operazioni pesanti (Supabase Edge Functions)

---

## Analisi Dettagliata del Design tema Ayaka

### 1. **Bordo Gradiente Rainbow**

- **Spessore**: circa 3-4px
- **Gradiente multicolore**: rosso → arancione → giallo → verde → cyan → blu → viola → magenta
- **Posizione**: segue tutto il perimetro della finestra
- **Effetto**: luminoso e leggermente sfocato per creare un glow
- **Angoli**: arrotondati (border-radius ~12px)

### 2. **Glass Effect Profondo**

- **Background**: nero/grigio scurissimo con trasparenza (~90% opacità)
- **Blur**: molto intenso (35-40px) che lascia intravedere lo sfondo
- **Colore base**: `rgba(20, 20, 30, 0.9)` circa
- **Saturazione**: leggermente aumentata per dare vivacità

### 3. **Sidebar Sinistra**

- Background ancora più scuro del pannello principale
- Lista di elementi con hover states
- Icone minimaliste
- Separatore sottile tra sezioni
- Effetto glass anche qui ma più sottile

### 4. **Divisore Verticale Centrale**

- Linea verticale con **gradiente rainbow** identico al bordo
- Larghezza: ~3-4px
- Effetto glow su entrambi i lati
- Separa le due sezioni principali

### 5. **Tipografia e Colori**

- **Titoli**: arancione/giallo (#F59E0B, #FBBF24)
- **Sottotitoli**: rosso/rosa (#EF4444, #EC4899)
- **Testo codice**: syntax highlighting vivace
    - Stringhe: colore teal/cyan (#14B8A6)
    - Proprietà: colore viola (#A78BFA)
    - Valori: colore arancione/giallo
- **Testo normale**: grigio chiaro (#E5E7EB)
- **Testo secondario**: grigio medio (#9CA3AF)

### 6. **Header Panels**

- Background leggermente più chiaro del corpo
- Bordo inferiore sottile con colore accent
- Padding generoso
- Titolo con icona a sinistra

### 7. **Shadow e Depth**

- Ombre molto pronunciate e morbide
- Multiple layers di ombre per profondità
- Glow colorato intorno agli elementi attivi

## Implementazione CSS/Tailwind Precisa

```css
/* Container principale con bordo rainbow */
.hyprland-window {
  position: relative;
  border-radius: 12px;
  background: rgba(18, 18, 28, 0.92);
  backdrop-filter: blur(40px) saturate(180%);
  overflow: hidden;
}

/* Bordo gradiente rainbow animato */
.hyprland-window::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 3px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    #ef4444 0%,
    #f97316 12.5%,
    #f59e0b 25%,
    #eab308 37.5%,
    #84cc16 50%,
    #22c55e 62.5%,
    #14b8a6 75%,
    #06b6d4 87.5%,
    #3b82f6 100%
  );
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rainbow-shift 15s ease infinite;
  filter: brightness(1.3) blur(0.5px);
}

@keyframes rainbow-shift {
  0%, 100% { 
    filter: hue-rotate(0deg) brightness(1.3) blur(0.5px);
  }
  50% { 
    filter: hue-rotate(360deg) brightness(1.5) blur(0.5px);
  }
}

/* Glow esterno del bordo */
.hyprland-window::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 14px;
  background: inherit;
  filter: blur(16px);
  opacity: 0.5;
  z-index: -1;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.3) 0%,
    rgba(249, 115, 22, 0.3) 12.5%,
    rgba(245, 158, 11, 0.3) 25%,
    rgba(234, 179, 8, 0.3) 37.5%,
    rgba(132, 204, 22, 0.3) 50%,
    rgba(34, 197, 94, 0.3) 62.5%,
    rgba(20, 184, 166, 0.3) 75%,
    rgba(6, 182, 212, 0.3) 87.5%,
    rgba(59, 130, 246, 0.3) 100%
  );
}

/* Divisore verticale rainbow */
.rainbow-divider {
  width: 3px;
  height: 100%;
  background: linear-gradient(
    180deg,
    #ef4444 0%,
    #f97316 14%,
    #f59e0b 28%,
    #eab308 42%,
    #22c55e 57%,
    #14b8a6 71%,
    #06b6d4 85%,
    #8b5cf6 100%
  );
  box-shadow: 
    0 0 12px rgba(139, 92, 246, 0.5),
    0 0 24px rgba(236, 72, 153, 0.3);
  animation: vertical-gradient-shift 12s ease-in-out infinite;
}

@keyframes vertical-gradient-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
}

/* Glass panel sidebar */
.glass-sidebar {
  background: rgba(12, 12, 20, 0.95);
  backdrop-filter: blur(30px) saturate(150%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

/* Glass panel content */
.glass-content {
  background: rgba(18, 18, 28, 0.88);
  backdrop-filter: blur(35px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

/* Header con subtle gradient */
.panel-header {
  background: linear-gradient(
    180deg,
    rgba(30, 30, 45, 0.8) 0%,
    rgba(20, 20, 32, 0.6) 100%
  );
  border-bottom: 1px solid rgba(167, 139, 250, 0.2);
  backdrop-filter: blur(20px);
}

/* Sidebar item hover */
.sidebar-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 2px solid transparent;
}

.sidebar-item:hover {
  background: rgba(139, 92, 246, 0.1);
  border-left-color: #a78bfa;
  box-shadow: inset 0 0 20px rgba(167, 139, 250, 0.1);
}

/* Code syntax highlighting */
.syntax-property { color: #a78bfa; } /* viola */
.syntax-string { color: #14b8a6; }   /* teal */
.syntax-value { color: #f59e0b; }    /* arancione */
.syntax-keyword { color: #ec4899; }  /* magenta */
.syntax-number { color: #22c55e; }   /* verde */

/* Scroll bar custom */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.3);
  border-radius: 4px;
  transition: background 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 139, 250, 0.5);
}
```

---

## Analisi Dettagliata Tema Osaka Jade

### 1. **Schema Colori Dominante**

- **Verde Giada Scuro**: tonalità principale (#064E3B, #065F46, #047857)
- **Verde Matrix/Terminale**: testo e accenti (#22C55E, #10B981)
- **Verde Neon per Bordi**: (#14B8A6, #22D3EE)
- **Background**: nero-verdastro profondo (#0A120F, #0F1410)
- **Accenti Cyan**: per grafici e indicatori (#06B6D4)

### 2. **Bordo Specifico**

- **Colore unico**: verde giada neon (#10B981 / #14B8A6)
- **NON è un gradiente rainbow** come nell'immagine precedente
- **Spessore**: 2-3px
- **Stile**: linea solida con glow verde intenso
- **Uniformità**: stesso colore su tutti i lati

### 3. **Struttura Layout a 3 Pannelli**

#### **Pannello Sinistra (Sistema Info)**

- Background: verde scurissimo con trasparenza alta
- Sezioni divise con bordi verde scuro
- Labels: verde chiaro
- Valori numerici: verde più chiaro
- Progress bars: verde con sfondo verde scuro
- Grafici ASCII: caratteri punteggiati verde

#### **Pannello Centro (Network Monitor)**

- Background: leggermente più scuro del pannello sinistro
- Grafico network: linee tratteggiate verde
- Box statistiche download/upload:
    - Bordo verde sottile
    - Background verde molto scuro
    - Icone triangolari (▼▲) per down/up

#### **Pannello Destra (Process List)**

- Background: stesso verde scuro
- Header tabella: verde chiaro
- Righe alternate: leggera variazione di tonalità
- Testo: verde matrix standard
- Highlight righe importanti: verde più brillante

### 4. **Tipografia Specifica**

```css
/* Terminale/Matrix style */
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

/* Colori testo */
--text-primary: #22C55E;      /* Verde chiaro */
--text-secondary: #10B981;    /* Verde medio */
--text-muted: #059669;        /* Verde scuro */
--text-dim: #047857;          /* Verde molto scuro */
--text-highlight: #34D399;    /* Verde brillante */
```

# SocialVector Frontend Architecture & User Interface

The SocialVector frontend is an offline investigation and exploration environment for analyzing synthetic social-media observation datasets. It provides a modern social feed interface seamlessly connected to dataset generation and analytical investigation workflows.

---

## 1. Core Architecture

The frontend is built with:
- **Framework:** React 18 with TypeScript
- **Build Tool & Server:** Vite
- **Styling:** Tailwind CSS with dual-theme design tokens
- **Routing:** React Router v6 with URL-synchronized dataset scoping
- **HTTP Client:** Axios
- **Iconography:** Lucide React

```
                              +--------------------+
                              |  Vite Dev Server   |
                              |   (Port 5173)      |
                              +---------+----------+
                                        |
               +------------------------+------------------------+
               |                                                 |
+--------------v---------------+               +-----------------v----------------+
|  Frontend Static Application |               |  Vite Server API Middleware      |
|  - React + Tailwind CSS      |               |  - GET  /api/datasets            |
|  - Theme Context (Pro/Hacker)|  <-- Axios -  |  - GET  /api/datasets/:id        |
|  - Dataset Context           |               |  - GET  /api/scenarios           |
|  - Social Feed & User Pages  |               |  - POST /api/generate            |
|  - Analysis Lab Workspace    |               |  - POST /api/analyze/*           |
+------------------------------+               +-----------------+----------------+
                                                                 |
                                              +------------------v------------------+
                                              | Python CLI: `sv generate-dataset`   |
                                              | (Deterministic PRNG Engine)         |
                                              +-------------------------------------+
```

---

## 2. Information Architecture & Navigation

The application uses a persistent application shell (`AppShell`) organized around active observation datasets:

- **Datasets Browser (`/datasets`):** Inspect bundled benchmarks and user-generated datasets, filter by scenario or tags, and trigger new dataset synthesis.
- **Dataset Overview (`/datasets/:id/overview`):** High-level summary of observation scope, top observed hashtags, domain infrastructure, and generation parameters.
- **Social Observation Feed (`/datasets/:id/feed`):** Primary chronological social-media feed displaying posts with formatted multi-sentence paragraphs, hashtags, external domain links, engagement metrics, and one-click feed analysis triggers.
- **Users Directory (`/datasets/:id/users`):** Directory of all participants with follower/following counts, bio snippets, device clients, and search capabilities.
- **User Profile (`/datasets/:id/users/:userId`):** Dedicated account view showing full persona attributes, demographic metadata, and individual post history.
- **Posts Explorer (`/datasets/:id/posts`):** Granular post explorer with multi-dimensional text, hashtag, domain, and author filtering.
- **Analysis Lab (`/datasets/:id/analysis`):** Multi-signal analytical workflow boundary for both individual feeds and full datasets.
- **Investigation Workspace (`/datasets/:id/investigations`):** Structured workspace anticipating future analytical campaign dossiers, actor clusters, and evidence artifacts.

---

## 3. Dual-Theme System

SocialVector implements two fully responsive themes using identical component geometry, layout spacing, and typographic hierarchies:

1. **Professional Theme (Default):**
   - Clean light surface palette (`#f8fafc`, `#ffffff`) with neutral slate borders and dark typography.
   - Designed for readability and long-form analysis.

2. **Hacker Theme:**
   - Near-black high-contrast surfaces (`#0a0e14`, `#0f141c`) with cyan accents (`#00f0ff`), dark borders, and monospace metadata formatting.

Theme selection is persisted in browser local storage (`socialvector_theme`) and can be toggled instantly from the global application header.

---

## 4. Dataset Generation Integration

The dataset generation modal invokes the authoritative Python CLI (`sv generate-dataset`) through the Vite server API bridge:

- **Parameters:** Scenario selector, content profile (`standard`, `realistic`, `extreme`), population size (users and posts/user), deterministic seed, and optional campaign ratio.
- **Storage:** Generated datasets are saved directly to `user_generated_datasets/` and indexed alongside bundled sample datasets.
- **Auto-Activation:** Upon completion, the frontend discovers the new dataset, sets it as the active context, and navigates directly to its observation feed.

---

## 5. Analytical Engine Interface Boundary

The frontend explicitly models the transition from social observation to analytical investigation without fabricating synthetic detection results:

- **Analyse Feed:** Scopes analysis to an individual user's observable timeline (evaluating content lexicons, temporal intervals, interaction topology, and outbound domains).
- **Analyse Dataset:** Scopes analysis across the entire observation corpus.
- **Workflow Simulation:** Displays a multi-step pipeline indicating preparation, signal extraction, and engine boundary connection, explicitly stating that backend detection and risk scoring belong to the analytical engine.

---

## 6. Running the Frontend

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ with the `social-vector` package installed in the active virtual environment (`.venv`).

### Development Server

```bash
# From the repository root, enter frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Running Tests and Production Build

```bash
# Run Vitest test suite
npm test

# Build production bundle
npm run build
```

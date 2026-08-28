# SocialVector

**SocialVector** is an offline-first social-media observation, synthetic dataset generation, and forensic coordination analysis platform. It is designed for cybersecurity researchers, threat intelligence analysts, and data scientists investigating Information Operations (IO), coordinated inauthentic behavior (CIB), astroturfing, and narrative manipulation campaigns.

---

## Architecture Overview

```
+──────────────────────────────────────────────────────────────────────────────────────────────────+
|                                      SOCIALVECTOR PLATFORM                                       |
+───────────────────────────────────┬──────────────────────────────────────────────────────────────+
|    SYNTHETIC GENERATION ENGINE    |                  CANONICAL ANALYTICAL ENGINE                 |
|                                   |                                                              |
| • Deterministic PRNG (SHA-256)    | 1. Ingestion & Scoping (Dataset / User / Feed)               |
| • Realistic Persona & Pareto Skew | 2. Entity Tokenization & URL Domain Extraction               |
| • Circadian Diurnal Time Cycles   | 3. Semantic Embedding (TF-IDF + Randomized TruncatedSVD)     |
| • Gaussian Burst Spikes & Crons   | 4. Sliding-Window Temporal Burst & Synchrony Detection      |
| • 6-Stage Geopolitical IO Model  | 5. SHA-256 Verbatim Repetition & Bipartite Domain Overlap    |
| • Zero Ground-Truth Leaks         | 6. Behavioral Demographic Profiling (Batching / Homogeneity) |
| • Multi-Sentence Discourse Frames | 7. Precomputed Multi-Signal DBSCAN Clustering                |
|                                   | 8. NetworkX Relational Coordination Topology Graph           |
|                                   | 9. Weighted Signal Fusion & Calibrated Confidence Assessment |
+───────────────────────────────────┴──────────────────────────────────────────────────────────────+
|                                INTERFACES & WORKSPACE MODES                                      |
| • FastAPI REST Server with Server-Sent Events (SSE) Live Pipeline Streaming                      |
| • Interactive Web UI (Feed Explorer, Analysis Lab, Campaign Dossiers, Topology Graph)            |
| • `sv` Command-Line Interface for Local Batch Processing & Pipeline Orchestration               |
+──────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## Core Guarantees & Philosophy

- **Deterministic Reproducibility:** Given the same scenario name, parameters, and random seed, the generator produces bitwise-identical output on any platform.
- **Offline-First & Local:** Zero cloud dependencies, zero external network calls, and zero external LLM API requirements.
- **Strict Separation of Concerns:** Observable metadata (posts, users, engagement counters, client sources) never contains leaked ground-truth labels. The analytical engine evaluates feeds strictly through external observables.
- **Observable 9-Stage Pipeline:** Every stage reports execution timing, operational parameters, intermediate metrics, and diagnostic evidence items.
- **False-Positive Resistance:** The engine distinguishes organic breaking-event virality (high semantic similarity + normal temporal spread + 0 clusters) from coordinated influence operations (high semantic + temporal synchrony + shared infrastructure + dense clusters).

---

## How It Works

### 1. Synthetic Dataset Generation Engine

The dataset generation subsystem (`social_vector/generation/`) simulates authentic and coordinated social-media environments without relying on cloud LLMs:

```
[Master Seed] ──► [SHA-256 Domain Sub-Streams] ──► [Personas / Diurnal Temporal / Discourse Templates]
                                                              │
                                                              ▼
                                               [Pluggable Scenario Execution]
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                                 [Observable Social Feed]           [Isolated Ground Truth]
                                (Users, Posts, Metrics)           (Campaigns, Actor Roles)
```

- **Hierarchical PRNG Seed Derivation:** Spawns independent sub-streams for users, posts, timestamps, metrics, and campaigns via SHA-256 hashing (`seed.py`), preventing cross-platform random state drift.
- **Persona & Demographic Synthesis:** Models organic accounts spanning years with Pareto heavy-tailed follower distributions ($\alpha = 1.8$), realistic biographies, and global locales. Campaign accounts exhibit coordinated registration batching, elevated following-to-follower ratios, and automation clients (`personas.py`).
- **Temporal Stochastic Models:** 
  - *Diurnal Cycle:* Hourly human waking/sleeping probability curve evaluated via rejection sampling (`temporal.py`).
  - *Gaussian Bursts:* Tightly clustered timestamp spikes centered around trigger events ($t \sim \mathcal{N}(T_{\text{center}}, \sigma^2)$).
  - *Periodic Automation:* Fixed-interval crons with bounded jitter.
- **Multi-Sentence Discourse Framing:** Constructs structured multi-paragraph posts across four length tiers (`short`, `medium`, `long`, `very_long`) adhering to configurable content profiles (`profiles.py`).
- **6-Stage Geopolitical Simulation:** Simulates full campaign lifecycles: narrative seeding, breaking amplification, manufactured grassroots outrage, counter-attacks on fact-checkers, diplomatic escalation, and persistent dossier archiving (`geopolitical.py`).

---

### 2. Forensic Analytical Pipeline

The analytical engine (`social_vector/analysis/`) ingests raw datasets and executes a 9-stage investigation pipeline:

```
[Raw Observation Dataset]
       │
       ▼
 1. Ingestion & Scoping               ──► Resolves file paths, parses schema, applies scope filters
 2. Preprocessing & Normalization     ──► Canonicalizes text, extracts domain hostnames & hashtags
 3. Semantic Embedding (TF-IDF + SVD) ──► Computes dense 384-dim embeddings & pairwise cosine similarity
 4. Temporal Burst Analysis           ──► Sweeps 300s sliding windows to detect cross-account spikes
 5. Content Reuse & Domain Index      ──► Fingerprints exact text duplicates (SHA-256) & shared domains
 6. Behavioral Demographics           ──► Flags registration batching (48h rolling) & client homogeneity
 7. Multi-Signal DBSCAN Clustering    ──► Clusters on composite distance matrix (50% Sem, 30% Temp, 10% Dom, 10% Tag)
 8. NetworkX Relational Graph         ──► Builds heterogeneous topology (Users, Domains, Clusters)
 9. Signal Fusion & Risk Scoring      ──► Fuses weighted signals into a calibrated investigation dossier
       │
       ▼
[Structured Investigation Dossier (JSON)]
```

#### Multi-Signal Distance Formulation
Rather than clustering on raw text alone, DBSCAN operates on a **precomputed composite distance matrix**:

$$S_{\text{composite}} = 0.50 \cdot S_{\text{semantic}} + 0.30 \cdot (1.0 - D_{\text{temporal}}) + 0.10 \cdot S_{\text{domain}} + 0.10 \cdot S_{\text{hashtag}}$$

$$D_{\text{composite}} = \text{clip}\left(1.0 - S_{\text{composite}}, 0.0, 1.0\right)$$

#### Calibrated Confidence Scoring
Individual signals ($s_i \in [0, 1]$) are fused into a weighted coordination score:

$$\text{Score}_{\text{overall}} = \frac{\sum_{i=1}^6 w_i \cdot s_i}{\sum_{i=1}^6 w_i}$$

The engine assigns calibrated assessment tiers based on signal convergence and cluster formation:
- `high_confidence_coordinated_operation`: Multi-signal convergence with verified infrastructure/burst clusters.
- `moderate_coordination_potential`: Observable partial signals requiring ongoing monitoring.
- `low_suspicion_organic_similarity`: High semantic overlap without temporal burst or cluster formation (organic viral event).
- `low_suspicion_organic`: Baseline organic discourse.

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Python Analytical Backend & CLI

```bash
# Clone the repository
git clone https://github.com/mano-rp/social-vector.git
cd social-vector

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package in editable mode with development dependencies
pip install -e ".[dev]"
```

### 2. Frontend Web Application

```bash
# Navigate to frontend and install dependencies
cd frontend
npm install
```

---

## Quick Start

### 1. Run Analytical Pipeline via CLI (`sv`)

```bash
# Run forensic analysis on a dataset
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json

# Export structured investigation dossier as JSON
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json --json -o dossier.json

# Stream live pipeline stage progress to terminal
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json --stream

# Analyze a specific suspect user persona or feed timeline
sv analyze user datasets/sample_extreme_geopolitical_operation.json usr_io_000001
sv analyze feed datasets/sample_extreme_geopolitical_operation.json
```

### 2. Launch the Web Application

```bash
# Start the frontend development server
cd frontend
npm run dev
```

Open `http://localhost:5173` to access:
- **Feed Explorer & User Timelines:** Inspect accounts, interactions, and chronological feeds.
- **Analysis Lab:** Trigger live, observable analytical pipeline runs with real-time SSE progress.
- **Campaign Investigation Workspace:** Explore coordinated cluster dossiers, evidence logs, content reuse breakdowns, behavioral demographic charts, and interactive relational graph topologies.
- **Interactive Dataset Generator:** Synthesize custom datasets with real-time parameter configuration.

### 3. Generate Synthetic Datasets

```bash
# List all available scenarios
sv list-scenarios

# Generate an extreme 6-stage geopolitical information operation dataset
sv generate-dataset \
    --scenario extreme_information_operation \
    --content-profile extreme \
    --users 500 \
    --posts-per-user 6 \
    --seed 2026 \
    --campaign-ratio 0.20 \
    -o dataset_extreme.json

# Inspect and validate dataset schema & referential integrity
sv inspect-dataset dataset_extreme.json -v
```

---

## Benchmark Datasets

The repository includes pre-generated deterministic datasets in `datasets/`:

| Dataset File | Scenario | Users | Posts | Narrative / Purpose |
|---|---|---|---|---|
| `datasets/sample_realworld_geopolitical_conflict.json` | `realworld_geopolitical_conflict` | 500 | 1,976 | Sovereign defense policy, border security, and diplomatic sanctions |
| `datasets/sample_extreme_geopolitical_operation.json` | `extreme_information_operation` | 500 | 2,953 | 6-stage fictional geopolitical IO with heterogeneous actor roles |
| `datasets/sample_coordinated_campaign.json` | `coordinated_campaign` | 1,000 | 5,791 | High-volume overt campaign with synchronized burst waves |
| `datasets/sample_paraphrased_coordination.json` | `paraphrased_coordination` | 50 | 284 | Subtle semantic paraphrasing and narrative alignment |
| `datasets/sample_false_positive_organic.json` | `organic_topical_similarity` | 50 | 200 | Organic viral breaking-event benchmark (high semantic, 0 clusters) |
| `datasets/sample_organic_small.json` | `organic_activity` | 10 | 36 | Small organic baseline feed |

---

## Testing

```bash
# Run all 48 Python backend and analytical unit/integration tests
pytest

# Run frontend tests
cd frontend
npm test
```

---

## Documentation

- [Analytical Engine & Detection Signals Guide](docs/analysis.md)
- [Dataset Generation Architecture](docs/generation.md)
- [Scenarios & Benchmark Guide](docs/scenarios.md)
- [Dataset Schema Specification](docs/schema.md)
- [Frontend Architecture & UI Reference](docs/frontend.md)
- [CLI Reference Manual](docs/cli.md)
- [Comprehensive Backend Technical Guide](BACKEND_EXPLANATION.md)

---

## License

Apache-2.0

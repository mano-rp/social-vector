# SocialVector Backend Architecture & Deep Technical Explanation

## 1. Executive Summary & Core Philosophy

**SocialVector** is an offline-first, high-fidelity social-media simulation, synthetic dataset generation, and forensic coordination analysis platform. It is engineered for cybersecurity researchers, intelligence analysts, and data scientists studying Information Operations (IO), coordinated inauthentic behavior (CIB), narrative manipulation campaigns, and astroturfing.

```
+--------------------------------------------------------------------------------------------------+
|                                     SOCIALVECTOR PLATFORM                                        |
+-------------------------------------------------+------------------------------------------------+
|          SYNTHETIC GENERATION ENGINE            |           CANONICAL ANALYTICAL ENGINE          |
|                                                 |                                                |
|  - Deterministic PRNG Streams (SHA-256)         |  - Observable 9-Stage Pipeline                 |
|  - Multi-Stage Geopolitical Conflict Modeling   |  - TF-IDF + TruncatedSVD Semantic Embeddings   |
|  - Realistic Persona & Diurnal Timelines        |  - Sliding-Window Temporal Burst Detection     |
|  - Strict Ground-Truth Isolation (Zero Leaks)   |  - Precomputed Multi-Signal DBSCAN Clustering  |
|  - Multi-Tier Discourse & Template Framing      |  - NetworkX Relational Topology Modeling       |
|                                                 |  - Transparent Weighted Multi-Signal Fusion    |
+-------------------------------------------------+------------------------------------------------+
|                        OFFLINE REST API & CLI EXECUTION INTERFACE                                |
|                 FastAPI (SSE Real-Time Streaming)  |  `sv` Command-Line Tool                     |
+--------------------------------------------------------------------------------------------------+
```

### Key Architectural Guarantees

1. **Deterministic Reproducibility:** Given the same scenario name, parameters, and 32-bit integer seed, the generator produces bitwise-identical datasets across different machines and operating systems.
2. **Zero Cloud / External API Dependencies:** The entire analytical pipeline, text generation engine, embedding model, clustering algorithm, and graph constructor run 100% locally with standard Python scientific libraries (`numpy`, `scipy`, `scikit-learn`, `networkx`, `fastapi`).
3. **Strict Separation of Concerns:** Observable metadata (posts, users, engagement counters, client sources) never contains leaked ground-truth labels. The analytical engine analyzes feeds strictly through external observables without ground-truth contamination.
4. **Observable 9-Stage Pipeline:** Every stage of the forensic evaluation exposes execution duration, operational parameters, intermediate counters, warnings, and diagnostic telemetry.
5. **False-Positive Resistance:** The engine distinguishes organic breaking-event virality (high semantic similarity + normal temporal spread + 0 clusters) from coordinated influence operations (high semantic + temporal synchrony + shared infrastructure + dense clusters).

---

## 2. Directory Structure & Module Layout

The backend codebase is cleanly modularized under `src/social_vector/`:

```
src/social_vector/
|-- __init__.py                  # Package root and public exports
|-- __version__.py              # Engine version and Schema version definitions
|
|-- schema/                     # Data Models, Serialization, and Validation
|   |-- __init__.py
|   |-- models.py               # Dataclasses: UserRecord, PostRecord, SocialDataset, GroundTruth
|   |-- serialization.py        # Deterministic JSON encoding and file I/O
|   |-- validation.py           # Referential integrity and ground-truth leak validators
|
|-- generation/                 # Synthetic Simulation & Generation Subsystem
|   |-- engine.py               # DatasetGenerator coordinator and GenerationConfig
|   |-- seed.py                 # DeterministicRNG and SHA-256 hierarchical seed derivation
|   |-- profiles.py             # ContentProfile enum and PostLengthTier distributions
|   |-- personas.py             # User persona generation (demographics, bio, Pareto metrics)
|   |-- vocabulary.py           # Multi-topic lexicons, entities, hashtags, and phrases
|   |-- templates.py            # Organic post composition frames and paraphrase builders
|   |-- temporal.py             # Circadian diurnal curves, burst windows, cron periodicities
|   |-- geopolitical.py         # 6-stage fictional geopolitical IO universe & narrative claims
|   |-- ground_truth.py         # GroundTruthBuilder for campaign and noise tracking
|   |-- scenarios/              # Pluggable generation scenarios
|       |-- __init__.py
|       |-- base.py             # BaseScenario abstract class and ScenarioMetadata
|       |-- registry.py         # ScenarioRegistry decorator and lookup mechanisms
|       |-- organic.py          # Baseline organic social feed
|       |-- coordinated_campaign.py # High-volume overt coordinated campaign
|       |-- paraphrased_coordination.py # Subtle semantic paraphrasing campaign
|       |-- false_positive.py   # Organic breaking news topical similarity benchmark
|       |-- extreme_campaign.py # 6-stage high-intensity geopolitical operation
|       |-- realworld_geopolitical.py # Real-world conflict and state defense operation
|
|-- analysis/                   # Forensic Detection & Analytical Pipeline
|   |-- models.py               # AnalysisResult, PipelineStageResult, CoordinatedCluster, GraphData
|   |-- ingestion.py            # Dataset loading, path resolution, and scope filtering
|   |-- preprocessing.py        # Tokenization, text cleaning, domain/hashtag extraction, epochs
|   |-- pipeline.py             # 9-stage AnalysisPipeline orchestrator
|   |-- features/               # Feature extraction engines
|   |   |-- embeddings.py       # TF-IDF + TruncatedSVD dense semantic embeddings
|   |   |-- temporal.py         # Sliding-window burst detection and sync pairs
|   |   |-- content.py          # SHA-256 verbatim text fingerprinting & domain bipartite index
|   |   |-- behavior.py         # Registration batching, client homogeneity, follower asymmetry
|   |-- clustering/
|   |   |-- dbscan.py           # Multi-signal composite distance matrix & DBSCAN clustering
|   |-- signals/
|   |   |-- evaluators.py       # Individual signal evaluators (semantic, temporal, content, etc.)
|   |-- scoring/
|   |   |-- fusion.py           # Weighted multi-signal fusion, confidence categorization, evidence
|   |-- graph/
|       |-- builder.py          # NetworkX relational graph constructor
|
|-- server/
|   |-- app.py                  # FastAPI REST API with SSE live streaming (`/api/analysis/stream`)
|
|-- cli/                        # Command-Line Tool (`sv`)
|   |-- __init__.py
|   |-- main.py                 # Argument parser and command router
|   |-- analyze_cmd.py          # `sv analyze dataset|user|feed` handler
|   |-- generate_cmd.py         # `sv generate-dataset` handler
|   |-- inspect_cmd.py          # `sv inspect-dataset` validation handler
|   |-- scenarios_cmd.py        # `sv list-scenarios` handler
```

---

## 3. Data Architecture & Schema Layer (`social_vector/schema/`)

The data layer defines canonical dataclasses representing observable social media structures and isolated ground truth.

```
                           +------------------------------------------+
                           |              SocialDataset               |
                           +--------------------+---------------------+
                                                |
                +-------------------------------+-------------------------------+
                |                               |                               |
    +-----------v-----------+       +-----------v-----------+       +-----------v-----------+
    |    DatasetMetadata    |       |   List[UserRecord]    |       |   List[PostRecord]    |
    |                       |       |                       |       |                       |
    | - dataset_id          |       | - user_id             |       | - post_id             |
    | - schema_version      |       | - username            |       | - author_id (FK)      |
    | - scenario            |       | - bio                 |       | - content             |
    | - seed                |       | - created_at (ISO)    |       | - created_at (ISO)    |
    | - parameters          |       | - metrics (Followers) |       | - entities (URLs, #)  |
    | - statistics          |       | - device_client       |       | - metrics (Likes, RT) |
    +-----------------------+       +-----------------------+       +-----------------------+
                                                |
                                    +-----------v-----------+ (Optional / Generator Only)
                                    |      GroundTruth      |
                                    |                       |
                                    | - has_coordination    |
                                    | - scenario_type       |
                                    | - campaigns           |
                                    | - noise_user_ids      |
                                    +-----------------------+
```

### Core Schema Data Models (`schema/models.py`)

1. **`UserRecord` & `UserMetrics`**:
   - `user_id` (e.g. `usr_000102`): Immutable unique account identifier.
   - `username` (e.g. `elena_novak_042`): Public handle.
   - `created_at`: ISO 8601 UTC registration timestamp (e.g. `2026-06-12T14:22:10Z`).
   - `device_client`: The originating client string (e.g. `Web Client`, `iOS App`, `ThirdPartyClient/3.1`).
   - `metrics`: Observable engagement counters: `followers_count`, `following_count`, `posts_count`, `listed_count`.
   - `custom_attributes`: Open dictionary for extensible metadata.

2. **`PostRecord`, `PostEntities` & `PostMetrics`**:
   - `post_id` (e.g. `post_000491`): Unique post identifier.
   - `author_id`: Foreign key referencing a valid `UserRecord.user_id`.
   - `created_at`: ISO 8601 UTC post creation timestamp.
   - `content`: Plain text body of the post.
   - `entities`: Structured extracted features (`hashtags`, `mentions`, `urls`, `media_urls`).
   - `metrics`: Observable interaction metrics (`likes_count`, `reposts_count`, `replies_count`, `quotes_count`, `impressions_count`).
   - `reply_to_post_id`, `repost_of_post_id`: Threading references.

3. **`GroundTruth` & `CampaignGroundTruth`**:
   - Known only to the dataset generator for benchmark evaluation.
   - Stores `campaign_id`, `narrative_theme`, `coordination_type`, `participating_user_ids`, `affiliated_post_ids`, `targeted_entities`, and `temporal_windows`.

### Strict Validation & Leak Prevention (`schema/validation.py`)

The `validate_dataset(dataset)` function enforces strict referential and structural integrity:
- **Timestamp Integrity:** Verifies every timestamp adheres to strict ISO 8601 format with timezone offsets.
- **Referential Integrity:** Ensures every `post.author_id` points to an existing `user.user_id`. Ensures `campaign.participating_user_ids` and `affiliated_post_ids` exist.
- **Anti-Leak Defense:** Scans `user.custom_attributes` and `post.custom_attributes` for keys such as `ground_truth`, `is_bot`, `campaign_id`, or `is_coordinated`. If detected, validation fails immediately.

---

## 4. Synthetic Dataset Generation Subsystem (`social_vector/generation/`)

The generation engine creates statistically realistic, structurally nuanced social feeds with zero external LLM dependencies.

```
                           +---------------------------------------+
                           |       GenerationConfig & Seed         |
                           +-------------------+-------------------+
                                               |
                          +--------------------v--------------------+
                          |     DeterministicRNG Hierarchy          |
                          | (SHA-256 Seed Sub-Stream Derivation)    |
                          +--------------------+--------------------+
                                               |
             +------------------+--------------+------------------+------------------+
             |                  |                                 |                  |
    +--------v-------+  +-------v--------+               +--------v-------+  +-------v--------+
    | User Personas  |  | Temporal Model |               | Discourse & IO |  |  Ground Truth  |
    | - Demographics |  | - Diurnal Waking               | - Templates    |  | - Attribution  |
    | - Pareto Skew  |  | - Burst Waves                  | - 6-Stage IO   |  | - Benchmarks   |
    | - Bot/Organic  |  | - Periodic Cron                | - Length Tiers |  +----------------+
    +--------+-------+  +-------+--------+               +--------+-------+
             |                  |                                 |
             +------------------+----------------+----------------+
                                                 |
                                     +-----------v-----------+
                                     |   SocialDataset JSON  |
                                     +-----------------------+
```

### Deterministic PRNG Stream Architecture (`generation/seed.py`)

To prevent cross-platform seed divergence, seed derivation is implemented via cryptographic hashing:

$$\text{Seed}_{\text{child}} = \text{int}\Big(\text{SHA-256}\big( \text{MasterSeed} \parallel \text{":"} \parallel \text{Domain} \parallel \text{":"} \parallel \text{Index} \big)[:8], 16\Big)$$

The `DeterministicRNG` class wraps `random.Random` and spawns dedicated, isolated sub-streams:
- `user_rng = rng.spawn("users")`
- `post_rng = rng.spawn("posts")`
- `temporal_rng = rng.spawn("temporal")`
- `metrics_rng = rng.spawn("metrics")`
- `campaign_rng = rng.spawn("campaign")`

### Demographic & Persona Modeling (`generation/personas.py`)

The engine generates heterogeneous account personas:
- **Names & Locations:** 60+ first names, 50+ surnames, 25+ global metropolitan hubs, 20+ professional occupations, and 20+ specialized interests.
- **Organic Personas:** Account ages span 6 months to 8 years. Follower counts follow a **Pareto (heavy-tail) distribution** ($\alpha = 1.8$):
  $$\text{Followers} = \lfloor 20 + \text{Pareto}(\alpha=1.8) \times 45 \rfloor$$
- **Bot / Inauthentic Personas:** Accounts registered within tight temporal batches (e.g. 5 to 60 days before the incident). Characterized by high following-to-follower ratios (asymmetry $> 5.0$), generic bot usernames (`first_index0048`), and automated client sources (`ThirdPartyClient/3.1`).

### Discourse Frames & Content Profiles (`generation/profiles.py`, `templates.py`)

SocialVector models multi-sentence rhetorical structures across four content profiles:

| Profile | Short (1-2 sent) | Medium (2-4 sent) | Long (4-7 sent) | Very Long (7-12 sent) | Focus |
|---|---|---|---|---|---|
| `standard` | 85% | 15% | 0% | 0% | Fast baseline benchmarks |
| `realistic` | 25% | 45% | 22% | 8% | Coherent civic and technical discourse |
| `extreme` | 20% | 35% | 30% | 15% | Multi-stage geopolitical conflict operation |
| `realworld` | 18% | 42% | 28% | 12% | Sovereign state conflict & international policy |

### Temporal Modeling (`generation/temporal.py`)

Timestamps are generated through three distinct temporal stochastic models:

1. **Circadian Diurnal Waking Cycle (`sample_organic_timestamp`):**
   Applies a 24-hour activity probability density function $W(h)$ reflecting human diurnal habits (lull between 00:00-05:00 UTC, surge at 08:00-11:00 UTC, peak at 18:00-21:00 UTC) evaluated via **rejection sampling**:
   $$\text{Accept Candidate if } U(0, 1) < \frac{W(h)}{0.25}$$

2. **Gaussian Synchronized Bursts (`sample_burst_timeline`):**
   Clustered around campaign trigger events $T_{\text{center}}$ with standard deviation $\sigma = \frac{\text{duration}}{2.5}$:
   $$t \sim \mathcal{N}\left(T_{\text{center}}, \sigma^2\right)$$

3. **Periodic Automation Crons (`sample_periodic_timeline`):**
   Fixed interval schedule $\Delta t$ with minimal jitter $\delta \in [-\epsilon, +\epsilon]$:
   $$t_{k+1} = t_k + \Delta t + \text{Uniform}(-\epsilon, \epsilon)$$

### 6-Stage Geopolitical Information Operation Model (`generation/geopolitical.py`)

The extreme campaign scenario simulates an end-to-end information operation across six progressive stages:

```
[Stage 1: Narrative Seeding]
   Whistleblower drop & technical telemetry memos (vanguardleaks.cc)
         │
         ▼
[Stage 2: Breaking Amplification]
   Automated wire alerts & coordinated hashtag pushes (#KestrelDisaster)
         │
         ▼
[Stage 3: Manufactured Grassroots]
   Astroturfed citizen outrage & emotional localized appeals
         │
         ▼
[Stage 4: Counter-Narrative Attack]
   Discrediting official press releases & attacking fact-checkers
         │
         ▼
[Stage 5: Geopolitical Escalation]
   Diplomatic protests, trade sanctions, and Treaty of Oakhaven violations
         │
         ▼
[Stage 6: Persistent Reinforcement]
   Permanent decentralized dossier archiving & petition mobilization
```

---

## 5. Analytical Forensic Engine (`social_vector/analysis/`)

The analytical engine executes an observable 9-stage pipeline that ingests raw observation data and produces structured intelligence dossiers.

```
                           +----------------------------------------------------+
                           |             RAW OBSERVATION DATASET                |
                           +-------------------------+--------------------------+
                                                     |
                                  Stage 1: Ingestion & Scoping
                                                     |
                                  Stage 2: Tokenization & Normalization
                                                     |
                                  Stage 3: Semantic Embedding (TF-IDF + SVD)
                                                     |
                                  Stage 4: Temporal Burst Detection
                                                     |
                                  Stage 5: Content Reuse & Domain Inverted Index
                                                     |
                                  Stage 6: Behavioral Demographic Outliers
                                                     |
                                  Stage 7: Multi-Signal DBSCAN Clustering
                                                     |
                                  Stage 8: NetworkX Relational Graph Topology
                                                     |
                                  Stage 9: Signal Fusion & Evidence Dossier
                                                     |
                           +-------------------------v--------------------------+
                           |          STRUCTURED INVESTIGATION DOSSIER          |
                           +----------------------------------------------------+
```

### Stage-by-Stage Breakdown

#### Stage 1: Dataset Ingestion & Scoping (`analysis/ingestion.py`)
- Resolves dataset paths across root and standard directories (`datasets/`, `user_generated_datasets/`).
- Deserializes JSON into typed `SocialDataset` models.
- Applies analytical scoping:
  - `AnalysisScope.DATASET`: Evaluates the entire corpus.
  - `AnalysisScope.USER`: Filters posts to a specific target user.
  - `AnalysisScope.FEED`: Evaluates user feed timelines.

#### Stage 2: Tokenization & Normalization (`analysis/preprocessing.py`)
- Canonicalizes post text (removes URLs, handles, hashtags, extra whitespace, lowercases).
- Extracts registered domain hostnames from URLs (`extract_domain`).
- Normalizes hashtags and mentions.
- Parses ISO 8601 strings into 64-bit float UNIX epochs.
- Constructs inverted user-to-post, user-to-domain, and user-to-hashtag indices.

#### Stage 3: Semantic Embedding & Narrative Alignment (`analysis/features/embeddings.py`)
- **Word N-gram TF-IDF:** Vectorizes cleaned texts using unigrams and bigrams (`ngram_range=(1,2)`, `sublinear_tf=True`, `max_features=4000`).
- **Dense Latent Semantic Reduction (TruncatedSVD):** Reduces high-dimensional sparse TF-IDF vectors into a 384-dimensional dense semantic space using randomized SVD:
  $$X_{\text{dense}} = \text{TruncatedSVD}(n=64)(X_{\text{tfidf}})$$
  Padded or truncated to 384 dimensions to ensure uniform vector representations.
- **L2 Normalization:**
  $$\hat{\mathbf{v}}_i = \frac{\mathbf{v}_i}{\|\mathbf{v}_i\|_2}$$
- **Vectorized Pairwise Cosine Similarity:** Computes the full similarity matrix $S = \hat{V} \hat{V}^T$ and extracts upper-triangle candidate pairs exceeding the similarity threshold (default $\tau = 0.78$).
- Tracks pairwise cross-account maximum narrative similarity $\text{sim}(u_a, u_b)$.

#### Stage 4: Temporal Burst & Synchronization Analysis (`analysis/features/temporal.py`)
- **Sliding-Window Spike Detector:** Sweeps sorted timestamps with a sliding window of width $W = 300\text{s}$.
- Identifies synchronized bursts containing $\ge 3$ posts across $\ge 3$ distinct accounts.
- Computes:
  - `synchronization_ratio`: Fraction of all posts belonging to synchronized burst windows.
  - `max_burst_density`: Peak posts-per-minute rate within any detected burst:
    $$\text{Density}_{\text{ppm}} = \left( \frac{\text{Post Count}}{\Delta t_{\text{seconds}}} \right) \times 60$$
  - `synchronized_user_pairs`: Pairwise co-occurrence frequency within shared bursts.
  - `timeline_bins`: Uniformly binned time-series histogram with burst event flags.

#### Stage 5: Verbatim Content Reuse & Infrastructure Sharing (`analysis/features/content.py`)
- **Exact Text Hash Fingerprinting:** Computes SHA-256 digests over normalized text to isolate exact copypasta duplicate groups across multiple distinct accounts.
- **Bipartite Domain Inverted Index:** Maps outbound URLs to domains, isolating domains amplified by $\ge 2$ distinct users and computing pairwise domain overlaps.
- **Coordinated Hashtag Overlap:** Maps hashtag co-occurrences across participant groups.

#### Stage 6: Account Demographics & Behavioral Profiling (`analysis/features/behavior.py`)
- **Registration Batching Metric:** Measures the maximum fraction of total accounts created within a rolling 48-hour window:
  $$\text{Score}_{\text{creation}} = \frac{\max_{\Delta t \le 48\text{h}} (\text{Accounts Created})}{N_{\text{users}}}$$
- **Client Homogeneity:** Measures the concentration of identical automation clients:
  $$\text{Score}_{\text{client}} = \frac{\max_{c} (\text{Count}(c))}{N_{\text{users}}}$$
- **Follower Asymmetry:** Evaluates following-to-follower ratios to detect automated amplification bots:
  $$\text{Ratio}_u = \frac{\text{Following}_u + 1}{\text{Followers}_u + 1}$$

#### Stage 7: Multi-Signal DBSCAN Clustering (`analysis/clustering/dbscan.py`)
To discover coordinated groups without relying solely on text or timing, SocialVector constructs a **precomputed composite distance matrix**:

$$S_{\text{composite}} = 0.50 \cdot S_{\text{semantic}} + 0.30 \cdot (1.0 - D_{\text{temporal}}) + 0.10 \cdot S_{\text{domain}} + 0.10 \cdot S_{\text{hashtag}}$$

$$D_{\text{composite}} = \text{clip}\left(1.0 - S_{\text{composite}}, 0.0, 1.0\right)$$

Where:
- $S_{\text{semantic}}$ is the pairwise cosine similarity matrix.
- $D_{\text{temporal}} = \min\left(1.0, \frac{|t_i - t_j|}{W_{\text{cluster}}}\right)$ with $W_{\text{cluster}} = 3600\text{s}$.
- $S_{\text{domain}}, S_{\text{hashtag}} \in \{0.0, 1.0\}$ denote shared domain and hashtag indicators.

**Clustering Execution & Pruning:**
- Executes `DBSCAN(eps=0.38, min_samples=3, metric="precomputed")`.
- Noise samples ($label = -1$) are separated.
- **Multi-Account Filter:** Clusters containing only a single user are filtered out (isolated as personal posting rather than coordination).
- Computes intra-cluster cohesion, dominant hashtags, shared domains, temporal duration, and coordination signatures.

#### Stage 8: Relational Network Graph Builder (`analysis/graph/builder.py`)
Constructs a heterogeneous NetworkX relational graph topology:
- **Node Types:** `user` (with verified status and follower counts), `domain` (with sharer count), `cluster` (with cohesion score).
- **Edge Types:**
  - `shared_domain`: Connects users to shared infrastructure domains.
  - `co_cluster`: Connects participating users to their coordination cluster node.
  - `semantic_similarity`: Connects user pairs exhibiting cosine similarity $\ge 0.78$.
  - `temporal_burst`: Connects user pairs co-occurring in $\ge 2$ synchronized burst windows.
- Calculates overall graph density:
  $$\text{Density}(G) = \frac{2 |E|}{|V|(|V| - 1)}$$

#### Stage 9: Signal Fusion & Risk Scoring (`analysis/scoring/fusion.py`, `evaluators.py`)
Combines six normalized signal scores $s_i \in [0, 1]$ using configurable weights:

$$\text{Score}_{\text{overall}} = \frac{\sum_{i=1}^6 w_i \cdot s_i}{\sum_{i=1}^6 w_i}$$

| Signal ID | Name | Default Weight | Key Metrics Evaluated |
|---|---|---|---|
| `semantic_similarity` | Semantic Narrative Alignment | 0.25 | Strong pairwise cosine similarity ratio, mean similarity |
| `temporal_coordination` | Temporal Synchronization | 0.20 | Burst post synchronization ratio, peak burst density (ppm) |
| `content_reuse` | Verbatim Text Repetition | 0.20 | Multi-account SHA-256 duplicate ratio |
| `domain_infrastructure`| Shared Domain Infrastructure | 0.15 | Non-benign campaign domain count, bipartite co-links |
| `hashtag_coordination` | Hashtag Convergence | 0.10 | Shared campaign hashtag co-occurrence |
| `behavioral_anomaly`   | Behavioral & Persona Outliers | 0.10 | Registration batching, client homogeneity, follower asymmetry |

**Calibrated Confidence Tiers:**

```
+---------------------------------------------------------------------------------------------------+
| Overall Score & Cluster Criteria                                | Calibrated Assessment           |
+-----------------------------------------------------------------+---------------------------------+
| Score >= 0.50 AND Clusters >= 1 AND (High Temp OR High Infra)   | high_confidence_coordinated_... |
| Score >= 0.30 OR Clusters >= 1                                  | moderate_coordination_potential |
| Clusters == 0 AND Temp Score < 0.20                             | low_suspicion_organic_simila... |
| Score < 0.30 AND Clusters == 0                                  | low_suspicion_organic           |
+---------------------------------------------------------------------------------------------------+
```

---

## 6. REST API Server Architecture (`social_vector/server/app.py`)

The REST backend is built on **FastAPI** and provides asynchronous job execution, status polling, and real-time Server-Sent Events (SSE) streaming for web investigation frontends.

```
 Client (Web App / CLI)                     FastAPI Server                    ThreadPoolExecutor
         │                                        │                                   │
         ├────── POST /api/analysis/stream ───────►                                   │
         │                                        ├──── Submit Pipeline Task ────────►│
         │                                        │                                   │ (Stage 1: Ingest)
         │◄───── SSE: {"type": "stage", ...} ─────┤◄─── Progress Callback ────────────┤
         │                                        │                                   │ (Stage 2: Preproc)
         │◄───── SSE: {"type": "stage", ...} ─────┤◄─── Progress Callback ────────────┤
         │                      ...               │                 ...               │
         │                                        │                                   │ (Stage 9: Fusion)
         │◄───── SSE: {"type": "result", ...} ────┤◄─── Final AnalysisResult ─────────┤
         │◄───── SSE: __DONE__ ───────────────────┤                                   │
```

### API Route Reference

| Method | Endpoint | Description | Payload / Response |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck and engine version | `{ status, service, version, schema_version }` |
| `POST` | `/api/analysis` | Launch background analysis job | Body: `{ dataset_id, scope, target_id, threshold, eps, min_samples }` |
| `GET/POST`| `/api/analysis/stream`| Live SSE pipeline stream | Yields `data: {"type": "stage" \| "result" \| "error"}` |
| `GET` | `/api/analysis/{id}` | Poll analysis job status | `{ analysis_id, status, stages, created_at, completed_at }` |
| `GET` | `/api/analysis/{id}/results` | Fetch complete analysis result | Full `AnalysisResult` JSON dossier |
| `GET` | `/api/analysis/{id}/evidence` | Fetch structured evidence items | `{ evidence: List[EvidenceItem] }` |
| `GET` | `/api/analysis/{id}/graph` | Fetch NetworkX graph data | `{ nodes, edges, density, node_count, edge_count }` |

---

## 7. Command Line Interface (`social_vector/cli/`)

The `sv` command-line utility provides terminal-based dataset generation, inspection, and forensic analysis:

```bash
# 1. Generate a deterministic dataset
sv generate-dataset \
    --scenario extreme_information_operation \
    --content-profile extreme \
    --users 500 \
    --posts-per-user 6 \
    --seed 2026 \
    --campaign-ratio 0.20 \
    -o dataset_extreme.json

# 2. Inspect and validate dataset schema & referential integrity
sv inspect-dataset dataset_extreme.json -v

# 3. List all registered scenarios and analytical goals
sv list-scenarios

# 4. Run full forensic coordination analysis with terminal report
sv analyze dataset dataset_extreme.json

# 5. Export structured forensic investigation dossier to JSON
sv analyze dataset dataset_extreme.json --json -o investigation_dossier.json

# 6. Stream live pipeline stage execution to terminal
sv analyze dataset dataset_extreme.json --stream

# 7. Analyze an individual suspect account or feed timeline
sv analyze user dataset_extreme.json usr_io_000001
sv analyze feed dataset_extreme.json
```

---

## 8. Mathematical & Algorithmic Summary

| Algorithm / Metric | Mathematical Formulation | Location in Code |
|---|---|---|
| **Deterministic Seed Derivation** | $S = \text{int}(\text{SHA-256}(M \parallel \text{':'} \parallel D \parallel \text{':'} \parallel I)[:8], 16)$ | `generation/seed.py:derive_seed` |
| **Circadian Diurnal Weight** | $W(h) = (1 - f) W_{\lfloor h \rfloor} + f W_{\lfloor h \rfloor + 1}$ | `generation/temporal.py:diurnal_weight` |
| **Follower Pareto Distribution** | $F = \lfloor 20 + \text{Pareto}(\alpha=1.8) \times 45 \rfloor$ | `generation/personas.py:generate_user_persona` |
| **TF-IDF + TruncatedSVD** | $\mathbf{v} = \text{TruncSVD}_{64}\Big(\text{TF-IDF}_{\text{sublinear}}(T)\Big)$ | `analysis/features/embeddings.py:extract_features` |
| **L2 Normalization** | $\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2}$ | `analysis/features/embeddings.py:extract_features` |
| **Sliding-Window Burst Density** | $\text{Density}_{\text{ppm}} = \frac{N_{\text{posts}}}{\Delta t_{\text{seconds}}} \times 60$ | `analysis/features/temporal.py:extract_features` |
| **Composite Distance Matrix** | $D = 1 - \big(0.50 S_{\text{sem}} + 0.30(1 - D_{\text{temp}}) + 0.10 S_{\text{dom}} + 0.10 S_{\text{hash}}\big)$ | `analysis/clustering/dbscan.py:cluster` |
| **DBSCAN Clustering** | $\text{DBSCAN}(\text{metric}=\text{"precomputed"}, \varepsilon=0.38, \text{min}=3)$ | `analysis/clustering/dbscan.py:cluster` |
| **Graph Density** | $\text{Density}(G) = \frac{2|E|}{|V|(|V| - 1)}$ | `analysis/graph/builder.py:build_graph` |
| **Weighted Signal Fusion** | $\text{Score} = \frac{\sum w_i s_i}{\sum w_i}$ | `analysis/scoring/fusion.py:fuse_signals_and_generate_evidence` |

---

## 9. Verification & Test Suite Coverage (`tests/`)

The Python backend is validated by 48 comprehensive tests across 16 test modules:

- `test_schema.py` & `test_validation_deep.py`: Model serialization, round-trip fidelity, integrity checks, and ground-truth anti-leak verification.
- `test_seed_determinism.py` & `test_determinism_full.py`: Bitwise reproducible cross-run dataset verification.
- `test_personas.py` & `test_temporal.py`: Demographic distributions, Pareto metrics, diurnal rejection sampling, burst window generation.
- `test_templates.py`, `test_longform_content.py`, `test_extreme_profile.py`: Multi-sentence framing, length tier constraints, 6-stage geopolitical transitions.
- `test_scenarios_organic.py` & `test_scenarios_coordinated.py`: Scenario execution and ground-truth builder verification.
- `test_analysis_preprocessing.py`, `test_analysis_semantic.py`, `test_analysis_temporal.py`, `test_analysis_content.py`, `test_analysis_clustering.py`, `test_analysis_pipeline.py`: Comprehensive coverage of all 9 analytical stages.
- `test_server_api.py`: FastAPI endpoint status codes, SSE streaming, and background worker queues.
- `test_cli.py` & `test_cli_analyze.py`: CLI arguments, exit codes, and output formatting.
- `test_performance.py`: High-volume processing benchmark verifying execution times stay within bounds without cloud resources.

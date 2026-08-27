# SocialVector Analytical Engine

SocialVector provides a canonical, local-first forensic analysis pipeline designed to detect, cluster, and evaluate coordinated information operations, inauthentic amplification campaigns, and astroturfed social feeds.

The analytical engine is implemented in Python and exposed via both the `sv` Command Line Interface (CLI) and an integrated REST API for web-based investigation workflows.

---

## Analytical Architecture

The pipeline consists of 9 sequential, observable stages that ingest unannotated observation data and produce structured investigation dossiers.

```
+--------------------------------------------------------+
|                   Observation Dataset                  |
+---------------------------+----------------------------+
                            |
              1. Ingestion & Scoping
                            |
              2. Preprocessing & Normalization
                            |
              3. Semantic Embedding (TF-IDF + SVD)
                            |
              4. Temporal Burst & Synchronization
                            |
              5. Content Duplication & Domain Sharing
                            |
              6. Behavioral & Account Profiling
                            |
              7. Multi-Signal DBSCAN Clustering
                            |
              8. NetworkX Relational Graph Builder
                            |
              9. Signal Fusion & Honest Risk Scoring
                            |
+---------------------------v----------------------------+
|         Structured Investigation Dossier (JSON)        |
+--------------------------------------------------------+
```

---

## Detection Signals & Algorithms

### 1. Semantic Similarity (`semantic_similarity`)
- **Methodology:** Multi-scale word n-gram TF-IDF vectorization with randomized Singular Value Decomposition (SVD) dimensionality reduction to produce L2-normalized dense embeddings.
- **Pairwise Metrics:** Vectorized cosine similarity computation across all cross-account post pairs.
- **Coordination Indicator:** Elevated narrative convergence across distinct accounts exceeding baseline topical cohesion.

### 2. Temporal Coordination (`temporal_coordination`)
- **Methodology:** Sliding-window timestamp burst detection ($W = 300\text{s}$) to identify synchronized multi-account posting spikes.
- **Pairwise Metrics:** Cross-account co-occurrence frequency within identified burst windows.
- **Coordination Indicator:** High burst density and statistically improbable cross-account synchronization ratios.

### 3. Verbatim Content Reuse (`content_reuse`)
- **Methodology:** Normalized text canonicalization and SHA-256 fingerprinting to index exact duplicate templates.
- **Coordination Indicator:** Repetitive copypasta amplification and verbatim messaging across distinct account identifiers.

### 4. Domain & Infrastructure Sharing (`domain_sharing`)
- **Methodology:** URL canonicalization and second-level domain extraction with inverted index bipartite mapping.
- **Coordination Indicator:** Narrow set of external propaganda or discreditation domains amplified by coordinated account clusters.

### 5. Hashtag Synchronization (`hashtag_coordination`)
- **Methodology:** Extraction and co-occurrence tracking of campaign hashtags across multiple authors.
- **Coordination Indicator:** Rapid artificial amplification of unified political or smear tags.

### 6. Behavioral & Persona Outliers (`behavioral_anomaly`)
- **Methodology:** Batch account creation temporal clustering, device client distribution homogeneity, and follower-to-following ratio asymmetry analysis.
- **Coordination Indicator:** Mass-registered burner accounts utilizing identical automated API clients.

---

## Multi-Signal DBSCAN Clustering

Rather than clustering on raw text or single feature vectors, SocialVector builds a **precomputed composite distance matrix** integrating four normalized distance components:

$$D_{\text{composite}} = 1.0 - \left( 0.50 \cdot S_{\text{semantic}} + 0.30 \cdot (1.0 - D_{\text{temporal}}) + 0.10 \cdot S_{\text{domain}} + 0.10 \cdot S_{\text{hashtag}} \right)$$

- **Algorithm:** Density-Based Spatial Clustering of Applications with Noise (DBSCAN) with `metric='precomputed'`, default $\varepsilon = 0.38$, $\text{min\_samples} = 3$.
- **Filtering:** Noise samples labeled as `-1` are isolated; single-author clusters are pruned to ensure discovered clusters represent true multi-account coordination.

---

## Signal Fusion & Confidence Assessment

Individual signal scores $s_i \in [0, 1]$ are weighted and combined:

$$\text{Score}_{\text{coordination}} = \sum_{i} w_i \cdot s_i$$

### Honest Classification & Calibration

The system evaluates both the composite score and structural cluster convergence to prevent false positives on organic viral events:

| Classification | Score Threshold | Cluster Requirement | Description |
|---|---|---|---|
| `high_confidence_coordinated_operation` | >= 0.70 | >= 1 cluster | Multi-signal convergence with clear cluster formations |
| `moderate_suspicion_coordination` | >= 0.45 | >= 1 cluster | Observable coordination signals warranting further review |
| `elevated_organic_similarity` | >= 0.40 | 0 clusters | Topical convergence without multi-account coordination |
| `organic_activity` | < 0.40 | 0 clusters | Typical baseline organic discourse |

---

## CLI Analysis Commands

```bash
# Analyze full dataset
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json

# Output structured JSON result
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json --json -o dossier.json

# Live stream observable pipeline stages
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json --stream

# Analyze specific target user persona
sv analyze user datasets/sample_extreme_geopolitical_operation.json usr_whistleblower_01

# Analyze specific target feed scope
sv analyze feed datasets/sample_extreme_geopolitical_operation.json

# Tune clustering and similarity thresholds
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json --threshold 0.85 --eps 0.35 --min-samples 4
```

---

## API Endpoints

The analytical engine is available over REST via FastAPI and Vite API middleware:

| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/api/analysis/stream` | Stream real-time stage progress and final analysis dossier via Server-Sent Events (SSE) |
| `POST` | `/api/analysis` | Execute analytical pipeline synchronously over dataset, user, or feed scope |
| `GET` | `/api/analysis/:id/results` | Retrieve completed analysis result and dossier |
| `GET` | `/api/analysis/:id/evidence` | Retrieve categorized evidence items |
| `GET` | `/api/analysis/:id/graph` | Retrieve relational NetworkX network topology |

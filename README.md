# SocialVector

SocialVector is an offline social-media observation, dataset generation, and forensic analysis platform designed for cybersecurity research, coordinated information operation detection, and narrative signal modeling.

---

## Core Capabilities

- **Canonical Analytical Engine:** Integrated multi-signal coordination analysis pipeline detecting semantic narrative alignment, temporal synchronization, verbatim repetition, infrastructure sharing, and behavioral anomalies.
- **Precomputed DBSCAN Clustering:** Multi-dimensional metric fusion clustering cross-account activities without ground-truth contamination.
- **Observable 9-Stage Pipeline:** Transparent stage execution reporting timing, metrics, parameters, and structured investigation dossiers.
- **Social Exploration Frontend:** Interactive web application for exploring feeds, user timelines, and campaign investigation dossiers with dual themes (*Professional* and *Hacker*).
- **Deterministic Dataset Generation:** Mathematically reproducible synthetic social-media feeds powered by seeded PRNG streams.
- **Multi-Stage Geopolitical Simulation:** Fictional 6-stage information operation scenarios with heterogeneous actor roles and narrative escalation.
- **Relational Network Topology:** NetworkX graph construction modeling accounts, shared campaign domains, and coordination clusters.
- **Offline-First & Local:** Zero cloud dependencies, zero external network calls, and zero external LLM API requirements.

---

## Installation & Setup

### Python Environment (Analytical Engine & CLI)

```bash
# Clone the repository
git clone https://github.com/mano-rp/social-vector.git
cd social-vector

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package with analytical and development dependencies
pip install -e ".[dev]"
```

### Frontend Application

```bash
# Navigate to frontend directory and install dependencies
cd frontend
npm install
```

---

## Quick Start

### 1. Run Analytical Pipeline via CLI

```bash
# Analyze a sample information operation dataset
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json

# Export structured investigation dossier as JSON
sv analyze dataset datasets/sample_extreme_geopolitical_operation.json --json -o dossier.json

# Analyze target user or feed
sv analyze user datasets/sample_extreme_geopolitical_operation.json usr_whistleblower_01
sv analyze feed datasets/sample_extreme_geopolitical_operation.json
```

### 2. Launch the Web Application

```bash
# From the repository root or frontend/ directory
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser to:
- Inspect coordinated campaign feeds and user accounts.
- Launch the observable **Analysis Lab** and trigger live analytical pipeline runs.
- Explore the **Campaign Investigation Workspace** with interactive cluster dossiers, evidence logs, and relational graph topology.
- Generate new deterministic datasets via the interactive generator modal.

### 3. Generate Synthetic Datasets

```bash
# List available scenarios
sv list-scenarios

# Generate an extreme geopolitical operation dataset
sv generate-dataset --scenario extreme_information_operation --users 500 --seed 2026 -o dataset_extreme.json

# Inspect and validate dataset schema
sv inspect-dataset dataset_extreme.json
```

---

## Pre-Generated Sample Datasets

The repository includes deterministic sample datasets in the `datasets/` directory:

| Dataset File | Scenario | Users | Posts | Description |
|---|---|---|---|---|
| `datasets/sample_extreme_geopolitical_operation.json` | `extreme_information_operation` | 500 | 2,953 | 6-stage fictional geopolitical information operation |
| `datasets/sample_coordinated_campaign.json` | `coordinated_campaign` | 1,000 | 5,791 | Large overt campaign with synchronized bursts |
| `datasets/sample_paraphrased_coordination.json` | `paraphrased_coordination` | 50 | 284 | Subtle semantic paraphrasing operation |
| `datasets/sample_false_positive_organic.json` | `organic_topical_similarity` | 50 | 200 | Organic viral breaking-event benchmark |
| `datasets/sample_organic_small.json` | `organic_activity` | 10 | 36 | Small organic baseline feed |

---

## Running Tests

### Python Analytical Backend & Generator Tests

```bash
# Run 48 unit and integration tests
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Documentation

- [Analytical Engine & Detection Signals Guide](docs/analysis.md)
- [Frontend Architecture & Investigation Workspace](docs/frontend.md)
- [Dataset Schema Specification](docs/schema.md)
- [Dataset Generation Architecture](docs/generation.md)
- [Scenarios Guide](docs/scenarios.md)
- [CLI Reference](docs/cli.md)

---

## License

Apache-2.0

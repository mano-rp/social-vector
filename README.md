# SocialVector

SocialVector is an offline social-media observation, dataset generation, and investigation system designed for cybersecurity research, forensic signal modeling, and information operation analysis.

---

## Core Capabilities

- **Social Exploration Frontend:** Interactive web application for exploring synthetic social-media feeds, user timelines, and observation datasets with dual themes (*Professional* and *Hacker*).
- **Deterministic Dataset Generation:** Generates synthetic social-media feeds with mathematical reproducibility using seeded PRNG streams.
- **Configurable Content Profiles:** Supports `standard`, `realistic`, and `extreme` content profiles generating semantically coherent multi-sentence posts of variable length.
- **Multi-Stage Geopolitical Simulation:** Includes a high-intensity fictional information operation scenario modeling 6 temporal campaign stages, heterogeneous actor roles (whistleblower seeds, state media, astroturf citizens, counter-narrative attackers, geopolitical analysts), and narrative escalation.
- **Strict Ground-Truth Isolation:** Observable social feeds are cleanly separated from generator ground truth.
- **Scenario-Driven Simulation:** Includes pre-built scenarios for baseline organic activity, overt synchronized bot campaigns, subtle semantic paraphrasing operations, viral false-positive benchmarks, and extreme geopolitical information operations.
- **Offline-First:** Completely independent of cloud APIs, external network services, and online language model endpoints.

---

## Installation & Setup

### Python Environment (CLI & Generator)

```bash
# Clone the repository
git clone https://github.com/mano-rp/social-vector.git
cd social-vector

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package and development tools
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

### 1. Launch the Frontend Web Interface

```bash
# From the frontend directory
npm run dev
```

Open `http://localhost:5173` in your browser. From the UI, you can:
- Explore pre-bundled sample datasets (e.g. *Extreme Geopolitical Information Operation*).
- Browse chronological social feeds and read long-form posts.
- Inspect individual user profiles and feeds.
- Configure and generate new synthetic datasets using the built-in generator modal.
- Launch feed and dataset analysis workflows.
- Switch between **Professional** (light) and **Hacker** (dark/cyan) themes.

### 2. Command-Line Interface (CLI)

```bash
# List available generation scenarios
sv list-scenarios

# Generate an organic baseline dataset
sv generate-dataset --scenario organic --content-profile realistic --users 50 --seed 42 -o dataset_organic.json

# Generate an extreme multi-stage geopolitical operation dataset
sv generate-dataset --scenario extreme_information_operation --users 500 --seed 2026 -o dataset_extreme.json

# Inspect and validate a dataset
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

### Python Backend & Generation Tests

```bash
# Run pytest test suite
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Frontend Architecture & UI Guide](docs/frontend.md)
- [Dataset Schema Specification](docs/schema.md)
- [Dataset Generation Architecture](docs/generation.md)
- [Scenarios Guide](docs/scenarios.md)
- [CLI Reference](docs/cli.md)

---

## License

Apache-2.0
